// ==========================================
// CUSTOM LOBBIES MATCHMAKER SIMULATOR
// ==========================================

const GAMES = ['arkheron', 'hockey', 'zealot'];

// Playable Eternals Database (for Arkheron)
const ETERNALS = [
  { id: 'leodin', name: 'Leodin', emoji: '🧝', role: 'Fighter', set: 'Tempest', lore: 'A swift, wind-bending swordsman who utilizes gale forces to reposition and outmaneuver adversaries.', stats: { hp: 'A', speed: 'S', damage: 'A' }, ability: { name: 'Gale Slash', desc: 'Leaps forward in a whirlwind, dealing damage and knocking up enemies for 1.5 seconds.' } },
  { id: 'rynshi', name: 'Rynshi', emoji: '🥷', role: 'Assassin', set: 'Tempest', lore: 'An aero-adept rogue who slips through shadows carried by draft winds.', stats: { hp: 'C', speed: 'S', damage: 'S' }, ability: { name: 'Aero Decoy', desc: 'Vanish into thin air, leaving an explosive decoy that explodes and blinds.' } },
  { id: 'dahla', name: 'Dahla', emoji: '🧛', role: 'Bruiser', set: 'Bloodthorn', lore: 'A savage arena veteran who infuses physical blades with life-stealing magic.', stats: { hp: 'A', speed: 'B', damage: 'S' }, ability: { name: 'Sanguine Fury', desc: 'Increase lifesteal by 25% and attack speed by 40% for 6 seconds.' } },
  { id: 'karriv', name: 'Karriv', emoji: '🛡️', role: 'Tank', set: 'Solar Flare', lore: 'A holy crusader who channels solar heat into his heavy shield and broadsword.', stats: { hp: 'S', speed: 'C', damage: 'A' }, ability: { name: 'Sol Crest', desc: 'Absorb all frontal attacks, releasing a blast dealing 150% of stored damage.' } },
  { id: 'edani', name: 'Edani', emoji: '🔮', role: 'Mage', set: 'Voidbringer', lore: 'An academic wizard who unlocked void equations and gravitational singularities.', stats: { hp: 'B', speed: 'B', damage: 'S' }, ability: { name: 'Void Collapse', desc: 'Summon a gravity anomaly that pulls in all entities and deals massive AP damage.' } }
];

const RELICS = [
  { id: 'tempest_crown', name: 'Crown of Hurricanes', slot: 'crown', set: 'Tempest', stats: { hp: 100, ap: 15, speed: 15 } },
  { id: 'bloodthorn_weapon1', name: 'Bloodthorn Daggers', slot: 'weapon1', set: 'Bloodthorn', stats: { ap: 25, lifesteal: 8 } },
  { id: 'voidbringer_weapon1', name: 'Rift Scepter', slot: 'weapon1', set: 'Voidbringer', stats: { ap: 45, cdr: 5 } }
];

const SETS_METADATA = {
  'Tempest': '+12% Speed bonus, wind speed trails.',
  'Bloodthorn': '+8% Lifesteal, bleed wounds.',
  'Voidbringer': '+15% Cooldown Reduction (CDR).',
  'Solar Flare': '+25 Armor, +100 Max HP.'
};

// Initial mock database of competitive players (Multi-game)
let players = [
  {
    username: 'Resteral.TV',
    avatar: '🛡️',
    games: {
      arkheron: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      hockey: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      zealot: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] }
    }
  },
  {
    username: 'TofuShark',
    avatar: '🦊',
    games: {
      arkheron: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      hockey: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      zealot: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] }
    }
  },
  {
    username: 'TowerGod',
    avatar: '👑',
    games: {
      arkheron: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      hockey: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      zealot: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] }
    }
  },
  {
    username: 'Rynshi',
    avatar: '🥷',
    games: {
      arkheron: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      hockey: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      zealot: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] }
    }
  },
  {
    username: 'Dahla',
    avatar: '🧛',
    games: {
      arkheron: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      hockey: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      zealot: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] }
    }
  },
  {
    username: 'Grimwold',
    avatar: '❄️',
    games: {
      arkheron: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      hockey: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] },
      zealot: { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] }
    }
  }
];

let activeLobbies = {};
let currentSelectedGame = 'arkheron'; // default selected game for UI display

// App States
let appState = {
  currentTab: 'simulator',
  currentUser: 'Resteral.TV',
  activeChannel: 'arkheron', // active channel state inside simulator: 'arkheron', 'zealot', 'hockey'
  queues: {
    arkheron: [],
    hockey: [],
    zealot: []
  }, 
  draft: {
    active: false,
    pool: [],      
    captains: [],  
    teams: {
      teamA: { captain: '', players: [], eternals: [] },
      teamB: { captain: '', players: [], eternals: [] }
    },
    turn: 'B',     
    pickSequence: ['B', 'A', 'A', 'B'],
    pickIdx: 0,
    game: 'arkheron'
  },
  match: {
    active: false,
    scores: { teamA: 0, teamB: 0 },
    map: 'Lobby Scrim',
    roundCount: 0,
    timer: null,
    game: 'arkheron'
  },
  tournaments: [
    {
      id: 'TOURN-JUNE',
      name: '🏆 June Arkheron Cup 🏆',
      game: 'arkheron',
      type: 'snake',
      status: 'complete',
      captains: ['Resteral.TV', 'Bacon'],
      teams: { 'Resteral.TV': ['Resteral.TV', 'Slayer', 'Ghost'], 'Bacon': ['Bacon', 'Leodin', 'Dahla'] },
      matches: [{ round: 'Finals', teamA: 'Team Resteral.TV', teamB: 'Team Bacon', scoreA: 5, scoreB: 2 }]
    },
    {
      id: 'TOURN-JULY',
      name: '🏒 Summer Hockey Open 🏒',
      game: 'hockey',
      type: 'auction',
      status: 'complete',
      captains: ['Slayer', 'Ghost'],
      teams: { 'Slayer': ['Slayer', 'Resteral.TV', 'Karriv', 'Edani'], 'Ghost': ['Ghost', 'Bacon', 'Leodin', 'Dahla'] },
      matches: [{ round: 'Finals', teamA: 'Team Slayer', teamB: 'Team Ghost', scoreA: 4, scoreB: 5 }]
    }
  ],
  activeTournamentId: null,
  forumFilter: 'all',
  forumPosts: [
    {
      id: 'POST-SEED1',
      author: 'Resteral.TV',
      title: '📈 How to raise ELO in Zealot Hockey quickly',
      content: 'Make sure you always communicate defender swaps. 4v4 Hockey requires clean passing channels and rotating to cover open spaces when your teammate commits to a shot. Streaks are crucial!',
      category: 'hockey',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'POST-SEED2',
      author: 'Slayer',
      title: '🧜 Arkheron Team Compositions',
      content: 'Leodin is strong for fast rotations, but make sure your team has a Voidcollapse setup wizard (like Edani) for magic damage. Relic setups really matter here.',
      category: 'arkheron',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'POST-SEED3',
      author: 'Ghost',
      title: '🛡️ Zealot Mod Scrim tonight!',
      content: 'Creating a lobby around 7 PM EST. Join custom room LOB-SCRIM. We need 6 players for a solid serpentine draft. All skill levels welcome!',
      category: 'zealot',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ]
};

window.addEventListener('DOMContentLoaded', () => {
  players.forEach(p => {
    if (!p.bio) p.bio = "Competitive Custom Lobbies player.";
    if (!p.avatar) p.avatar = (p.username === 'Resteral.TV') ? '🦊' : '👤';
    if (!p.ingameName) p.ingameName = p.username;
    if (!p.registeredAt) p.registeredAt = new Date().toLocaleDateString();
    if (!p.color) p.color = '#7c3aed';

    if (!p.steamHex) {
      let hashStr = p.username.toLowerCase();
      let hash = 0;
      for (let i = 0; i < hashStr.length; i++) hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
      let hexEnd = Math.abs(hash).toString(16).padEnd(8, 'a').slice(0, 8);
      p.steamHex = '1100001' + hexEnd;
    }

    GAMES.forEach(g => {
      if (!p.games[g]) p.games[g] = { elo: 1000, wins: 0, losses: 0, kd: "1.00", eloHistory: [1000] };
      const pg = p.games[g];
      if (pg.streak === undefined) pg.streak = 0;
      if (pg.peakStreak === undefined) pg.peakStreak = 0;
      if (pg.lossStreak === undefined) pg.lossStreak = 0;
      if (pg.peakLossStreak === undefined) pg.peakLossStreak = 0;
      if (!pg.teammates) pg.teammates = {};
    });
  });

  renderLeaderboard();
  updateVoiceChannelsUI();
  viewCodeFile('bot');
});

// Switch Tab
function switchTab(tabId) {
  document.querySelectorAll('header .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-btn-${tabId}`).classList.add('active');

  document.querySelectorAll('main .tab-pane').forEach(pane => pane.classList.remove('active'));
  document.getElementById(`pane-${tabId}`).classList.add('active');

  appState.currentTab = tabId;
  if (tabId === 'profiles') {
    renderProfilesTab();
  } else if (tabId === 'tournaments') {
    renderTournamentsTab();
  } else if (tabId === 'forums') {
    renderForumsTab();
  }
}

// Select active game for leaderboard HUD
function selectActiveGame(game) {
  if (GAMES.includes(game)) {
    currentSelectedGame = game;
    renderLeaderboard();
    showToast(`Leaderboard switched to ${game.toUpperCase()}`, 'info');
  }
}

// Switch Simulated Channels inside Sidebar
function selectSimulatedChannel(game) {
  if (!GAMES.includes(game)) return;
  appState.activeChannel = game;

  document.querySelectorAll('.dc-channels-list .dc-channel-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`channel-btn-${game}`).classList.add('active');

  const titleHeader = document.querySelector('.dc-chat-header .dc-channel-title');
  if (titleHeader) {
    titleHeader.textContent = `# ${game}-lobby`;
  }
  updateQueueUI();
  showToast(`Switched channel context to #${game}-lobby`, 'info');
}

// Render Leaderboard
function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const sortedPlayers = [...players].sort((a, b) => {
    const eloA = a.games[currentSelectedGame]?.elo || 1000;
    const eloB = b.games[currentSelectedGame]?.elo || 1000;
    return eloB - eloA;
  });

  const titleSpan = document.querySelector('.tab-pane#pane-leaderboard .card-title span');
  if (titleSpan) {
    titleSpan.innerHTML = `🏆 Custom Lobbies Leaderboard: <strong>${currentSelectedGame.toUpperCase()}</strong>`;
  }

  sortedPlayers.forEach((p, idx) => {
    const pg = p.games[currentSelectedGame] || { elo: 1000, wins: 0, losses: 0, kd: "1.00" };
    const ratio = pg.losses > 0 ? (pg.wins / pg.losses).toFixed(2) : pg.wins.toFixed(2);
    
    let tier = 'Silver';
    let tierClass = 'badge-danger';
    if (pg.elo >= 1500) { tier = 'Challenger'; tierClass = 'badge-warning'; }
    else if (pg.elo >= 1350) { tier = 'Elite'; tierClass = 'badge-primary'; }
    else if (pg.elo >= 1200) { tier = 'Diamond'; tierClass = 'badge-success'; }
    else if (pg.elo >= 1050) { tier = 'Gold'; tierClass = 'badge-secondary'; }

    const rowHtml = `
      <tr style="border-bottom:1px solid var(--db-border); height:52px;">
        <td style="padding:8px; font-weight:800; font-family:var(--font-display); color:${idx === 0 ? 'var(--dc-yellow)' : '#d1d5db'}">${idx + 1}</td>
        <td style="padding:8px; font-weight:600; display:flex; align-items:center; gap:8px; height:52px;">
          <span>${p.avatar}</span>
          <span>${p.username}</span>
        </td>
        <td style="padding:8px;"><span class="badge ${tierClass}">${tier}</span></td>
        <td style="padding:8px; font-weight:700; color:white;">${pg.elo}</td>
        <td style="padding:8px; text-align:center;">${pg.wins} W / ${pg.losses} L (K/D: ${pg.kd})</td>
        <td style="padding:8px; text-align:right; font-weight:700; color:var(--dc-text-link);">${ratio}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', rowHtml);
  });
}

// Chat Parser
function simulateCommand(cmdText) {
  const input = document.getElementById('chat-input-field');
  input.value = cmdText;
  document.getElementById('chat-form').dispatchEvent(new Event('submit'));
}

function handleSendChat(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input-field');
  const messageText = input.value.trim();
  
  if (!messageText) return;
  input.value = '';

  writeMessage(appState.currentUser, false, messageText);

  let prefix = '';
  if (messageText.startsWith('-')) prefix = '-';
  else if (messageText.startsWith('!')) prefix = '!';
  else if (messageText.startsWith('/')) prefix = '/';

  if (prefix) {
    const parts = messageText.substring(prefix.length).trim().split(/ +/);
    const command = parts.shift().toLowerCase();
    const argument = parts.join(' ');
    
    setTimeout(() => {
      parseChatCommand(command, argument, appState.currentUser);
    }, 350);
  }
}

function parseChatCommand(command, argument, senderUser) {
  const game = appState.activeChannel; // Lock commands to active channel game context!

  // HELP
  if (command === 'help') {
    const embed = {
      title: '🔮 Custom Lobbies Bot Help',
      desc: `Commands only execute contextually for the channel game type (Active: **${game.toUpperCase()}**).`,
      fields: [
        { title: '-j [code] / -join', val: `Join queue or custom lobby for ${game.toUpperCase()}.` },
        { title: '-l / -leave', val: `Exit matchmaking queue.` },
        { title: `-lobby [size]`, val: `Create custom lobby (sizes: 3, 6, 9) for ${game.toUpperCase()}.` },
        { title: `-lobby [code]`, val: 'List players inside that lobby and their MMRs.' },
        { title: '-lobbies', val: 'List active game lobbies.' },
        { title: '-draft', val: 'Start player draft (requires 6 queue players).' },
        { title: '-pick [index/name]', val: 'Draft a player (Captains turn).' },
        { title: '-stats [player]', val: `View player MMR and records for ${game.toUpperCase()}.` },
        { title: '-compare [player]', val: 'Compare ELO and expected win odds.' },
        { title: '-elochart [player]', val: 'Plot ELO history curves.' },
        { title: '-leaderboard / -leaderboards', val: 'Show standings.' }
      ]
    };
    writeMessage('TheBot', true, '', embed);
  }
  
  const pl = players.find(x => x.username === senderUser);
  if (pl && pl.warnings && pl.warnings.length >= 3 && ['j', 'join', 'lobby'].includes(command)) {
    writeMessage('TheBot', true, `❌ **Error:** Cannot participate. You are currently suspended from matchmaking due to **${pl.warnings.length} warnings** for being late / no-show.`);
    return;
  }

  // JOIN
  else if (command === 'j' || command === 'join') {
    if (argument) {
      const code = argument.trim().toUpperCase();
      if (!activeLobbies[code]) {
        writeMessage('TheBot', true, `❌ Custom lobby **${code}** does not exist or has expired.`);
        return;
      }
      
      const lobby = activeLobbies[code];
      if (lobby.game !== game) {
        writeMessage('TheBot', true, `❌ Lobby **${code}** is for **${lobby.game.toUpperCase()}**. Please switch channel to join.`);
        return;
      }

      if (lobby.players.includes(senderUser)) {
        writeMessage('TheBot', true, `⚠️ You are already in lobby **${code}**.`);
        return;
      }
      
      lobby.players.push(senderUser);
      const playerElo = players.find(p => p.username === senderUser)?.games[game]?.elo || 1000;
      
      if (lobby.players.length === lobby.targetSize) {
        const lobbyPlayers = lobby.players.map(p => players.find(pl => pl.username === p));
        let description = `Lobby **${code}** for **${game.toUpperCase()}** is full! balanced by MMR:\n\n`;
        
        lobbyPlayers.sort((a, b) => b.games[game].elo - a.games[game].elo);
        const t1 = [lobbyPlayers[0], lobbyPlayers[3], lobbyPlayers[4]];
        const t2 = [lobbyPlayers[1], lobbyPlayers[2], lobbyPlayers[5]];
        
        description += `🟢 **Team Alpha (Avg MMR: ${Math.round((t1[0].games[game].elo + t1[1].games[game].elo + t1[2].games[game].elo)/3)}):**\n` + t1.map(p => `• ${p.username} (${p.games[game].elo})`).join('\n') + '\n\n';
        description += `🔵 **Team Beta (Avg MMR: ${Math.round((t2[0].games[game].elo + t2[1].games[game].elo + t2[2].games[game].elo)/3)}):**\n` + t2.map(p => `• ${p.username} (${p.games[game].elo})`).join('\n');

        const embed = {
          title: `🎮 Custom Lobby ${code} Ready!`,
          desc: description,
          fields: [{ title: '🔑 Custom Game Join Code', val: `\`${code}\`` }]
        };
        writeMessage('TheBot', true, '', embed);
        delete activeLobbies[code];
      } else {
        const embed = {
          title: `👥 Joined Custom Lobby ${code}`,
          desc: `Player **${senderUser}** (MMR: **${playerElo}**) joined the lobby.\n\n**Players (${lobby.players.length}/${lobby.targetSize}):**\n` + lobby.players.map((p, idx) => `${idx+1}. ${p} (MMR: ${players.find(pl=>pl.username===p)?.games[game]?.elo || 1000})`).join('\n')
        };
        writeMessage('TheBot', true, '', embed);
      }
    } else {
      if (appState.draft.active || appState.match.active) {
        writeMessage('TheBot', true, '⚠️ **Error:** Cannot join queue. A match or draft is in progress.');
        return;
      }
      if (appState.queues[game].includes(senderUser)) {
        writeMessage('TheBot', true, `⚠️ **${senderUser}**, you are already in the queue.`);
        return;
      }

      appState.queues[game].push(senderUser);
      const playerElo = players.find(p => p.username === senderUser)?.games[game]?.elo || 1000;
      const limit = game === 'hockey' ? 8 : 6;
      writeMessage('TheBot', true, `✅ **${senderUser}** (MMR: **${playerElo}**) joined the **${game.toUpperCase()}** queue! (${appState.queues[game].length}/${limit})`);
      updateQueueUI();
    }
  }

  // LEAVE
  else if (command === 'l' || command === 'leave') {
    if (argument) {
      const code = argument.trim().toUpperCase();
      if (!activeLobbies[code]) return writeMessage('TheBot', true, `❌ Custom lobby **${code}** does not exist.`);
      const lobby = activeLobbies[code];
      if (!lobby.players.includes(senderUser)) return writeMessage('TheBot', true, `⚠️ You are not in lobby **${code}**.`);
      lobby.players = lobby.players.filter(p => p !== senderUser);
      writeMessage('TheBot', true, `🏃 **${senderUser}** left custom lobby **${code}**. (${lobby.players.length}/${lobby.targetSize})`);
    } else {
      if (!appState.queues[game].includes(senderUser)) return writeMessage('TheBot', true, `⚠️ **${senderUser}**, you are not in the queue.`);
      appState.queues[game] = appState.queues[game].filter(p => p !== senderUser);
      const limit = game === 'hockey' ? 8 : 6;
      writeMessage('TheBot', true, `🏃 **${senderUser}** left the ${game.toUpperCase()} queue. (${appState.queues[game].length}/${limit})`);
      updateQueueUI();
    }
  }

  // LOBBY
  else if (command === 'lobby') {
    const parts = argument.trim().split(/ +/);
    const firstArg = parts[0]?.toUpperCase();

    // Check if the argument is an existing lobby code
    if (firstArg && activeLobbies[firstArg]) {
      const code = firstArg;
      const lobby = activeLobbies[code];
      const lobbyGame = lobby.game;
      const playerList = lobby.players.map((p, idx) => `${idx+1}. **${p}** (MMR: ${players.find(pl=>pl.username===p)?.games[lobbyGame]?.elo || 1000})`).join('\n');
      
      const embed = {
        title: `🎮 Custom Lobby: ${code} (${lobbyGame.toUpperCase()})`,
        desc: `**Host:** ${lobby.host}\n**Size:** \`${lobby.players.length}/${lobby.targetSize}\`\n\n**Current Players:**\n${playerList}`,
        footer: `Join command: -j ${code}`
      };
      writeMessage('TheBot', true, '', embed);
      return;
    }

    let size = 6;

    if (parts[0]) {
      const parsedSize = parseInt(parts[0]);
      if ([3, 6, 9].includes(parsedSize)) size = parsedSize;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'LOB-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    activeLobbies[code] = { host: senderUser, players: [senderUser], targetSize: size, game };
    const userElo = players.find(p => p.username === senderUser)?.games[game]?.elo || 1000;

    const embed = {
      title: `🎮 ${game.toUpperCase()} Custom Lobby Created!`,
      desc: `Host **${senderUser}** created a custom lobby for **${size}** players.\n\n**Lobby Code:** \`${code}\`\n**Join command:** \`-j ${code}\`\n\n**Current Players (1/${size}):**\n1. ${senderUser} (MMR: ${userElo})`
    };
    writeMessage('TheBot', true, '', embed);
  }

  // DRAFT
  else if (command === 'draft') {
    if (appState.draft.active || appState.match.active) {
      writeMessage('TheBot', true, '⚠️ **Error:** A match/draft is already active.');
      return;
    }

    const requiredPlayers = game === 'hockey' ? 8 : 6;
    if (appState.queues[game].length < requiredPlayers) {
      writeMessage('TheBot', true, `⚠️ Cannot start draft. Need at least ${requiredPlayers} players in queue for a ${requiredPlayers/2}v${requiredPlayers/2} scrim. Type \`!addbots\` to fill.`);
      return;
    }

    triggerDraftStart(game);
  }

  // ADDBOTS
  else if (command === 'addbots') {
    if (appState.draft.active || appState.match.active) return writeMessage('TheBot', true, '⚠️ **Error:** A match or draft is active.');

    if (!appState.queues[game].includes(appState.currentUser)) {
      appState.queues[game].push(appState.currentUser);
    }

    const others = players.filter(p => p.username !== appState.currentUser);
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    
    const requiredPlayers = game === 'hockey' ? 8 : 6;
    while (appState.queues[game].length < requiredPlayers && shuffled.length > 0) {
      const candidate = shuffled.pop().username;
      if (!appState.queues[game].includes(candidate)) {
        appState.queues[game].push(candidate);
      }
    }

    writeMessage('TheBot', true, `🤖 Queue filled with test players for ${game.toUpperCase()}!`);
    appState.queues[game].forEach(p => {
      if (p !== appState.currentUser) writeMessage('TheBot', true, `✅ **${p}** joined the queue!`);
    });
    updateQueueUI();
  }

  // PICK
  else if (command === 'pick' || command === 'p') {
    if (!appState.draft.active) return writeMessage('TheBot', true, '⚠️ **Error:** No active drafting phase.');

    const activeDraft = appState.draft;
    const currentTurn = activeDraft.pickSequence[activeDraft.pickIdx];
    const currentCap = currentTurn === 'A' ? activeDraft.teams.teamA.captain : activeDraft.teams.teamB.captain;
    
    if (senderUser !== currentCap) {
      writeMessage('TheBot', true, `⚠️ It is not your turn. Captain **${currentCap}** is picking.`);
      return;
    }

    if (!argument) {
      writeMessage('TheBot', true, '⚠️ Specify player index/name.');
      return;
    }

    let selectedPlayer = null;
    const numVal = parseInt(argument);

    if (!isNaN(numVal) && numVal >= 1 && numVal <= activeDraft.pool.length) {
      selectedPlayer = activeDraft.pool[numVal - 1];
    } else {
      selectedPlayer = activeDraft.pool.find(p => p.toLowerCase() === argument.toLowerCase());
    }

    if (!selectedPlayer) {
      writeMessage('TheBot', true, `⚠️ Player not found in draft pool.`);
      return;
    }

    executeDraftPick(selectedPlayer);
  }

  // STATS
  else if (command === 'stats') {
    const parts = argument.trim().split(/ +/);
    const targetName = parts[0] ? parts[0] : senderUser;

    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player **${targetName}** not found.`);

    const pg = p.games[game];
    const winrate = pg.wins + pg.losses > 0 ? ((pg.wins / (pg.wins + pg.losses)) * 100).toFixed(1) + "%" : "0%";
    
    const embed = {
      title: `📊 ${game.toUpperCase()} Profile: ${p.username}`,
      fields: [
        { title: 'MMR Rating', val: `\`${pg.elo}\`` },
        { title: 'W/L Record', val: `${pg.wins} Wins / ${pg.losses} Losses (${winrate})` }
      ]
    };
    writeMessage('TheBot', true, '', embed);
  }

  // COMPARE
  else if (command === 'compare') {
    const parts = argument.trim().split(/ +/);
    if (!parts[0]) return writeMessage('TheBot', true, '⚠️ Specify player username (e.g. `-compare TofuShark`).');

    const nameA = senderUser;
    const nameB = parts[0];

    const pA = players.find(p => p.username.toLowerCase() === nameA.toLowerCase());
    const pB = players.find(p => p.username.toLowerCase() === nameB.toLowerCase());

    if (!pA || !pB) return writeMessage('TheBot', true, `❌ Player compare failed.`);

    const pgA = pA.games[game];
    const pgB = pB.games[game];

    const probA = 1 / (1 + Math.pow(10, (pgB.elo - pgA.elo) / 400));
    const probB = 1 - probA;

    const embed = {
      title: `⚔️ Compare: ${pA.username} vs ${pB.username} (${game.toUpperCase()})`,
      fields: [
        { title: `👤 ${pA.username}`, val: `**MMR:** \`${pgA.elo}\` (W/L: ${pgA.wins}-${pgA.losses})` },
        { title: `👤 ${pB.username}`, val: `**MMR:** \`${pgB.elo}\` (W/L: ${pgB.wins}-${pgB.losses})` },
        { title: '🔮 Victory Probability', val: `**${pA.username}:** \`${(probA*100).toFixed(1)}%\` vs **${pB.username}:** \`${(probB*100).toFixed(1)}%\``, fullwidth: true }
      ]
    };
    writeMessage('TheBot', true, '', embed);
  }

  // ELOCHART
  else if (command === 'elochart') {
    const parts = argument.trim().split(/ +/);
    const targetName = parts[0] ? parts[0] : senderUser;

    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player not found.`);

    const pg = p.games[game];
    const width = 450, height = 150, padding = 25;
    const chartWidth = width - padding * 2, chartHeight = height - padding * 2;

    const minVal = Math.min(...pg.eloHistory) - 20;
    const maxVal = Math.max(...pg.eloHistory) + 20;
    const range = maxVal - minVal || 10;

    const points = pg.eloHistory.map((val, idx) => {
      const x = padding + (idx / Math.max(1, pg.eloHistory.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
      return { x, y, val };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) pathD += ` L ${points[i].x} ${points[i].y}`;

    let dotsHtml = '';
    points.forEach(pt => {
      dotsHtml += `
        <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="var(--dc-text-link)" stroke="white" stroke-width="1.5" />
        <text x="${pt.x}" y="${pt.y - 8}" font-size="9" fill="white" font-weight="700" text-anchor="middle">${pt.val}</text>
      `;
    });

    const svgHtml = `
      <div style="background:#1e1f22; border-radius:6px; padding:12px; margin-top:8px; border:1px solid #2b2d31;">
        <div style="font-weight:700; color:white; font-size:0.9rem; margin-bottom:8px;">📈 ELO Trend Chart: ${p.username} (${game.toUpperCase()})</div>
        <svg width="100%" viewBox="0 0 ${width} ${height}" style="overflow:visible;">
          <path d="${pathD}" fill="none" stroke="var(--dc-text-link)" stroke-width="2.5" />
          ${dotsHtml}
        </svg>
      </div>
    `;

    const embed = {
      title: `📈 ${game.toUpperCase()} MMR History: ${p.username}`,
      desc: svgHtml
    };
    writeMessage('TheBot', true, '', embed);
  }

  // LEADERBOARD / LEADERBOARDS
  else if (command === 'leaderboard' || command === 'leaderboards' || command === 'rank') {
    const list = [...players]
      .filter(p => p.games && p.games[game])
      .sort((a,b) => b.games[game].elo - a.games[game].elo)
      .slice(0, 10)
      .map((p, idx) => {
        const pg = p.games[game];
        return `${idx+1}. **${p.username}** - MMR: \`${pg.elo}\` (W/L: ${pg.wins}/${pg.losses})`;
      })
      .join('\n');

    const embed = {
      title: `🏆 ${game.toUpperCase()} Competitive MMR Leaderboard`,
      desc: list || 'No players recorded.'
    };
    writeMessage('TheBot', true, '', embed);
  }

  // BEST TEAMMATES
  else if (command === 'best') {
    const targetName = argument.trim() ? argument.trim() : senderUser;
    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player **${targetName}** is not registered.`);

    const pg = p.games[game];
    if (!pg.teammates || Object.keys(pg.teammates).length === 0) {
      return writeMessage('TheBot', true, `⚠️ **${p.username}** hasn't completed any 3v3 scrims with teammates in **${game.toUpperCase()}**.`);
    }

    const sorted = Object.entries(pg.teammates)
      .map(([name, stats]) => {
        const total = stats.wins + stats.losses;
        const rate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : "0.0";
        return { name, wins: stats.wins, losses: stats.losses, total, rate: parseFloat(rate) };
      })
      .sort((a, b) => b.rate - a.rate || b.total - a.total);

    const list = sorted.slice(0, 5).map((t, idx) => `${idx+1}. **${t.name}** - Winrate: \`${t.rate}%\` (${t.wins} W / ${t.losses} L)`).join('\n');

    const embed = {
      title: `🌟 Best Teammates for ${p.username} (${game.toUpperCase()})`,
      desc: list || 'No teammates recorded.'
    };
    writeMessage('TheBot', true, '', embed);
  }

  // WORST TEAMMATES
  else if (command === 'worst') {
    const targetName = argument.trim() ? argument.trim() : senderUser;
    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player **${targetName}** is not registered.`);

    const pg = p.games[game];
    if (!pg.teammates || Object.keys(pg.teammates).length === 0) {
      return writeMessage('TheBot', true, `⚠️ **${p.username}** hasn't completed any 3v3 scrims with teammates in **${game.toUpperCase()}**.`);
    }

    const sorted = Object.entries(pg.teammates)
      .map(([name, stats]) => {
        const total = stats.wins + stats.losses;
        const rate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : "0.0";
        return { name, wins: stats.wins, losses: stats.losses, total, rate: parseFloat(rate) };
      })
      .sort((a, b) => a.rate - b.rate || b.losses - a.losses);

    const list = sorted.slice(0, 5).map((t, idx) => `${idx+1}. **${t.name}** - Winrate: \`${t.rate}%\` (${t.wins} W / ${t.losses} L)`).join('\n');

    const embed = {
      title: `💀 Worst teammates for ${p.username} (${game.toUpperCase()})`,
      desc: list || 'No teammates recorded.'
    };
    writeMessage('TheBot', true, '', embed);
  }

  // PEAK STREAK
  else if (command === 'peak') {
    const targetName = argument.trim() ? argument.trim() : senderUser;
    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player **${targetName}** is not registered.`);

    const pg = p.games[game];
    const embed = {
      title: `🔥 Peak Winstreak: ${p.username} (${game.toUpperCase()})`,
      desc: `**Current Winstreak:** \`${pg.streak || 0}\` matches\n**Peak (Highest) Winstreak:** \`${pg.peakStreak || 0}\` matches`
    };
    writeMessage('TheBot', true, '', embed);
  }

  // LOWEST STREAK
  else if (command === 'lowest') {
    const targetName = argument.trim() ? argument.trim() : senderUser;
    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player **${targetName}** is not registered.`);

    const pg = p.games[game];
    const embed = {
      title: `📉 Peak Losing Streak: ${p.username} (${game.toUpperCase()})`,
      desc: `**Current Losing Streak:** \`${pg.lossStreak || 0}\` matches\n**Peak (Worst) Losing Streak:** \`${pg.peakLossStreak || 0}\` matches`
    };
    writeMessage('TheBot', true, '', embed);
  }

  // REGISTER
  else if (command === 'register') {
    const ingameName = argument.trim();
    if (!ingameName) return writeMessage('TheBot', true, "⚠️ Specify your in-game name (e.g. `-register Resteral.TV`).");

    const me = players.find(pl => pl.username.toLowerCase() === senderUser.toLowerCase());
    if (me) {
      me.ingameName = ingameName;
      if (appState.currentUser === me.username) {
        document.getElementById('prof-edit-ingame').value = ingameName;
      }
      writeMessage('TheBot', true, `✅ **Profile Registered!** Welcome to Custom Lobbies. Linked in-game handle: **${ingameName}**.`);
      renderProfilesTab();
    }
  }

  // PROFILE
  else if (command === 'profile') {
    const targetName = argument.trim() ? argument.trim() : senderUser;
    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player **${targetName}** is not registered.`);

    const embed = {
      title: `${p.avatar || '👤'} Player Profile: ${p.username}`,
      desc: `*${p.bio || 'Competitive Custom Lobbies player.'}*\n\n` +
            `🔗 **Linked In-Game Handle:** \`${p.ingameName || 'Not linked. Use -register'}\`\n` +
            `📅 **Joined Club:** \`${p.registeredAt || 'Today'}\`\n\n` +
            `🧜 **Arkheron:** MMR: **${p.games.arkheron?.elo || 1000}** (W/L: ${p.games.arkheron?.wins}-${p.games.arkheron?.losses})\n` +
            `🏒 **Zealot Hockey:** MMR: **${p.games.hockey?.elo || 1000}** (W/L: ${p.games.hockey?.wins}-${p.games.hockey?.losses})\n` +
            `🛡️ **Zealot Mod:** MMR: **${p.games.zealot?.elo || 1000}** (W/L: ${p.games.zealot?.wins}-${p.games.zealot?.losses})`
    };
    writeMessage('TheBot', true, '', embed);
  }

  // SETBIO
  else if (command === 'setbio') {
    const bioText = argument.trim();
    if (!bioText) return writeMessage('TheBot', true, "⚠️ Specify your new profile motto/bio (e.g. `-setbio Midlaner looking for a team`).");

    const me = players.find(pl => pl.username.toLowerCase() === senderUser.toLowerCase());
    if (me) {
      me.bio = bioText;
      if (appState.currentUser === me.username) {
        document.getElementById('prof-edit-bio').value = bioText;
      }
      writeMessage('TheBot', true, "✅ Profile bio updated successfully!");
      renderProfilesTab();
    }
  }

  // SETAVATAR
  else if (command === 'setavatar') {
    const emoji = argument.trim();
    if (!emoji) return writeMessage('TheBot', true, "⚠️ Specify an emoji to set as your profile avatar (e.g. `-setavatar 🦊`).");

    const me = players.find(pl => pl.username.toLowerCase() === senderUser.toLowerCase());
    if (me) {
      me.avatar = emoji;
      if (appState.currentUser === me.username) {
        document.getElementById('prof-edit-avatar').value = emoji;
      }
      writeMessage('TheBot', true, `✅ Profile avatar updated to: ${emoji}`);
      renderProfilesTab();
      updateVoiceChannelsUI();
    }
  }

  // WARN
  else if (command === 'warn') {
    const parts = argument.trim().split(' ');
    const targetName = parts[0];
    const reason = parts.slice(1).join(' ').trim() || 'Late / No-show to custom lobby match.';

    if (!targetName) return writeMessage('TheBot', true, "⚠️ Please specify a player username to warn (e.g. `-warn Resteral.TV Late for hockey game`).");

    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player **${targetName}** not found.`);

    p.warnings = p.warnings || [];
    p.warnings.push({
      id: 'WARN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      reason,
      issuedAt: new Date().toISOString()
    });

    const wCount = p.warnings.length;
    let replyMsg = `🚨 **${p.username}** has been warned by **${senderUser}** for: *${reason}*. (Warnings: ${wCount}/3)`;
    if (wCount >= 3) {
      replyMsg += `\n❌ **SUSPENDED:** Player has reached 3 warnings and is now suspended from matchmaking!`;
      
      Object.keys(appState.queues).forEach(g => {
        appState.queues[g] = appState.queues[g].filter(u => u !== p.username);
      });
      updateLobbyQueueUI(game);
    }
    writeMessage('TheBot', true, replyMsg);
    renderProfilesTab();
  }

  // CLEAR WARNS
  else if (command === 'clearwarns') {
    const targetName = argument.trim();
    if (!targetName) return writeMessage('TheBot', true, "⚠️ Please specify a player username to clear warnings (e.g. `-clearwarns Resteral.TV`).");

    const p = players.find(pl => pl.username.toLowerCase() === targetName.toLowerCase());
    if (!p) return writeMessage('TheBot', true, `❌ Player **${targetName}** not found.`);

    p.warnings = [];
    writeMessage('TheBot', true, `✅ Clean slate! Warnings cleared for **${p.username}**. Suspension lifted.`);
    renderProfilesTab();
  }
}

// Drafting Logic (Simulator)
function triggerDraftStart(game) {
  appState.draft.active = true;
  appState.draft.game = game;

  const requiredPlayers = game === 'hockey' ? 8 : 6;
  const lobbyNames = appState.queues[game].slice(0, requiredPlayers);
  appState.queues[game] = appState.queues[game].slice(requiredPlayers);
  
  const lobbyPlayers = lobbyNames.map(name => players.find(p => p.username === name));
  lobbyPlayers.sort((a, b) => b.games[game].elo - a.games[game].elo);
  
  const capA = lobbyPlayers[0]; 
  const capB = lobbyPlayers[1]; 
  const restPlayers = lobbyPlayers.slice(2).map(p => p.username);

  const pickSequence = game === 'hockey' ? ['B', 'A', 'A', 'B', 'B', 'A'] : ['B', 'A', 'A', 'B'];

  appState.draft.captains = [capA, capB];
  appState.draft.pool = restPlayers;
  appState.draft.teams.teamA = { captain: capA.username, players: [capA.username], eternals: [] };
  appState.draft.teams.teamB = { captain: capB.username, players: [capB.username], eternals: [] };
  appState.draft.turn = 'B';
  appState.draft.pickIdx = 0;
  appState.draft.pickSequence = pickSequence;

  updateVoiceChannelsUI();

  const embed = {
    title: `⚔️ ${requiredPlayers/2}v${requiredPlayers/2} ${game.toUpperCase()} Serpentine Player Draft Starting`,
    desc: `Captains selected: **${capA.username}** and **${capB.username}**. Drafting in dedicated channel #draft-${game}.`,
    fields: [
      { title: '🟢 Team Alpha Captain', val: `${capA.username} (MMR: ${capA.games[game].elo})` },
      { title: '🔵 Team Beta Captain', val: `${capB.username} (MMR: ${capB.games[game].elo})` },
      { title: '👥 Selection Pool', val: appState.draft.pool.map((p, idx) => `${idx+1}. **${p}** (MMR: ${players.find(pl=>pl.username===p)?.games[game].elo})`).join('\n'), fullwidth: true }
    ]
  };
  
  writeMessage('TheBot', true, '', embed);
  showToast(`Draft started for ${game.toUpperCase()}`, 'success');

  document.getElementById('draft-arena-card').style.display = 'block';
  updateQueueUI();
  updateDraftArenaUI();

  checkBotPickSchedule();
}

function checkBotPickSchedule() {
  if (!appState.draft.active) return;
  const currentTurn = appState.draft.pickSequence[appState.draft.pickIdx];
  const activeCapName = currentTurn === 'A' ? appState.draft.captains[0].username : appState.draft.captains[1].username;
  
  if (activeCapName !== appState.currentUser) {
    setTimeout(() => {
      const pool = appState.draft.pool;
      if (pool.length > 0) {
        const pickIndex = Math.floor(Math.random() * pool.length);
        const selected = pool[pickIndex];
        writeMessage(activeCapName, false, `-pick ${selected}`);
        setTimeout(() => executeDraftPick(selected), 300);
      }
    }, 1800);
  }
}

function executeDraftPick(playerUsername) {
  const activeDraft = appState.draft;
  const currentTurn = activeDraft.pickSequence[activeDraft.pickIdx];
  const capName = currentTurn === 'A' ? activeDraft.teams.teamA.captain : activeDraft.teams.teamB.captain;

  activeDraft.pool = activeDraft.pool.filter(p => p !== playerUsername);
  const activeTeam = currentTurn === 'A' ? activeDraft.teams.teamA : activeDraft.teams.teamB;
  activeTeam.players.push(playerUsername);
  
  writeMessage('TheBot', true, `✨ Captain **${capName}** drafted **${playerUsername}** for **${currentTurn === 'A' ? 'Team Alpha' : 'Team Beta'}**!`);
  activeDraft.pickIdx++;

  if (activeDraft.pickIdx < activeDraft.pickSequence.length) {
    activeDraft.turn = activeDraft.pickSequence[activeDraft.pickIdx];
    updateDraftArenaUI();
    checkBotPickSchedule();
  } else {
    concludeDrafting();
  }
}

function concludeDrafting() {
  const game = appState.draft.game;
  appState.draft.active = false;
  document.getElementById('draft-arena-card').style.display = 'none';

  appState.match.active = true;
  appState.match.game = game;
  appState.match.scores = { teamA: 0, teamB: 0 };
  appState.match.roundCount = 0;

  const tA = appState.draft.teams.teamA;
  const tB = appState.draft.teams.teamB;
  tA.eternals = [];
  tB.eternals = [];
  tA.players.forEach((pName, idx) => { tA.eternals[idx] = ETERNALS[idx % ETERNALS.length]; });
  tB.players.forEach((pName, idx) => { tB.eternals[idx] = ETERNALS[(idx + 2) % ETERNALS.length]; });

  const embed = {
    title: `🎮 Match Starting: ${game.toUpperCase()}`,
    desc: `Teams locked. Temporary team voice channels are active.`,
    fields: [
      { title: '🟢 Team Alpha', val: `**Players:** ${tA.players.join(', ')}` },
      { title: '🔵 Team Beta', val: `**Players:** ${tB.players.join(', ')}` }
    ]
  };

  writeMessage('TheBot', true, '', embed);
  showToast(`Match starting!`, 'success');

  document.getElementById('match-simulator-card').style.display = 'block';
  document.getElementById('ms-ct-name').textContent = `Team ${tA.captain} (Alpha)`;
  document.getElementById('ms-t-name').textContent = `Team ${tB.captain} (Beta)`;
  document.getElementById('ms-ct-score').textContent = '0';
  document.getElementById('ms-t-score').textContent = '0';
  
  const logsBox = document.getElementById('match-logs-box');
  logsBox.innerHTML = `<div class="match-log-line system">Match initialized for ${game.toUpperCase()}...</div>`;

  setTimeout(runSimulatedMatchTick, 2000);
}

function runSimulatedMatchTick() {
  if (!appState.match.active) return;
  appState.match.roundCount++;

  const teamAWins = Math.random() < 0.5;
  if (teamAWins) appState.match.scores.teamA++;
  else appState.match.scores.teamB++;

  document.getElementById('ms-ct-score').textContent = appState.match.scores.teamA;
  document.getElementById('ms-t-score').textContent = appState.match.scores.teamB;

  const logsBox = document.getElementById('match-logs-box');
  const tA = appState.draft.teams.teamA;
  const tB = appState.draft.teams.teamB;
  const winner = teamAWins ? tA : tB;
  const loser = teamAWins ? tB : tA;

  const wPlayer = winner.players[Math.floor(Math.random() * winner.players.length)];
  const lPlayer = loser.players[Math.floor(Math.random() * loser.players.length)];

  logsBox.innerHTML += `<div class="match-log-line kill">Round ${appState.match.roundCount}: **${wPlayer}** cleared **${lPlayer}**!</div>`;
  logsBox.scrollTop = logsBox.scrollHeight;

  if (appState.match.scores.teamA === 5 || appState.match.scores.teamB === 5) {
    concludeMatch(appState.match.scores.teamA === 5);
  } else {
    setTimeout(runSimulatedMatchTick, 2000);
  }
}

function concludeMatch(alphaWon) {
  const game = appState.match.game;
  appState.match.active = false;

  const winTeam = alphaWon ? appState.draft.teams.teamA : appState.draft.teams.teamB;
  const loseTeam = alphaWon ? appState.draft.teams.teamB : appState.draft.teams.teamA;

  winTeam.players.forEach(name => {
    const p = players.find(pl => pl.username === name);
    if (p) {
      const pg = p.games[game];
      pg.wins++;
      pg.elo += 25;
      pg.eloHistory.push(pg.elo);

      // Streaks
      pg.streak = (pg.streak || 0) + 1;
      if (pg.streak > (pg.peakStreak || 0)) {
        pg.peakStreak = pg.streak;
      }
      pg.lossStreak = 0;

      // Teammates
      if (!pg.teammates) pg.teammates = {};
      const allies = winTeam.players.filter(plName => plName !== name);
      allies.forEach(ally => {
        if (!pg.teammates[ally]) pg.teammates[ally] = { wins: 0, losses: 0 };
        pg.teammates[ally].wins++;
      });
    }
  });

  loseTeam.players.forEach(name => {
    const p = players.find(pl => pl.username === name);
    if (p) {
      const pg = p.games[game];
      pg.losses++;
      pg.elo = Math.max(800, pg.elo - 15);
      pg.eloHistory.push(pg.elo);

      // Streaks
      pg.streak = 0;
      pg.lossStreak = (pg.lossStreak || 0) + 1;
      if (pg.lossStreak > (pg.peakLossStreak || 0)) {
        pg.peakLossStreak = pg.lossStreak;
      }

      // Teammates
      if (!pg.teammates) pg.teammates = {};
      const allies = loseTeam.players.filter(plName => plName !== name);
      allies.forEach(ally => {
        if (!pg.teammates[ally]) pg.teammates[ally] = { wins: 0, losses: 0 };
        pg.teammates[ally].losses++;
      });
    }
  });

  renderLeaderboard();

  const embed = {
    title: `🏆 Match Complete - Team ${winTeam.captain} Wins!`,
    desc: `Temporary team voice channels have been deleted automatically.`,
    fields: [
      { title: '📈 Winners (+25 MMR)', val: winTeam.players.join(', ') },
      { title: '📉 Losers (-15 MMR)', val: loseTeam.players.join(', ') }
    ]
  };
  writeMessage('TheBot', true, '', embed);
  
  setTimeout(() => {
    document.getElementById('match-simulator-card').style.display = 'none';
  }, 5000);
}

function updateQueueUI() {
  const game = appState.activeChannel;
  const countBadge = document.getElementById('queue-count-badge');
  const ratioText = document.getElementById('queue-ratio-text');
  const progressBar = document.getElementById('queue-progress-bar');
  const count = appState.queues[game].length;
  countBadge.textContent = `${count}/6 Players`;
  const pct = Math.min(100, (count / 6) * 100);
  ratioText.textContent = `${Math.round(pct)}%`;
  progressBar.style.width = `${pct}%`;
}

function updateDraftArenaUI() {
  const activeDraft = appState.draft;
  const indicator = document.getElementById('draft-instructions');
  const currentTurn = activeDraft.pickSequence[activeDraft.pickIdx];
  const activeCapName = currentTurn === 'A' ? activeDraft.captains[0].username : activeDraft.captains[1].username;
  const capColor = currentTurn === 'A' ? 'var(--dc-text-link)' : 'var(--dc-yellow)';
  
  document.getElementById('draft-turn-badge').textContent = `Captain ${activeCapName}'s Turn`;
  indicator.innerHTML = `CAPTAIN <span style="color:${capColor};">${activeCapName.toUpperCase()}</span>'s TURN TO DRAFT`;

  const ctList = document.getElementById('team-ct-list');
  const tList = document.getElementById('team-t-list');

  ctList.innerHTML = '';
  activeDraft.teams.teamA.players.forEach(pName => {
    const p = players.find(pl => pl.username === pName) || { avatar: '👤', elo: 1000 };
    ctList.innerHTML += `<div class="drafted-player-card"><span>${p.avatar}</span><strong>${p.username}</strong></div>`;
  });

  tList.innerHTML = '';
  activeDraft.teams.teamB.players.forEach(pName => {
    const p = players.find(pl => pl.username === pName) || { avatar: '👤', elo: 1000 };
    tList.innerHTML += `<div class="drafted-player-card"><span>${p.avatar}</span><strong>${p.username}</strong></div>`;
  });

  const poolGrid = document.getElementById('draft-pool-grid');
  poolGrid.innerHTML = '';

  activeDraft.pool.forEach((pName, idx) => {
    const p = players.find(pl => pl.username === pName) || { avatar: '👤', elo: 1000 };
    const isOurTurn = (activeCapName === appState.currentUser);
    const cardClass = isOurTurn ? 'pool-player-card' : 'pool-player-card disabled';
    const clickHandler = isOurTurn ? `onclick="simulateCommand('-pick ${idx+1}')"` : '';

    poolGrid.innerHTML += `
      <div class="${cardClass}" ${clickHandler}>
        <div style="font-size:0.65rem; position:absolute; top:4px; left:6px; color:var(--dc-text-muted); font-weight:800;">#${idx+1}</div>
        <div class="pool-player-avatar">${p.avatar}</div>
        <span class="pool-player-name">${p.username}</span>
        <span class="pool-player-elo" style="font-size:0.65rem;">MMR: ${p.games[activeDraft.game].elo}</span>
      </div>
    `;
  });
}

function updateVoiceChannelsUI() {
  const waitingBox = document.getElementById('vc-waiting-users');
  const ctBox = document.getElementById('vc-ct-users');
  const tBox = document.getElementById('vc-t-users');

  waitingBox.innerHTML = '';
  ctBox.innerHTML = '';
  tBox.innerHTML = '';

  let countWaiting = 0, countCt = 0, countT = 0;

  if (appState.draft.active || appState.match.active) {
    appState.draft.teams.teamA.players.forEach(pName => {
      const p = players.find(pl => pl.username === pName) || { avatar: '👤' };
      ctBox.innerHTML += `<div class="dc-voice-user"><div class="dc-voice-avatar">${p.avatar}</div><span>${pName}</span></div>`;
      countCt++;
    });
    appState.draft.teams.teamB.players.forEach(pName => {
      const p = players.find(pl => pl.username === pName) || { avatar: '👤' };
      tBox.innerHTML += `<div class="dc-voice-user"><div class="dc-voice-avatar">${p.avatar}</div><span>${pName}</span></div>`;
      countT++;
    });
  } else {
    players.forEach(p => {
      waitingBox.innerHTML += `<div class="dc-voice-user"><div class="dc-voice-avatar">${p.avatar}</div><span>${p.username}</span></div>`;
      countWaiting++;
    });
  }

  document.getElementById('vc-waiting-count').textContent = countWaiting;
  document.getElementById('vc-ct-count').textContent = countCt;
  document.getElementById('vc-t-count').textContent = countT;
}

// Render Discord Message Chat item
function writeMessage(sender, isBot, text, embedObj) {
  const container = document.getElementById('chat-messages');
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let avatar = '👤';
  if (isBot) avatar = '🔮';
  else {
    const p = players.find(pl => pl.username === sender);
    if (p) avatar = p.avatar;
  }

  let embedHtml = '';
  if (embedObj) {
    let fieldsHtml = '';
    if (embedObj.fields) {
      embedObj.fields.forEach(f => {
        fieldsHtml += `
          <div class="dc-embed-field ${f.fullwidth ? 'fullwidth' : ''}">
            <span class="dc-embed-field-title">${f.title}</span>
            <span class="dc-embed-field-val">${f.val}</span>
          </div>
        `;
      });
    }

    embedHtml = `
      <div class="dc-embed" style="border-left-color: #7c3aed">
        <div class="dc-embed-title">${embedObj.title}</div>
        ${embedObj.desc ? `<div class="dc-embed-desc">${embedObj.desc}</div>` : ''}
        ${fieldsHtml ? `<div class="dc-embed-fields">${fieldsHtml}</div>` : ''}
      </div>
    `;
  }

  const msgHtml = `
    <div class="dc-msg">
      <div class="dc-msg-avatar" style="background:${isBot ? '#7c3aed' : '#2b2d31'};">${avatar}</div>
      <div class="dc-msg-content">
        <div class="dc-msg-header">
          <span class="dc-msg-username" style="color:${isBot ? '#8b5cf6' : '#fff'};">${sender}</span>
          ${isBot ? '<span class="dc-msg-botbadge">BOT</span>' : ''}
          <span class="dc-msg-time">Today at ${timeStr}</span>
        </div>
        ${text ? `<div class="dc-msg-text">${text}</div>` : ''}
        ${embedHtml}
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', msgHtml);
  container.scrollTop = container.scrollHeight;
}

function viewCodeFile(fileKey) {
  document.querySelectorAll('.code-sidebar .code-file-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`code-btn-${fileKey}`).classList.add('active');
  let filename = 'bot.js';
  if (fileKey === 'pkg') filename = 'package.json';
  if (fileKey === 'readme') filename = 'README.md';

  document.getElementById('code-display-filename').textContent = filename;
  
  fetch(filename)
    .then(res => res.text())
    .then(text => {
      document.getElementById('code-display-block').textContent = text;
      CODE_SOURCES[fileKey] = text;
    })
    .catch(() => {
      document.getElementById('code-display-block').textContent = CODE_SOURCES[fileKey];
    });

  appState.activeCodeFile = fileKey;
}

function copySourceCode() {
  const code = CODE_SOURCES[appState.activeCodeFile || 'bot'];
  navigator.clipboard.writeText(code)
    .then(() => showToast('Source file copied to clipboard!', 'success'))
    .catch(() => showToast('Could not copy code automatically.', 'warning'));
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let emoji = 'ℹ️';
  if (type === 'success') emoji = '✅';
  if (type === 'warning') emoji = '⚠️';
  if (type === 'error') emoji = '❌';

  toast.innerHTML = `<span>${emoji}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Code Exporter Sources
const CODE_SOURCES = {
  pkg: `{
  "name": "custom-lobbies",
  "version": "1.0.0",
  "description": "Discord MMR lobby queue and serpentine team drafting bot for multiple game configurations",
  "main": "bot.js",
  "dependencies": {
    "discord.js": "^14.15.2",
    "dotenv": "^16.4.5"
  },
  "scripts": {
    "start": "node bot.js"
  },
  "author": "Antigravity Pair",
  "license": "MIT"
}`,
  readme: `# Custom Lobbies Multi-Game Discord Bot

This folder contains a ready-to-deploy Discord bot for custom game rooms, serpentine drafts, ELO/MMR progression tracking, and statistics.

## Setup
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Configure your bot token in \`.env\`.
3. Enable **Message Content Intent** in the Discord Developer Portal under the Bot tab.
4. Run the bot:
   \`\`\`bash
   npm start
   \`\`\`
`,
  bot: `/**
 * Custom Lobbies Multi-Game MMR Matchmaker & Serpentine Draft Bot
 * Supports independent ELO databases for: Arkheron, Zealot, and Hockey (Zealot Hockey).
 * Channel-locked: Commands only work for the game specified by the channel name.
 * Uses Discord.js v14
 */

const { Client, GatewayIntentBits, EmbedBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const DATABASE_FILE = './players_db.json';
let playersDb = {};

const GAMES = ['arkheron', 'hockey', 'zealot'];

if (fs.existsSync(DATABASE_FILE)) {
  playersDb = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf-8'));
} else {
  playersDb = {};
  saveDb();
}

function saveDb() {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(playersDb, null, 2));
}

let queues = {
  arkheron: [],
  hockey: [],
  zealot: []
};
let activeDrafts = {};
let activeLobbies = {};

client.once('ready', () => {
  console.log("Custom Lobbies Bot is online!");
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const content = message.content.trim();
  const username = message.author.username;

  let command = '';
  let argument = '';
  if (content.startsWith('-') || content.startsWith('!') || content.startsWith('/')) {
    const parts = content.substring(1).split(/ +/);
    command = parts.shift().toLowerCase();
    argument = parts.join(' ');
  } else {
    return;
  }

  let channelGame = null;
  const channelName = message.channel.name?.toLowerCase() || '';

  if (channelName.includes('arkheron')) channelGame = 'arkheron';
  else if (channelName.includes('hockey')) channelGame = 'hockey';
  else if (channelName.includes('zealot')) channelGame = 'zealot';

  if (command === 'help') {
    // prints help card...
  }

  if (!channelGame) return message.reply("⚠️ Please run commands in game channels.");
});`
};

// Render Profiles Tab content
function renderProfilesTab() {
  const container = document.getElementById('profiles-list-container');
  if (!container) return;

  // Render current user profile input fields
  const me = players.find(p => p.username === appState.currentUser);
  if (me) {
    document.getElementById('prof-edit-avatar').value = me.avatar || '👤';
    document.getElementById('prof-edit-ingame').value = me.ingameName || me.username;
    document.getElementById('prof-edit-steamhex').value = me.steamHex || '';
    document.getElementById('prof-edit-bio').value = me.bio || 'Competitive Custom Lobbies player.';
    document.getElementById('prof-edit-color').value = me.color || '#7c3aed';
    document.getElementById('prof-edit-color-hex').value = me.color || '#7c3aed';
  }

  // Render profiles list of all players
  container.innerHTML = players.map(p => {
    const wCount = p.warnings ? p.warnings.length : 0;
    const wBadge = wCount >= 3 
      ? `<span style="font-size: 0.65rem; background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; position: absolute; top: 8px; right: 8px;">⚠️ SUSPENDED (${wCount} Warns)</span>`
      : wCount > 0
        ? `<span style="font-size: 0.65rem; background: #eab308; color: black; padding: 2px 6px; border-radius: 4px; font-weight: bold; position: absolute; top: 8px; right: 8px;">⚠️ WARNED (${wCount}/3)</span>`
        : '';
        
    let wReasonsHtml = '';
    if (wCount > 0) {
      wReasonsHtml = `
        <div style="font-size: 0.7rem; color: #f87171; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 4px; margin-top: 4px;">
          <strong>Warns:</strong> ${p.warnings.map(w => w.reason).join(', ')}
        </div>
      `;
    }

    return `
      <div class="db-card" style="padding: 12px; display: flex; flex-direction: column; gap: 8px; border: 1.5px solid ${p.color || '#7c3aed'}; background: var(--dc-bg-chat); border-radius: 6px; position: relative; box-shadow: 0 0 10px ${p.color || '#7c3aed'}22;">
        ${wBadge}
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.5rem;">${p.avatar || '👤'}</span>
          <div>
            <div style="font-weight: bold; font-size: 0.9rem; color: white;">${p.username}</div>
            <div style="font-size: 0.75rem; color: var(--dc-text-muted);">In-game: <span style="color: #a78bfa;">${p.ingameName || p.username}</span></div>
            <div style="font-size: 0.65rem; color: var(--dc-text-muted); font-family: monospace;">Hex: <span style="color: #e9d5ff;">${p.steamHex || 'Not set'}</span></div>
          </div>
        </div>
        <div style="font-style: italic; font-size: 0.8rem; color: var(--dc-text-muted); border-top: 1px solid var(--db-border); padding-top: 6px; min-height: 38px;">
          "${p.bio || 'Competitive Custom Lobbies player.'}"
          ${wReasonsHtml}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: white; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px;">
          <span>🧜 Ark: <strong>${p.games.arkheron?.elo || 1000}</strong></span>
          <span>🏒 Hock: <strong>${p.games.hockey?.elo || 1000}</strong></span>
          <span>🛡️ Zea: <strong>${p.games.zealot?.elo || 1000}</strong></span>
        </div>
      </div>
    `;
  }).join('');
}

function saveUserProfile() {
  const avatarInput = document.getElementById('prof-edit-avatar').value.trim();
  const bioInput = document.getElementById('prof-edit-bio').value.trim();
  const ingameInput = document.getElementById('prof-edit-ingame').value.trim();
  const steamHexInput = document.getElementById('prof-edit-steamhex').value.trim();
  const colorInput = document.getElementById('prof-edit-color').value.trim();

  const me = players.find(p => p.username === appState.currentUser);
  if (me) {
    if (steamHexInput) {
      const cleanHex = steamHexInput.replace(/^steam:/i, '').toLowerCase();
      if (!/^1100001[0-9a-f]{8}$/i.test(cleanHex)) {
        showToast("Invalid Steam Hex format! Must be a 15-char hex starting with 1100001.", "warning");
        return;
      }
      me.steamHex = cleanHex;
    } else {
      me.steamHex = '';
    }

    me.avatar = avatarInput || '👤';
    me.bio = bioInput || 'Competitive Custom Lobbies player.';
    me.ingameName = ingameInput || me.username;
    me.color = colorInput || '#7c3aed';
    
    // Sync current user's profile inside client
    renderProfilesTab();
    updateVoiceChannelsUI();
    showToast("Profile changes saved!", "success");
  }
}

// ==========================================
// TOURNAMENTS SECTION LOGIC
// ==========================================

function getActiveTournament() {
  if (!appState.activeTournamentId && appState.tournaments.length > 0) {
    appState.activeTournamentId = appState.tournaments[appState.tournaments.length - 1].id;
  }
  return appState.tournaments.find(t => t.id === appState.activeTournamentId);
}

function selectTournament(id) {
  appState.activeTournamentId = id;
  renderTournamentsTab();
}

function initCustomTournament() {
  const game = document.getElementById('tourney-select-game').value;
  const type = document.getElementById('tourney-select-type').value;

  const newTourn = {
    id: 'TOURN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
    name: 'Community Open Cup',
    game,
    type,
    status: 'signup',
    pool: [],
    captains: [],
    budgets: {},
    teams: {},
    nominationTurn: '',
    currentBidding: { player: null, highestBidder: null, highestBid: 0 },
    matches: []
  };

  appState.tournaments.push(newTourn);
  appState.activeTournamentId = newTourn.id;

  showToast(`Tournament created for ${game.toUpperCase()}!`, 'success');
  renderTournamentsTab();
}

function registerTourneyUser(username) {
  const t = getActiveTournament();
  if (!t || t.status !== 'signup') return;
  if (t.pool.includes(username)) {
    showToast("Player already registered!", "warning");
    return;
  }
  t.pool.push(username);
  showToast(`${username} registered for the cup!`, "success");
  renderTournamentsTab();
}

function addMockSignups() {
  const t = getActiveTournament();
  if (!t) return;
  players.forEach(p => {
    const requiredPlayers = t.game === 'hockey' ? 8 : 6;
    if (t.pool.length < requiredPlayers && !t.pool.includes(p.username)) {
      t.pool.push(p.username);
    }
  });
  showToast("Mock players added to signup pool!", "info");
  renderTournamentsTab();
}

function startTourneyDraft() {
  const t = getActiveTournament();
  if (!t) return;
  const requiredPlayers = t.game === 'hockey' ? 8 : 6;
  if (t.pool.length < requiredPlayers) {
    showToast(`Need at least ${requiredPlayers} players to start draft!`, "warning");
    return;
  }

  const game = t.game;
  const sorted = [...t.pool].map(pName => {
    const pl = players.find(p => p.username === pName);
    return { name: pName, elo: pl?.games[game]?.elo || 1000 };
  }).sort((a, b) => b.elo - a.elo);

  const capA = sorted[0].name;
  const capB = sorted[1].name;

  t.captains = [capA, capB];
  t.teams = { [capA]: [capA], [capB]: [capB] };
  t.pool = sorted.slice(2).map(p => p.name);
  t.status = 'draft';

  if (t.type === 'snake') {
    t.turn = capB;
    t.pickSequence = game === 'hockey' ? [capB, capA, capA, capB, capB, capA] : [capB, capA, capA, capB];
    t.pickIdx = 0;
  } else {
    t.budgets = { [capA]: 100, [capB]: 100 };
    t.nominationTurn = capA;
  }

  showToast("Tournament draft has begun!", "success");
  renderTournamentsTab();
}

function pickTourneySnakePlayer(player) {
  const t = getActiveTournament();
  if (!t || t.status !== 'draft' || t.type !== 'snake') return;

  const currentCap = t.turn;
  t.teams[currentCap].push(player);
  t.pool = t.pool.filter(p => p !== player);

  t.pickIdx++;
  if (t.pickIdx < t.pickSequence.length) {
    t.turn = t.pickSequence[t.pickIdx];
  } else {
    resolveTourneyMatches();
  }
  renderTournamentsTab();
}

function nominateTourneyPlayer(player) {
  const t = getActiveTournament();
  if (!t || t.status !== 'draft' || t.type !== 'auction') return;
  if (t.currentBidding.player) return;

  t.currentBidding = {
    player,
    highestBidder: t.nominationTurn,
    highestBid: 1
  };
  showToast(`${player} nominated onto the block!`, "info");
  renderTournamentsTab();
}

function bidTourneyPlayer(cap, amount) {
  const t = getActiveTournament();
  if (!t || !t.currentBidding.player) return;

  if (amount <= t.currentBidding.highestBid) {
    showToast("Bid must exceed the current highest bid!", "warning");
    return;
  }
  if (amount > t.budgets[cap]) {
    showToast(`Insufficient budget! Remainder: ${t.budgets[cap]}`, "warning");
    return;
  }

  t.currentBidding.highestBid = amount;
  t.currentBidding.highestBidder = cap;
  showToast(`${cap} bid ${amount} credits!`, "success");
  renderTournamentsTab();
}

function sellTourneyPlayer() {
  const t = getActiveTournament();
  if (!t || !t.currentBidding.player) return;

  const player = t.currentBidding.player;
  const winner = t.currentBidding.highestBidder;
  const cost = t.currentBidding.highestBid;

  t.teams[winner].push(player);
  t.budgets[winner] -= cost;
  t.pool = t.pool.filter(p => p !== player);

  showToast(`SOLD! ${player} goes to Team ${winner} for ${cost} pts!`, "success");
  t.currentBidding = { player: null, highestBidder: null, highestBid: 0 };

  const capA = t.captains[0];
  const capB = t.captains[1];
  const targetSize = t.game === 'hockey' ? 4 : 3;

  if (t.teams[capA].length === targetSize && t.teams[capB].length === targetSize) {
    resolveTourneyMatches();
  } else {
    t.nominationTurn = t.nominationTurn === capA ? capB : capA;
  }
  renderTournamentsTab();
}

function resolveTourneyMatches() {
  const t = getActiveTournament();
  if (!t) return;
  t.status = 'progress';
  showToast("Running simulated brackets...", "info");

  setTimeout(() => {
    const capA = t.captains[0];
    const capB = t.captains[1];
    const scoreA = Math.floor(Math.random() * 3) + 3;
    const scoreB = scoreA === 5 ? Math.floor(Math.random() * 4) + 1 : 5;
    
    t.matches = [
      { round: 'Finals', teamA: `Team ${capA}`, teamB: `Team ${capB}`, scoreA, scoreB }
    ];

    const winnerCap = scoreA > scoreB ? capA : capB;
    const winnerTeam = t.teams[winnerCap];
    const loserCap = winnerCap === capA ? capB : capA;
    const loserTeam = t.teams[loserCap];

    winnerTeam.forEach(name => {
      const pl = players.find(p => p.username === name);
      if (pl?.games[t.game]) {
        pl.games[t.game].elo += 50;
        pl.games[t.game].wins++;
      }
    });

    loserTeam.forEach(name => {
      const pl = players.find(p => p.username === name);
      if (pl?.games[t.game]) {
        pl.games[t.game].elo = Math.max(800, pl.games[t.game].elo - 20);
        pl.games[t.game].losses++;
      }
    });

    t.status = 'complete';
    showToast(`Finals Complete! Team ${winnerCap} wins the Cup!`, "success");
    renderLeaderboard();
    renderTournamentsTab();
  }, 2500);
}

function simulateMonthlyLeague() {
  const game = document.getElementById('tourney-select-game').value;
  const type = document.getElementById('tourney-select-type').value;

  const newTourn = {
    id: 'TOURN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
    name: '🏆 Monthly League Championship 🏆',
    game,
    type,
    status: 'signup',
    pool: [],
    captains: [],
    budgets: {},
    teams: {},
    nominationTurn: '',
    currentBidding: { player: null, highestBidder: null, highestBid: 0 },
    matches: []
  };

  appState.tournaments.push(newTourn);
  appState.activeTournamentId = newTourn.id;

  players.forEach(p => {
    newTourn.pool.push(p.username);
  });

  const sorted = [...newTourn.pool].map(pName => {
    const pl = players.find(p => p.username === pName);
    return { name: pName, elo: pl?.games[game]?.elo || 1000 };
  }).sort((a, b) => b.elo - a.elo);

  const capA = sorted[0].name;
  const capB = sorted[1].name;

  newTourn.captains = [capA, capB];
  newTourn.teams = { [capA]: [capA], [capB]: [capB] };
  newTourn.pool = sorted.slice(2).map(p => p.name);
  newTourn.status = 'draft';

  if (type === 'snake') {
    newTourn.turn = capB;
    newTourn.pickSequence = game === 'hockey' ? [capB, capA, capA, capB, capB, capA] : [capB, capA, capA, capB];
    newTourn.pickIdx = 0;

    showToast("Monthly League Snake Draft Started!", "success");
    renderTournamentsTab();

    let pickTimer = setInterval(() => {
      const t = getActiveTournament();
      if (!t || t.id !== newTourn.id || t.status !== 'draft') {
        clearInterval(pickTimer);
        return;
      }
      const randomPlayer = t.pool[Math.floor(Math.random() * t.pool.length)];
      if (randomPlayer) {
        pickTourneySnakePlayer(randomPlayer);
      }
      if (t.status !== 'draft') {
        clearInterval(pickTimer);
      }
    }, 1000);
  } else {
    newTourn.budgets = { [capA]: 100, [capB]: 100 };
    newTourn.nominationTurn = capA;

    showToast("Monthly League Auction Draft Started!", "success");
    renderTournamentsTab();

    let auctionTimer = setInterval(() => {
      const t = getActiveTournament();
      if (!t || t.id !== newTourn.id || t.status !== 'draft') {
        clearInterval(auctionTimer);
        return;
      }
      if (!t.currentBidding.player) {
        const randomPlayer = t.pool[Math.floor(Math.random() * t.pool.length)];
        if (randomPlayer) nominateTourneyPlayer(randomPlayer);
      } else {
        const block = t.currentBidding;
        const bidCap = t.captains.find(c => c !== block.highestBidder);
        if (bidCap && t.budgets[bidCap] > block.highestBid) {
          const nextBid = block.highestBid + Math.floor(Math.random() * 15) + 1;
          if (nextBid <= t.budgets[bidCap]) {
            bidTourneyPlayer(bidCap, nextBid);
          }
        }
        setTimeout(sellTourneyPlayer, 800);
      }
    }, 2000);
  }
}

function renderTournamentsTab() {
  const t = getActiveTournament();
  const listContainer = document.getElementById('tourney-list-cards');
  const content = document.getElementById('tourney-panel-content');
  const displayName = document.getElementById('tourney-display-name');
  const displayStatus = document.getElementById('tourney-display-status');
  const signupActions = document.getElementById('tourney-signup-actions');

  if (listContainer) {
    listContainer.innerHTML = appState.tournaments.map(tourn => {
      const isActive = (t && t.id === tourn.id) ? 'border: 1.5px solid var(--dc-text-link); background: rgba(124,58,237,0.1);' : 'border: 1px solid var(--db-border);';
      const statusColor = tourn.status === 'signup' ? '#10b981' : (tourn.status === 'draft' ? '#8b5cf6' : '#94a3b8');
      return `
        <div onclick="selectTournament('${tourn.id}')" style="padding: 8px 12px; border-radius: 4px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; ${isActive}">
          <div style="font-size: 0.85rem; font-weight: bold; color: white; display: flex; justify-content: space-between;">
            <span>${tourn.name}</span>
            <span style="font-size: 0.7rem; color: ${statusColor};">${tourn.status.toUpperCase()}</span>
          </div>
          <div style="font-size: 0.7rem; color: var(--dc-text-muted);">Game: ${tourn.game.toUpperCase()} • Type: ${tourn.type.toUpperCase()}</div>
        </div>
      `;
    }).join('');
  }

  if (!t) {
    displayName.textContent = 'No Active Tournament';
    displayStatus.textContent = 'INACTIVE';
    displayStatus.style.background = 'var(--dc-bg-sidebar)';
    displayStatus.style.color = 'var(--dc-text-muted)';
    signupActions.innerHTML = '';
    content.innerHTML = `
      <div style="text-align: center; color: var(--dc-text-muted); padding: 60px 0;">
        <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🏆</span>
        Select a game and start a new tournament signup pool above, or trigger the automated Monthly League simulation.
      </div>
    `;
    return;
  }

  displayName.textContent = t.name;
  displayStatus.textContent = t.status.toUpperCase();
  displayStatus.style.color = 'white';

  if (t.status === 'signup') {
    displayStatus.style.background = '#10b981';
    signupActions.innerHTML = `
      <button class="btn btn-secondary" onclick="registerTourneyUser('${appState.currentUser}')">Join Pool</button>
      <button class="btn btn-secondary" onclick="addMockSignups()">Add Mock Players</button>
      <button class="btn btn-primary" onclick="startTourneyDraft()">Start Draft</button>
    `;

    const listHtml = t.pool.map((p, idx) => `
      <div style="padding: 10px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid var(--db-border); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: white;">${idx+1}. ${p}</span>
        <span style="font-size: 0.8rem; color: var(--dc-text-muted);">MMR: ${players.find(pl => pl.username === p)?.games[t.game]?.elo || 1000}</span>
      </div>
    `).join('') || '<div style="color:var(--dc-text-muted); font-size:0.9rem; text-align:center;">No players registered. Click Join Pool or Add Mock Players!</div>';

    content.innerHTML = `
      <div>
        <div style="font-weight: bold; color: white; margin-bottom: 8px; font-size: 1rem;">👥 Registered Entrants (${t.pool.length})</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-top: 12px;">
          ${listHtml}
        </div>
      </div>
    `;
  } 
  else if (t.status === 'draft') {
    displayStatus.style.background = '#8b5cf6';
    signupActions.innerHTML = '';

    const capA = t.captains[0];
    const capB = t.captains[1];

    if (t.type === 'snake') {
      const activeCap = t.turn;
      const listHtml = t.pool.map(pName => {
        const pl = players.find(p => p.username === pName);
        const elo = pl?.games[t.game]?.elo || 1000;
        return `
          <div style="padding: 10px; border-radius: 6px; background: var(--dc-bg-chat); border: 1px solid var(--db-border); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; color: white; font-size: 0.9rem;">${pName}</div>
              <div style="font-size: 0.75rem; color: var(--dc-text-muted);">MMR: ${elo}</div>
            </div>
            <button class="btn btn-primary" onclick="pickTourneySnakePlayer('${pName}')" ${appState.currentUser === activeCap ? '' : 'disabled'} style="font-size: 0.75rem; padding: 4px 8px;">Pick</button>
          </div>
        `;
      }).join('');

      content.innerHTML = `
        <div style="text-align: center; font-weight: bold; color: #a78bfa; margin-bottom: 12px; font-size: 1.05rem;">
          🎯 Turn: Captain **${activeCap}** is picking!
        </div>
        <div style="display: grid; grid-template-columns: 240px 240px 1fr; gap: 20px;">
          <!-- Team Alpha -->
          <div class="db-card" style="padding: 12px; background: rgba(0,0,0,0.15);">
            <div style="font-weight: bold; color: #10b981; font-size: 0.9rem; margin-bottom: 8px;">🟢 Team ${capA}</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${t.teams[capA].map(p => `<div style="font-size:0.8rem; font-weight:bold; color:white;">• ${p}</div>`).join('')}
            </div>
          </div>
          <!-- Team Beta -->
          <div class="db-card" style="padding: 12px; background: rgba(0,0,0,0.15);">
            <div style="font-weight: bold; color: #3b82f6; font-size: 0.9rem; margin-bottom: 8px;">🔵 Team ${capB}</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${t.teams[capB].map(p => `<div style="font-size:0.8rem; font-weight:bold; color:white;">• ${p}</div>`).join('')}
            </div>
          </div>
          <!-- Selection Pool -->
          <div>
            <div style="font-weight: bold; color: white; margin-bottom: 8px; font-size: 0.9rem;">👥 Players Selection Pool</div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto;">
              ${listHtml}
            </div>
          </div>
        </div>
      `;
    } 
    else if (t.type === 'auction') {
      const activeBid = t.currentBidding;
      const onBlockHtml = activeBid.player ? `
        <div class="db-card" style="padding: 16px; background: rgba(245,158,11,0.05); border: 1.5px solid #f59e0b; text-align: center;">
          <div style="font-size: 0.75rem; color: #f59e0b; font-weight: bold; margin-bottom: 4px;">ON THE BIDDING BLOCK</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: white; margin-bottom: 4px;">${activeBid.player}</div>
          <div style="font-size: 0.8rem; color: var(--dc-text-muted); margin-bottom: 12px;">MMR: ${players.find(pl => pl.username === activeBid.player)?.games[t.game]?.elo || 1000}</div>
          
          <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 12px;">
            <div>
              <span style="display: block; font-size: 0.7rem; color: var(--dc-text-muted);">CURRENT BID</span>
              <strong style="font-size: 1.2rem; color: #fbbf24;">${activeBid.highestBid} Credits</strong>
            </div>
            <div>
              <span style="display: block; font-size: 0.7rem; color: var(--dc-text-muted);">HIGHEST BIDDER</span>
              <strong style="font-size: 1.2rem; color: white;">${activeBid.highestBidder}</strong>
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 8px;">
            <input type="number" id="tourney-bid-input" value="${activeBid.highestBid + 5}" style="width: 80px; padding: 6px; border-radius: 4px; border: 1px solid var(--db-border); background: var(--db-bg); color: white; text-align: center;">
            <button class="btn btn-primary" onclick="bidTourneyPlayer('${appState.currentUser}', parseInt(document.getElementById('tourney-bid-input').value))" ${t.captains.includes(appState.currentUser) ? '' : 'disabled'}>Place Bid</button>
            <button class="btn btn-secondary" onclick="sellTourneyPlayer()">Hammer Sold</button>
          </div>
        </div>
      ` : `
        <div style="border: 1px dashed var(--db-border); border-radius: 6px; padding: 30px; text-align: center; color: var(--dc-text-muted);">
          Waiting for Captain <strong>${t.nominationTurn}</strong> to nominate a player.
        </div>
      `;

      const poolHtml = t.pool.map(pName => {
        const pl = players.find(p => p.username === pName);
        const elo = pl?.games[t.game]?.elo || 1000;
        return `
          <div style="padding: 8px 12px; border-radius: 4px; background: var(--dc-bg-chat); border: 1px solid var(--db-border); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; color: white; font-size: 0.85rem;">${pName}</div>
              <div style="font-size: 0.75rem; color: var(--dc-text-muted);">MMR: ${elo}</div>
            </div>
            <button class="btn btn-secondary" onclick="nominateTourneyPlayer('${pName}')" ${appState.currentUser === t.nominationTurn && !activeBid.player ? '' : 'disabled'} style="font-size: 0.75rem; padding: 4px 8px;">Nominate</button>
          </div>
        `;
      }).join('');

      content.innerHTML = `
        <div style="display: grid; grid-template-columns: 240px 1fr 240px; gap: 20px;">
          <!-- Team Alpha -->
          <div class="db-card" style="padding: 12px; background: rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--db-border); padding-bottom: 6px;">
              <span style="font-weight: bold; color: #10b981; font-size: 0.85rem;">🟢 Team ${capA}</span>
              <strong style="color: white; font-size: 0.85rem;">${t.budgets[capA]} pts</strong>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${t.teams[capA].map(p => `<div style="font-size:0.8rem; font-weight:bold; color:white;">• ${p}</div>`).join('')}
            </div>
          </div>

          <!-- Bidding block -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${onBlockHtml}
            <div>
              <div style="font-weight: bold; color: white; margin-bottom: 6px; font-size: 0.9rem;">👥 Players Selection Pool</div>
              <div style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
                ${poolHtml}
              </div>
            </div>
          </div>

          <!-- Team Beta -->
          <div class="db-card" style="padding: 12px; background: rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--db-border); padding-bottom: 6px;">
              <span style="font-weight: bold; color: #3b82f6; font-size: 0.85rem;">🔵 Team ${capB}</span>
              <strong style="color: white; font-size: 0.85rem;">${t.budgets[capB]} pts</strong>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${t.teams[capB].map(p => `<div style="font-size:0.8rem; font-weight:bold; color:white;">• ${p}</div>`).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }
}

// ==========================================
// COMMUNITY FORUMS LOGIC
// ==========================================

function submitForumPost() {
  const titleInput = document.getElementById('forum-title-input');
  const catSelect = document.getElementById('forum-category-input');
  const contentInput = document.getElementById('forum-content-input');

  const title = titleInput.value.trim();
  const category = catSelect.value;
  const content = contentInput.value.trim();

  if (!title || !content) {
    showToast("Please fill in both the title and message!", "warning");
    return;
  }

  const newPost = {
    id: 'POST-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
    author: appState.currentUser,
    title,
    content,
    category,
    createdAt: new Date().toISOString()
  };

  appState.forumPosts.push(newPost);
  
  titleInput.value = '';
  contentInput.value = '';

  showToast("Forum post published!", "success");
  renderForumsTab();
}

function filterForumCategory(category) {
  appState.forumFilter = category;
  renderForumsTab();
}

function navigateToAuthorProfile(authorName) {
  const user = players.find(p => p.username === authorName);
  if (user) {
    switchTab('profiles');
    
    setTimeout(() => {
      const cards = document.getElementById('profiles-list-container').children;
      for (let card of cards) {
        if (card.innerHTML.includes(authorName)) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.transform = 'scale(1.05)';
          card.style.transition = 'all 0.3s ease';
          setTimeout(() => { card.style.transform = 'scale(1)'; }, 1500);
          break;
        }
      }
    }, 150);
  }
}

function renderForumsTab() {
  const feedContainer = document.getElementById('forum-posts-feed-container');
  if (!feedContainer) return;

  const filter = appState.forumFilter;
  const filteredPosts = appState.forumPosts.filter(p => filter === 'all' || p.category === filter);

  const sorted = [...filteredPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (sorted.length === 0) {
    feedContainer.innerHTML = `
      <div style="text-align: center; color: var(--dc-text-muted); padding: 40px 0;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">📡</span>
        No posts inside this category. Be the first to start a discussion!
      </div>
    `;
    return;
  }

  feedContainer.innerHTML = sorted.map(post => {
    const author = players.find(p => p.username === post.author) || {
      username: post.author,
      avatar: '👤',
      color: '#7c3aed',
      games: { arkheron: { elo: 1000 }, hockey: { elo: 1000 }, zealot: { elo: 1000 } }
    };

    const dateStr = new Date(post.createdAt).toLocaleDateString() + ' ' + new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const arkElo = author.games.arkheron?.elo || 1000;
    const hockElo = author.games.hockey?.elo || 1000;
    const zealElo = author.games.zealot?.elo || 1000;
    const avgElo = Math.round((arkElo + hockElo + zealElo) / 3);

    return `
      <div class="db-card" style="padding: 16px; border-left: 4px solid ${author.color || '#7c3aed'}; background: var(--dc-bg-sidebar); display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.5rem;">${author.avatar || '👤'}</span>
            <div>
              <div onclick="navigateToAuthorProfile('${author.username}')" style="font-weight: bold; color: white; cursor: pointer; text-decoration: underline; font-size: 0.95rem;">
                ${author.username}
              </div>
              <div style="font-size: 0.75rem; color: var(--dc-text-muted);">Avg MMR: <strong style="color: #a78bfa;">${avgElo}</strong> • Posted on ${dateStr}</div>
            </div>
          </div>
          <span style="font-size: 0.75rem; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--db-border); color: white;">
            #${post.category.toUpperCase()}
          </span>
        </div>
        <div style="font-weight: bold; font-size: 1.1rem; color: white; margin-top: 4px;">
          ${post.title}
        </div>
        <div style="font-size: 0.85rem; color: var(--dc-text-muted); line-height: 1.5; white-space: pre-wrap;">
          ${post.content}
        </div>
      </div>
    `;
  }).join('');
}
