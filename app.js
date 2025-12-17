// ================= SUPABASE =================
const SUPABASE_URL = 'https://esmctdmmkfzozjawclux.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbWN0ZG1ta2Z6b3pqYXdjbHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDE0OTUsImV4cCI6MjA4MTQ3NzQ5NX0.UhIwVIwVUWOtwWI_VfLmHYResqnKKK_8LGB0aE-5H3o';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= STATE =================
const AUTH_KEY = 'bolao-username';

let games = [];
let username = null;
let votes = []; // votos do banco

// ================= INIT =================
async function init() {
  username = localStorage.getItem(AUTH_KEY);

  if (!username) {
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('user-bar').style.display = 'none';
    document.getElementById('games-list').innerHTML = '';
    return;
  }

  document.getElementById('auth-modal').style.display = 'none';
  document.getElementById('user-bar').style.display = 'flex';
  document.getElementById('username-label').innerText = `Olá, ${username}`;

  games = JSON.parse(JSON.stringify(initialGames));

  await loadVotes();
  updateAllOdds();
  renderGames();
}

// ================= LOGIN =================
function login() {
  const input = document.getElementById('username-input');
  const name = input.value.trim();

  if (!name) return alert('Digite um nome');

  username = name;
  localStorage.setItem(AUTH_KEY, username);

  input.value = '';
  init();
}
window.login = login;

function logout() {
  if (!confirm('Deseja sair e entrar com outro nome?')) return;

  localStorage.removeItem(AUTH_KEY);
  username = null;

  document.getElementById('auth-modal').style.display = 'flex';
  document.getElementById('user-bar').style.display = 'none';
  document.getElementById('games-list').innerHTML = '';
}

// ================= LOAD VOTES =================
async function loadVotes() {
  const { data, error } = await sb.from('votes').select('*');

  if (error) {
    console.error(error);
    votes = [];
    return;
  }

  votes = data;

  // zera votos
  games.forEach(g => {
    g.homeVotes = 0;
    g.drawVotes = 0;
    g.awayVotes = 0;
  });

  // aplica votos
  votes.forEach(v => {
    const game = games.find(g => g.id === v.game_id);
    if (!game) return;
    game[`${v.vote_type}Votes`]++;
  });
}

// ================= HELPERS =================
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2);
}

function getVotePercentage(gameId, type) {
  const game = games.find(g => g.id === gameId);
  const total = game.homeVotes + game.drawVotes + game.awayVotes;
  if (!total) return 33;
  return Math.round((game[`${type}Votes`] / total) * 100);
}

// ================= ODDS =================
function calculateOdds(game) {
  const minOdd = 0.1;
  const maxOdd = 3.5;

  const total = game.homeVotes + game.drawVotes + game.awayVotes;

  function calc(votes) {
    if (!total) return (maxOdd - 0.33 * (maxOdd - minOdd)).toFixed(2);
    return (maxOdd - (votes / total) * (maxOdd - minOdd)).toFixed(2);
  }

  game.odds.home = calc(game.homeVotes);
  game.odds.draw = calc(game.drawVotes);
  game.odds.away = calc(game.awayVotes);
}

function updateAllOdds() {
  games.forEach(calculateOdds);
}

// ================= VOTE (TOGGLE) =================
async function vote(gameId, type) {
  if (!username) return alert('Faça login primeiro');

  const existing = votes.find(
    v => v.username === username && v.game_id === gameId
  );

  if (existing && existing.vote_type === type) {
    await sb.from('votes').delete().eq('id', existing.id);
  } else if (existing) {
    return alert('Remova o voto atual para escolher outro.');
  } else {
    await sb.from('votes').insert({
      username,
      game_id: gameId,
      vote_type: type
    });
  }

  await loadVotes();
  updateAllOdds();
  renderGames();
}

// ================= RENDER =================
function renderPlayer(player, game, type) {
  const voted = votes.some(
    v =>
      v.username === username &&
      v.game_id === game.id &&
      v.vote_type === type
  )
    ? 'voted'
    : '';

  const photo = player.photo
    ? `<img src="${player.photo}">`
    : `<span class="initials">${getInitials(player.name)}</span>`;

  return `
    <div class="player-section">
      <div class="player-photo">${photo}</div>
      <span class="player-name">${player.name}</span>

      <button class="vote-btn ${voted}"
        onclick="vote(${game.id}, '${type}')">
        ${getVotePercentage(game.id, type)}%
      </button>

      <small class="odd">Odd ${game.odds[type]}</small>
    </div>
  `;
}

function renderDraw(game) {
  const voted = votes.some(
    v =>
      v.username === username &&
      v.game_id === game.id &&
      v.vote_type === 'draw'
  )
    ? 'voted'
    : '';

  return `
    <div class="player-section">
      <div class="prize">${game.prize}</div>
      <span class="player-name">EMPATE</span>

      <button class="vote-btn ${voted}"
        onclick="vote(${game.id}, 'draw')">
        ${getVotePercentage(game.id, 'draw')}%
      </button>

      <small class="odd">Odd ${game.odds.draw}</small>
    </div>
  `;
}

function renderGameCard(game) {
  return `
    <div class="game-card">
      <div class="game-content">
        ${renderPlayer(game.homePlayer, game, 'home')}
        ${renderDraw(game)}
        ${renderPlayer(game.awayPlayer, game, 'away')}
      </div>
    </div>
  `;
}

// ================= RANKING =================
function getRanking() {
  const map = {};

  games.forEach(g => {
    map[g.homePlayer.name] =
      (map[g.homePlayer.name] || 0) + g.homeVotes;
    map[g.awayPlayer.name] =
      (map[g.awayPlayer.name] || 0) + g.awayVotes;
  });

  return Object.entries(map)
    .map(([name, votes]) => ({ name, votes }))
    .sort((a, b) => b.votes - a.votes);
}

function renderRanking() {
  const ranking = getRanking();
  const container = document.getElementById('ranking-list');
  if (!container) return;

  if (!ranking.length) {
    container.innerHTML =
      '<p style="text-align:center;color:#888;">Sem votos ainda</p>';
    return;
  }

  container.innerHTML = ranking
    .map(
      (item, i) => `
      <div class="ranking-item">
        <span>${i + 1}º</span>
        <span>${item.name}</span>
        <span>${item.votes} votos</span>
      </div>
    `
    )
    .join('');
}

function renderGames() {
  document.getElementById('games-list').innerHTML =
    games.map(renderGameCard).join('');
  renderRanking();
}

// ================= START =================
document.addEventListener('DOMContentLoaded', init);
