// Player photos
const playerPhotos = {
  gustavinho: './images/gustavinho.png',
  gustha: './images/gustha.png',
  higor: './images/higor.png',
  igor: './images/igor.png',
  leandro: './images/leandro.png',
  lipe: './images/lipe.png',
  robert: './images/robert.png',
  wallacy: './images/wallacy.png',
  xavier: './images/xavier.png',
  zago: './images/zago.png'
};

// Initial games data
const initialGames = [
  {
    id: 1,
    homePlayer: { name: 'WALLACY', photo: playerPhotos.wallacy },
    awayPlayer: { name: 'XAVIER Abusado', photo: playerPhotos.xavier },
    prize: '$200',
    homeVotes: 0,
    drawVotes: 0,
    awayVotes: 0,
    odds: { home: 3.0, draw: 3.0, away: 3.0 }
  },
  {
    id: 2,
    homePlayer: { name: 'HIGOR', photo: playerPhotos.higor },
    awayPlayer: { name: 'IGOR', photo: playerPhotos.igor },
    prize: '$100',
    homeVotes: 0,
    drawVotes: 0,
    awayVotes: 0,
    odds: { home: 3.0, draw: 3.0, away: 3.0 }
  },
  {
    id: 3,
    homePlayer: { name: 'GUSTAVINHO', photo: playerPhotos.gustavinho },
    awayPlayer: { name: 'LIPE', photo: playerPhotos.lipe },
    prize: '$20',
    homeVotes: 0,
    drawVotes: 0,
    awayVotes: 0,
    odds: { home: 3.0, draw: 3.0, away: 3.0 }
  },
  {
    id: 4,
    homePlayer: { name: 'LEANDRO', photo: playerPhotos.leandro },
    awayPlayer: { name: 'ROBERT', photo: playerPhotos.robert },
    prize: '$100',
    homeVotes: 0,
    drawVotes: 0,
    awayVotes: 0,
    odds: { home: 3.0, draw: 3.0, away: 3.0 }
  },
  {
    id: 5,
    homePlayer: { name: 'ZAGO', photo: playerPhotos.zago },
    awayPlayer: { name: 'GUSTHA', photo: playerPhotos.gustha },
    prize: '$450',
    homeVotes: 0,
    drawVotes: 0,
    awayVotes: 0,
    odds: { home: 3.0, draw: 3.0, away: 3.0 }
  }
];
