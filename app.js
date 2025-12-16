// ================= STORAGE =================
const STORAGE_KEY = 'bolao-votes';
const USER_VOTES_KEY = 'bolao-user-votes';
const AUTH_KEY = 'bolao-username';

// ================= STATE =================
let games = [];
let userVotes = {};
let username = null;

// ================= INIT =================
function init() {
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

  loadData();
  updateAllOdds();
  renderGames();
}

function login() {
  const input = document.getElementById('username-input');
  const name = input.value.trim();

  if (!name) return alert('Digite um nome');

  username = name;
  localStorage.setItem(AUTH_KEY, username);

  input.value = '';
  init();
}

function logout() {
  if (!confirm('Deseja sair e entrar com outro nome?')) return;

  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_VOTES_KEY);

  username = null;
  userVotes = {};

  document.getElementById('auth-modal').style.display = 'flex';
  document.getElementById('user-bar').style.display = 'none';
  document.getElementById('games-list').innerHTML = '';

  const input = document.getElementById('username-input');
  if (input) input.value = '';
}

// ================= LOAD / SAVE =================
function loadData() {
  const savedGames = localStorage.getItem(STORAGE_KEY);
  const savedUserVotes = localStorage.getItem(USER_VOTES_KEY);

  if (savedGames) {
    const parsed = JSON.parse(savedGames);
    games = initialGames.map(game => {
      const saved = parsed.find(g => g.id === game.id);
      return saved ? { ...game, ...saved } : game;
    });
  } else {
    games = [...initialGames];
  }

  if (savedUserVotes) {
    userVotes = JSON.parse(savedUserVotes);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  localStorage.setItem(USER_VOTES_KEY, JSON.stringify(userVotes));
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
  const minOdd = 1.10;
  const maxOdd = 30.00;

  const totalVotes = game.homeVotes + game.drawVotes + game.awayVotes;

  if (totalVotes === 0) {
    const baseOdd = maxOdd - (0.33 * (maxOdd - minOdd));
    game.odds.home = baseOdd.toFixed(2);
    game.odds.draw = baseOdd.toFixed(2);
    game.odds.away = baseOdd.toFixed(2);
    return;
  }

  function calc(votes) {
    const percent = votes / totalVotes;
    const odd = maxOdd - (percent * (maxOdd - minOdd));
    return odd.toFixed(2);
  }

  game.odds.home = calc(game.homeVotes);
  game.odds.draw = calc(game.drawVotes);
  game.odds.away = calc(game.awayVotes);
}

function updateAllOdds() {
  games.forEach(game => calculateOdds(game));
}

// ================= VOTE (TOGGLE) =================
function vote(gameId, type) {
  if (!username) return alert('Faça login primeiro');

  const userKey = `${username}-${gameId}`;
  const game = games.find(g => g.id === gameId);

  if (userVotes[userKey] === type) {
    game[`${type}Votes`]--;
    delete userVotes[userKey];
  } else if (userVotes[userKey]) {
    return alert('Remova o voto atual para escolher outro.');
  } else {
    game[`${type}Votes`]++;
    userVotes[userKey] = type;
  }

  updateAllOdds();
  saveData();
  renderGames();
}

// ================= RENDER =================
function renderPlayer(player, game, type) {
  const userKey = `${username}-${game.id}`;
  const voted = userVotes[userKey] === type ? 'voted' : '';

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
  const userKey = `${username}-${game.id}`;
  const voted = userVotes[userKey] === 'draw' ? 'voted' : '';

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
function renderGameCard(game, index) {
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
function getRanking() {
  const rankingMap = {};

  games.forEach(game => {
    const home = game.homePlayer.name;
    const away = game.awayPlayer.name;

    rankingMap[home] = (rankingMap[home] || 0) + game.homeVotes;
    rankingMap[away] = (rankingMap[away] || 0) + game.awayVotes;
  });

  return Object.entries(rankingMap)
    .map(([name, votes]) => ({ name, votes }))
    .sort((a, b) => b.votes - a.votes);
}
function renderRanking() {
  const ranking = getRanking();
  const container = document.getElementById('ranking-list');

  if (!container) return;

  if (ranking.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;color:#888;">Sem votos ainda</p>';
    return;
  }

  container.innerHTML = ranking.map((item, index) => {
    let positionHTML = `${index + 1}º`;
    let medalClass = '';

    if (index === 0) {
      positionHTML = '🥇';
      medalClass = 'medal gold';
    } else if (index === 1) {
      positionHTML = '🥈';
      medalClass = 'medal silver';
    } else if (index === 2) {
      positionHTML = '🥉';
      medalClass = 'medal bronze';
    }

    return `
      <div class="ranking-item">
        <div class="ranking-left">
          <span class="ranking-position ${medalClass}">
            ${positionHTML}
          </span>
          <span class="ranking-name">${item.name}</span>
        </div>
        <span class="ranking-votes">${item.votes} votos</span>
      </div>
    `;
  }).join('');
}

function renderGames() {
  document.getElementById('games-list').innerHTML =
    games.map(renderGameCard).join('');

  renderRanking();
}


// ================= START =================
document.addEventListener('DOMContentLoaded', init);
