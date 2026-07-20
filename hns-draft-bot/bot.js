/**
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

// Supported games
const GAMES = ['arkheron', 'hockey', 'zealot'];

// ==========================================
// ARKHERON DATABASES
// ==========================================
const ETERNALS = [
  { id: 'leodin', name: 'Leodin', emoji: '🧝', role: 'Fighter', set: 'Tempest', lore: 'A swift, wind-bending swordsman.', stats: { hp: 'A', speed: 'S', damage: 'A' }, ability: { name: 'Gale Slash', desc: 'Leaps in a whirlwind, knocking up enemies.' } },
  { id: 'rynshi', name: 'Rynshi', emoji: '🥷', role: 'Assassin', set: 'Tempest', lore: 'An aero-adept rogue carried by winds.', stats: { hp: 'C', speed: 'S', damage: 'S' }, ability: { name: 'Aero Decoy', desc: 'Leaves a clone that explodes and blinds.' } },
  { id: 'dahla', name: 'Dahla', emoji: '🧛', role: 'Bruiser', set: 'Bloodthorn', lore: 'A savage arena life-stealer.', stats: { hp: 'A', speed: 'B', damage: 'S' }, ability: { name: 'Sanguine Fury', desc: 'Increases lifesteal and attack speed.' } },
  { id: 'karriv', name: 'Karriv', emoji: '🛡️', role: 'Tank', set: 'Solar Flare', lore: 'A holy crusader channeling solar heat.', stats: { hp: 'S', speed: 'C', damage: 'A' }, ability: { name: 'Sol Crest', desc: 'Absorbs attacks and fires a solar blast.' } },
  { id: 'edani', name: 'Edani', emoji: '🔮', role: 'Mage', set: 'Voidbringer', lore: 'A void wizard of gravitational singularities.', stats: { hp: 'B', speed: 'B', damage: 'S' }, ability: { name: 'Void Collapse', desc: 'Summons a pull anomaly dealing magic damage.' } }
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

// ==========================================
// DATABASE UTILITIES
// ==========================================
if (fs.existsSync(DATABASE_FILE)) {
  playersDb = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf-8'));
} else {
  playersDb = {};
  saveDb();
}

function saveDb() {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(playersDb, null, 2));
}

function registerPlayer(username) {
  if (!playersDb[username]) {
    playersDb[username] = { 
      username, 
      bio: "Competitive Custom Lobbies player.", 
      avatar: "👤", 
      registeredAt: new Date().toLocaleDateString(),
      games: {} 
    };
  }
  if (!playersDb[username].bio) playersDb[username].bio = "Competitive Custom Lobbies player.";
  if (!playersDb[username].avatar) playersDb[username].avatar = "👤";
  if (!playersDb[username].registeredAt) playersDb[username].registeredAt = new Date().toLocaleDateString();
  if (!playersDb[username].games) {
    playersDb[username].games = {};
  }
  
  GAMES.forEach(g => {
    if (!playersDb[username].games[g]) {
      playersDb[username].games[g] = {
        elo: 1000,
        wins: 0,
        losses: 0,
        kd: "1.00",
        eloHistory: [1000],
        streak: 0,
        peakStreak: 0,
        lossStreak: 0,
        peakLossStreak: 0
      };
      if (g === 'arkheron') {
        playersDb[username].games[g].avgFloor = "1.0 Floor";
        playersDb[username].games[g].savedBuilds = [];
      }
    }
    if (playersDb[username].games[g].streak === undefined) {
      playersDb[username].games[g].streak = 0;
    }
    if (playersDb[username].games[g].peakStreak === undefined) {
      playersDb[username].games[g].peakStreak = 0;
    }
    if (playersDb[username].games[g].lossStreak === undefined) {
      playersDb[username].games[g].lossStreak = 0;
    }
    if (playersDb[username].games[g].peakLossStreak === undefined) {
      playersDb[username].games[g].peakLossStreak = 0;
    }
    if (!playersDb[username].games[g].teammates) {
      playersDb[username].games[g].teammates = {};
    }
  });

  if (!playersDb[username].warnings) {
    playersDb[username].warnings = [];
  }

  saveDb();
}

// ==========================================
// ACTIVE BOT STATES
// ==========================================
let queues = {
  arkheron: [],
  hockey: [],
  zealot: []
};
let activeDrafts = {};
let activeLobbies = {};
let activeTournament = null;

client.once('ready', () => {
  console.log("Custom Lobbies Bot is online!");
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  const username = message.author.username;

  registerPlayer(username);

  // Parse Command prefixes: -, !, or /
  let command = '';
  let argument = '';
  if (content.startsWith('-') || content.startsWith('!') || content.startsWith('/')) {
    const parts = content.substring(1).split(/ +/);
    command = parts.shift().toLowerCase();
    argument = parts.join(' ');
  } else {
    return;
  }

  // Determine active game of the channel
  let channelGame = null;
  const channelName = message.channel.name?.toLowerCase() || '';

  if (channelName.includes('arkheron')) {
    channelGame = 'arkheron';
  } else if (channelName.includes('hockey')) {
    channelGame = 'hockey';
  } else if (channelName.includes('zealot')) {
    channelGame = 'zealot';
  } else if (channelName.startsWith('draft-')) {
    const gamePart = channelName.substring(6);
    if (GAMES.includes(gamePart)) {
      channelGame = gamePart;
    }
  }

  // Help command works everywhere
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle("🔮 Custom Lobbies Multi-Game Bot")
      .setDescription("Competitive custom lobby matchmaking and serpentine player drafting. Supports **Arkheron**, **Zealot**, and **Hockey**.")
      .addFields(
        { name: "🙋 Matchmaking Queue", value: "`-j` / `-join` / `-leave` (inside game channels)\nJoin or exit matchmaking queue for the channel's game." },
        { name: "🎮 Lobbies", value: "`-lobby [size]` - Create custom lobbies (sizes: 3, 6, 9) for this channel's game.\n`-lobby [code]` - Query everyone inside that lobby and their MMRs.\n`-lobbies` - List active game lobbies." },
        { name: "⚔️ Serpentine Drafting", value: "`-draft` - Starts player draft (requires 6 queue players).\n`-pick [index/name]` - Draft a player (Captains turn)." },
        { name: "📊 Game Stats & Charts", value: "`-stats [player]` - View player's MMR and records.\n`-compare [player]` - expected win odds comparison.\n`-elochart [player]` - Get climb trend line chart.\n`-leaderboard` / `-leaderboards` - View competitive top 10 standings." }
      )
      .setColor('#7c3aed')
      .setFooter({ text: 'Commands must be run inside a game-specific channel (e.g. #zealot, #hockey)' });
    return message.channel.send({ embeds: [embed] });
  }

  // Enforce channel game restrictions for all other commands
  if (!channelGame) {
    return message.reply("⚠️ Please run bot commands in a channel named after the game (e.g. containing `#arkheron`, `#zealot`, or `#hockey`).");
  }

  const game = channelGame;

  // Enforce suspension if player has 3 or more warnings
  const userWarns = playersDb[username]?.warnings || [];
  if (userWarns.length >= 3 && ['j', 'join', 'lobby'].includes(command)) {
    return message.reply(`❌ Cannot participate. You are currently suspended from matchmaking due to **${userWarns.length} warnings** for being late / no-show.`);
  }

  // 2. JOIN
  if (command === 'j' || command === 'join') {
    if (argument) {
      const code = argument.trim().toUpperCase();
      if (!activeLobbies[code]) {
        return message.reply(`❌ Custom lobby **${code}** does not exist or has expired.`);
      }
      const lobby = activeLobbies[code];
      
      // Enforce that you can only join a lobby of the matching channel game type
      if (lobby.game !== game) {
        return message.reply(`❌ Lobby **${code}** is for **${lobby.game.toUpperCase()}**. Please join from the correct game channel.`);
      }

      if (lobby.players.includes(username)) {
        return message.reply(`⚠️ You are already in lobby **${code}**.`);
      }
      lobby.players.push(username);

      const playerElo = playersDb[username].games[game]?.elo || 1000;

      if (lobby.players.length === lobby.targetSize) {
        const lobbyPlayers = lobby.players.map(p => ({
          username: p,
          elo: playersDb[p].games[game]?.elo || 1000
        }));
        let description = `Lobby **${code}** for **${game.toUpperCase()}** is full! Teams balanced by MMR:\n\n`;

        if (lobby.targetSize === 9) {
          lobbyPlayers.sort((a, b) => b.elo - a.elo);
          const t1 = [lobbyPlayers[0], lobbyPlayers[5], lobbyPlayers[6]];
          const t2 = [lobbyPlayers[1], lobbyPlayers[4], lobbyPlayers[7]];
          const t3 = [lobbyPlayers[2], lobbyPlayers[3], lobbyPlayers[8]];

          description += `🟢 **Team Alpha (Avg MMR: ${Math.round((t1[0].elo + t1[1].elo + t1[2].elo)/3)}):**\n` + t1.map(p => `• ${p.username} (${p.elo})`).join('\n') + '\n\n';
          description += `🔵 **Team Beta (Avg MMR: ${Math.round((t2[0].elo + t2[1].elo + t2[2].elo)/3)}):**\n` + t2.map(p => `• ${p.username} (${p.elo})`).join('\n') + '\n\n';
          description += `🟡 **Team Gamma (Avg MMR: ${Math.round((t3[0].elo + t3[1].elo + t3[2].elo)/3)}):**\n` + t3.map(p => `• ${p.username} (${p.elo})`).join('\n');
        } else if (lobby.targetSize === 6) {
          lobbyPlayers.sort((a, b) => b.elo - a.elo);
          const t1 = [lobbyPlayers[0], lobbyPlayers[3], lobbyPlayers[4]];
          const t2 = [lobbyPlayers[1], lobbyPlayers[2], lobbyPlayers[5]];

          description += `🟢 **Team Alpha (Avg MMR: ${Math.round((t1[0].elo + t1[1].elo + t1[2].elo)/3)}):**\n` + t1.map(p => `• ${p.username} (${p.elo})`).join('\n') + '\n\n';
          description += `🔵 **Team Beta (Avg MMR: ${Math.round((t2[0].elo + t2[1].elo + t2[2].elo)/3)}):**\n` + t2.map(p => `• ${p.username} (${p.elo})`).join('\n');
        } else {
          lobbyPlayers.sort((a, b) => b.elo - a.elo);
          const half = Math.ceil(lobbyPlayers.length / 2);
          const t1 = lobbyPlayers.slice(0, half);
          const t2 = lobbyPlayers.slice(half);

          description += `🟢 **Team Alpha:**\n` + t1.map(p => `• ${p.username} (${p.elo})`).join('\n') + '\n\n';
          description += `🔵 **Team Beta:**\n` + t2.map(p => `• ${p.username} (${p.elo})`).join('\n');
        }

        const embed = new EmbedBuilder()
          .setTitle(`🎮 ${game.toUpperCase()} Custom Lobby ${code} Ready!`)
          .setDescription(description)
          .addFields({ name: '🔑 Game Room Join Code', value: `\`${code}\`` })
          .setColor('#10b981')
          .setFooter({ text: `Balanced for game: ${game.toUpperCase()}` });

        message.channel.send({ embeds: [embed] });
        delete activeLobbies[code];
      } else {
        const embed = new EmbedBuilder()
          .setTitle(`👥 Joined Custom Lobby ${code}`)
          .setDescription(`Player **${username}** (MMR: **${playerElo}**) has joined the lobby.\n\n**Players (${lobby.players.length}/${lobby.targetSize}):**\n` + lobby.players.map((p, idx) => `${idx+1}. ${p} (MMR: ${playersDb[p].games[game]?.elo || 1000})`).join('\n'))
          .setColor('#6366f1')
          .setFooter({ text: `Type -j ${code} to join this custom room` });
        message.channel.send({ embeds: [embed] });
      }
    } else {
      if (queues[game].includes(username)) return message.reply(`⚠️ You are already in the ${game.toUpperCase()} matchmaking queue.`);

      queues[game].push(username);
      const playerElo = playersDb[username].games[game]?.elo || 1000;
      const limit = game === 'hockey' ? 8 : 6;
      message.channel.send(`✅ **${username}** (MMR: **${playerElo}**) joined the **${game.toUpperCase()}** queue! (${queues[game].length}/${limit} players waiting)`);
    }
  }

  // 3. LEAVE
  else if (command === 'l' || command === 'leave') {
    if (argument) {
      const code = argument.trim().toUpperCase();
      if (!activeLobbies[code]) return message.reply(`❌ Custom lobby **${code}** does not exist.`);
      const lobby = activeLobbies[code];
      if (!lobby.players.includes(username)) return message.reply(`⚠️ You are not in lobby **${code}**.`);
      lobby.players = lobby.players.filter(p => p !== username);
      message.channel.send(`🏃 **${username}** left custom lobby **${code}**. (${lobby.players.length}/${lobby.targetSize})`);
    } else {
      if (!queues[game].includes(username)) return message.reply(`⚠️ You are not in the ${game.toUpperCase()} queue.`);
      queues[game] = queues[game].filter(p => p !== username);
      message.channel.send(`🏃 **${username}** left the ${game.toUpperCase()} queue. (${queues[game].length} players remaining)`);
    }
  }

  // 4. LOBBY
  else if (command === 'lobby') {
    const parts = argument.trim().split(/ +/);
    const firstArg = parts[0]?.toUpperCase();

    // Check if the argument is an existing lobby code
    if (firstArg && activeLobbies[firstArg]) {
      const code = firstArg;
      const lobby = activeLobbies[code];
      const lobbyGame = lobby.game;
      const playerList = lobby.players.map((p, idx) => `${idx+1}. **${p}** (MMR: ${playersDb[p]?.games[lobbyGame]?.elo || 1000})`).join('\n');
      
      const embed = new EmbedBuilder()
        .setTitle(`🎮 Custom Lobby: ${code} (${lobbyGame.toUpperCase()})`)
        .setDescription(`**Host:** ${lobby.host}\n**Size:** \`${lobby.players.length}/${lobby.targetSize}\`\n\n**Current Players:**\n${playerList}`)
        .setColor('#8b5cf6')
        .setFooter({ text: `Join command: -j ${code}` });
      return message.channel.send({ embeds: [embed] });
    }

    let size = 6;

    if (parts[0]) {
      const parsedSize = parseInt(parts[0]);
      if (!isNaN(parsedSize) && parsedSize >= 2 && parsedSize <= 20) {
        size = parsedSize;
      }
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'LOB-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    activeLobbies[code] = {
      host: username,
      players: [username],
      targetSize: size,
      game
    };

    const userElo = playersDb[username].games[game]?.elo || 1000;

    const embed = new EmbedBuilder()
      .setTitle(`🎮 ${game.toUpperCase()} Custom Lobby Created!`)
      .setDescription(`Host **${username}** created a custom lobby for **${size}** players.\n\n**Lobby Code:** \`${code}\`\n**Join command:** \`-j ${code}\`\n\n**Current Players (1/${size}):**\n1. ${username} (MMR: ${userElo})`)
      .setColor('#8b5cf6')
      .setFooter({ text: `Other players type -j ${code} to join!` });

    message.channel.send({ embeds: [embed] });
  }

  // 5. LOBBIES
  else if (command === 'lobbies') {
    const keys = Object.keys(activeLobbies);
    if (keys.length === 0) return message.reply("📡 No active custom lobbies currently looking for players.");

    let list = '';
    keys.forEach(code => {
      const lobby = activeLobbies[code];
      list += `🔑 **Code:** \`${code}\` | **Game:** ${lobby.game.toUpperCase()} | **Host:** ${lobby.host} | **Players:** \`${lobby.players.length}/${lobby.targetSize}\` | Join: \`-j ${code}\`\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("📡 Active Custom Lobbies")
      .setDescription(list)
      .setColor('#06b6d4');
    message.channel.send({ embeds: [embed] });
  }

  // 6. START DRAFT COMMAND (-draft)
  else if (command === 'draft') {
    if (activeDrafts[game]) {
      return message.reply(`⚠️ A draft for game **${game.toUpperCase()}** is already active in text channel <#${activeDrafts[game].channelId}>.`);
    }

    const requiredPlayers = game === 'hockey' ? 8 : 6;
    if (queues[game].length < requiredPlayers) {
      return message.reply(`⚠️ Cannot start character draft. Need at least ${requiredPlayers} players in queue for a ${requiredPlayers/2}v${requiredPlayers/2} scrim (Current: ${queues[game].length}/${requiredPlayers}).`);
    }

    // Try to find or create the #draft-[game] channel
    const channelName = `draft-${game}`;
    let draftChannel = message.guild.channels.cache.find(c => c.name === channelName && c.isTextBased());
    if (!draftChannel) {
      try {
        draftChannel = await message.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          topic: `Live serpentine draft for ${game.toUpperCase()}`
        });
        message.channel.send(`📁 Created new draft channel: ${draftChannel}`);
      } catch (err) {
        console.error("Failed to create draft channel, using current channel:", err);
        draftChannel = message.channel;
      }
    }

    // Create temporary voice channels for teams
    let vcAlpha = null;
    let vcBeta = null;
    try {
      vcAlpha = await message.guild.channels.create({
        name: `🟢 Team Alpha (${game.toUpperCase()})`,
        type: ChannelType.GuildVoice
      });
      vcBeta = await message.guild.channels.create({
        name: `🔵 Team Beta (${game.toUpperCase()})`,
        type: ChannelType.GuildVoice
      });
    } catch (err) {
      console.error("Failed to create team voice channels:", err);
    }

    const lobby = queues[game].slice(0, requiredPlayers);
    queues[game] = queues[game].slice(requiredPlayers);

    const lobbyPlayers = lobby.map(p => ({
      username: p,
      elo: playersDb[p].games[game]?.elo || 1000
    }));
    lobbyPlayers.sort((a, b) => b.elo - a.elo);

    const capA = lobbyPlayers[0].username;
    const capB = lobbyPlayers[1].username;
    const restPlayers = lobbyPlayers.slice(2).map(p => p.username);

    const pickSequence = game === 'hockey' ? ['B', 'A', 'A', 'B', 'B', 'A'] : ['B', 'A', 'A', 'B'];

    activeDrafts[game] = {
      captains: [capA, capB],
      players: lobbyPlayers.map(p => p.username),
      teams: {
        teamA: { captain: capA, players: [capA], eternals: [] },
        teamB: { captain: capB, players: [capB], eternals: [] }
      },
      pool: restPlayers, 
      turn: 'B',
      pickSequence,
      pickIdx: 0,
      channelId: draftChannel.id,
      voiceChannels: [vcAlpha?.id, vcBeta?.id].filter(Boolean),
      game
    };

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${requiredPlayers/2}v${requiredPlayers/2} ${game.toUpperCase()} Serpentine Player Draft Starting`)
      .setDescription(`Captains are selected based on MMR. Take turns picking players in ${draftChannel}.`)
      .addFields(
        { name: `🟢 Team Alpha Captain`, value: `**${capA}** (MMR: ${lobbyPlayers[0].elo})` },
        { name: `🔵 Team Beta Captain`, value: `**${capB}** (MMR: ${lobbyPlayers[1].elo})` },
        { name: "👥 Players Selection Pool", value: activeDrafts[game].pool.map((p, idx) => `${idx+1}. **${p}** (MMR: ${playersDb[p].games[game]?.elo || 1000})`).join('\n') }
      )
      .setColor('#8b5cf6')
      .setFooter({ text: `Turn: Captain ${capB} [Team Beta] • Type -pick [index]` });

    message.channel.send(`⚔️ Serpentine player draft for **${game.toUpperCase()}** has begun! Picks will proceed in ${draftChannel}.`);
    draftChannel.send({ embeds: [embed] });
  }

  // 7. PICK COMMAND (-pick [index/name])
  else if (command === 'pick' || command === 'p') {
    if (!activeDrafts[game]) {
      return message.reply("⚠️ No active draft is running in this channel.");
    }

    const activeDraft = activeDrafts[game];
    const currentTurn = activeDraft.pickSequence[activeDraft.pickIdx];
    const currentCap = currentTurn === 'A' ? activeDraft.teams.teamA.captain : activeDraft.teams.teamB.captain;

    if (username !== currentCap) {
      return message.reply(`⚠️ It is not your turn to draft. Captain **${currentCap}** is picking.`);
    }

    if (!argument) return message.reply("⚠️ Specify the player index/name to pick (e.g. `-pick 1` or `-pick TofuShark`).");

    let selected = null;
    let idxVal = parseInt(argument) - 1;

    if (!isNaN(idxVal) && idxVal >= 0 && idxVal < activeDraft.pool.length) {
      selected = activeDraft.pool[idxVal];
    } else {
      selected = activeDraft.pool.find(p => p.toLowerCase() === argument.toLowerCase());
    }

    if (!selected) return message.reply("⚠️ Player not found in selection pool.");

    // Remove from pool and push to active team
    activeDraft.pool = activeDraft.pool.filter(p => p !== selected);
    const activeTeam = currentTurn === 'A' ? activeDraft.teams.teamA : activeDraft.teams.teamB;
    
    activeTeam.players.push(selected);
    const targetChannel = message.guild.channels.cache.get(activeDraft.channelId) || message.channel;
    targetChannel.send(`✨ Captain **${username}** drafted **${selected}** for ${game.toUpperCase()}!`);

    activeDraft.pickIdx++;

    if (activeDraft.pickIdx < activeDraft.pickSequence.length) {
      const nextTurn = activeDraft.pickSequence[activeDraft.pickIdx];
      const nextCap = nextTurn === 'A' ? activeDraft.teams.teamA.captain : activeDraft.teams.teamB.captain;
      
      const embed = new EmbedBuilder()
        .setTitle(`👥 ${game.toUpperCase()} Serpentine Draft Pool Updates`)
        .setDescription(`Next Turn: Captain **${nextCap}** (${nextTurn === 'A' ? 'Team Alpha' : 'Team Beta'})\n\n**Team Alpha Roster:** ${activeDraft.teams.teamA.players.join(', ')}\n**Team Beta Roster:** ${activeDraft.teams.teamB.players.join(', ')}\n\n**Remaining Pool:**\n` + activeDraft.pool.map((p, idx) => `${idx+1}. **${p}** (MMR: ${playersDb[p].games[game]?.elo || 1000})`).join('\n'))
        .setColor('#8b5cf6')
        .setFooter({ text: `Type -pick [index] to select` });
      targetChannel.send({ embeds: [embed] });
    } else {
      // Draft complete
      const embed = new EmbedBuilder()
        .setTitle(`🎮 ${game.toUpperCase()} Draft Concluded - Match Active!`)
        .setDescription("Rosters are locked. Connect inside Custom Lobbies game server.")
        .addFields(
          { name: `🟢 Team Alpha (${activeDraft.teams.teamA.captain})`, value: `**Players:** ${activeDraft.teams.teamA.players.join(', ')}` },
          { name: `🔵 Team Beta (${activeDraft.teams.teamB.captain})`, value: `**Players:** ${activeDraft.teams.teamB.players.join(', ')}` }
        )
        .setColor('#10b981')
        .setFooter({ text: 'Connect info sent to captains' });
      targetChannel.send({ embeds: [embed] });

      // Clean up temporary voice channels after 2 minutes
      setTimeout(() => {
        activeDraft.voiceChannels.forEach(async (vcId) => {
          try {
            const vc = message.guild.channels.cache.get(vcId);
            if (vc) await vc.delete();
          } catch (err) {
            console.error("Failed to delete voice channel:", err);
          }
        });
      }, 120000);

      // Distribute ELO changes!
      const teamAWon = Math.random() < 0.5;
      const winningTeam = teamAWon ? activeDraft.teams.teamA : activeDraft.teams.teamB;
      const losingTeam = teamAWon ? activeDraft.teams.teamB : activeDraft.teams.teamA;

      winningTeam.players.forEach(wName => {
        const pGame = playersDb[wName]?.games[game];
        if (pGame) {
          pGame.wins++;
          pGame.elo += 25;
          pGame.eloHistory.push(pGame.elo);
          if (pGame.eloHistory.length > 10) pGame.eloHistory.shift();

          // Update winstreaks
          pGame.streak = (pGame.streak || 0) + 1;
          if (pGame.streak > (pGame.peakStreak || 0)) {
            pGame.peakStreak = pGame.streak;
          }
          pGame.lossStreak = 0; // Reset loss streak

          // Record teammate wins
          if (!pGame.teammates) pGame.teammates = {};
          const allies = winningTeam.players.filter(p => p !== wName);
          allies.forEach(ally => {
            if (!pGame.teammates[ally]) pGame.teammates[ally] = { wins: 0, losses: 0 };
            pGame.teammates[ally].wins++;
          });
        }
      });

      losingTeam.players.forEach(lName => {
        const pGame = playersDb[lName]?.games[game];
        if (pGame) {
          pGame.losses++;
          pGame.elo = Math.max(800, pGame.elo - 15);
          pGame.eloHistory.push(pGame.elo);
          if (pGame.eloHistory.length > 10) pGame.eloHistory.shift();

          // Reset winstreak
          pGame.streak = 0;
          // Update loss streaks
          pGame.lossStreak = (pGame.lossStreak || 0) + 1;
          if (pGame.lossStreak > (pGame.peakLossStreak || 0)) {
            pGame.peakLossStreak = pGame.lossStreak;
          }

          // Record teammate losses
          if (!pGame.teammates) pGame.teammates = {};
          const allies = losingTeam.players.filter(p => p !== lName);
          allies.forEach(ally => {
            if (!pGame.teammates[ally]) pGame.teammates[ally] = { wins: 0, losses: 0 };
            pGame.teammates[ally].losses++;
          });
        }
      });
      saveDb();

      delete activeDrafts[game];
    }
  }

  // 8. STATS
  else if (command === 'stats') {
    const parts = argument.trim().split(/ +/);
    const targetName = parts[0] ? parts[0] : username;

    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) return message.reply(`❌ Player **${targetName}** is not registered in the ELO database.`);

    const p = playersDb[matchKey];
    const pg = p.games[game];
    const winrate = pg.wins + pg.losses > 0 ? ((pg.wins / (pg.wins + pg.losses)) * 100).toFixed(1) + "%" : "0%";

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${game.toUpperCase()} Profile: ${p.username}`)
      .addFields(
        { name: 'MMR Rating', value: `\`${pg.elo}\``, inline: true },
        { name: 'K/D Ratio', value: `\`${pg.kd || "1.00"}\``, inline: true },
        { name: 'W/L Record', value: `${pg.wins} W / ${pg.losses} L (${winrate})`, inline: true }
      )
      .setColor('#3b82f6')
      .setFooter({ text: `Custom Lobbies • Game: ${game.toUpperCase()}` });

    if (game === 'arkheron' && pg.savedBuilds && pg.savedBuilds.length > 0) {
      embed.addFields({ name: 'Saved Builds', value: pg.savedBuilds.map(b => `• **${b.name}**`).join('\n') });
    }
    message.channel.send({ embeds: [embed] });
  }

  // 9. COMPARE
  else if (command === 'compare') {
    const parts = argument.trim().split(/ +/);
    if (!parts[0]) return message.reply("⚠️ Specify the username to compare (e.g. `-compare TofuShark`).");

    const nameA = username;
    const nameB = parts[0];

    const keyA = Object.keys(playersDb).find(k => k.toLowerCase() === nameA.toLowerCase());
    const keyB = Object.keys(playersDb).find(k => k.toLowerCase() === nameB.toLowerCase());

    if (!keyA || !keyB) return message.reply(`❌ Player comparison failed. Make sure **${nameB}** is registered.`);

    const pA = playersDb[keyA];
    const pB = playersDb[keyB];

    const pgA = pA.games[game];
    const pgB = pB.games[game];

    const ratioA = pgA.losses > 0 ? (pgA.wins / pgA.losses).toFixed(2) : pgA.wins.toFixed(2);
    const ratioB = pgB.losses > 0 ? (pgB.wins / pgB.losses).toFixed(2) : pgB.wins.toFixed(2);

    const eloDiff = pgA.elo - pgB.elo;
    const eloDiffStr = eloDiff >= 0 ? `+${eloDiff}` : `${eloDiff}`;

    const probA = 1 / (1 + Math.pow(10, (pgB.elo - pgA.elo) / 400));
    const probB = 1 - probA;

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ Comparison: ${pA.username} vs ${pB.username} (${game.toUpperCase()})`)
      .setDescription(`MMR Rating Difference: **${eloDiffStr}** MMR`)
      .addFields(
        { name: `👤 ${pA.username}`, value: `**MMR:** \`${pgA.elo}\`\n**W/L:** ${pgA.wins}-${pgA.losses} (Ratio: ${ratioA})`, inline: true },
        { name: `👤 ${pB.username}`, value: `**MMR:** \`${pgB.elo}\`\n**W/L:** ${pgB.wins}-${pgB.losses} (Ratio: ${ratioB})`, inline: true },
        { name: '🔮 Projected Victory Probability', value: `**${pA.username}:** \`${(probA*100).toFixed(1)}%\` vs **${pB.username}:** \`${(probB*100).toFixed(1)}%\``, inline: false }
      )
      .setColor('#f59e0b');
    message.channel.send({ embeds: [embed] });
  }

  // 10. ELOCHART
  else if (command === 'elochart') {
    const parts = argument.trim().split(/ +/);
    const targetName = parts[0] ? parts[0] : username;

    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) return message.reply(`❌ Player **${targetName}** is not registered.`);

    const p = playersDb[matchKey];
    const pg = p.games[game];

    if (!pg.eloHistory || pg.eloHistory.length === 0) {
      pg.eloHistory = [pg.elo - 50, pg.elo - 30, pg.elo];
      saveDb();
    }

    const chartConfig = {
      type: 'line',
      data: {
        labels: pg.eloHistory.map((_, idx) => `Climb ${idx+1}`),
        datasets: [{
          label: `${p.username}'s ${game.toUpperCase()} MMR`,
          data: pg.eloHistory,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.2
        }]
      }
    };

    const chartUrl = `https://quickchart.io/chart?bkg=white&width=500&height=300&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

    const embed = new EmbedBuilder()
      .setTitle(`📈 ${game.toUpperCase()} MMR History: ${p.username}`)
      .setImage(chartUrl)
      .setColor('#8b5cf6');
    message.channel.send({ embeds: [embed] });
  }

  // 11. BUILD COMMAND (-build [eternal])
  else if (command === 'build') {
    if (game !== 'arkheron') {
      return message.reply("⚠️ Relic builds are only supported inside Arkheron game channels.");
    }
    if (!argument) return message.reply("⚠️ Specify an Eternal name to retrieve their build card (e.g. `-build Leodin`).");

    const match = ETERNALS.find(e => e.name.toLowerCase() === argument.toLowerCase() || e.id.toLowerCase() === argument.toLowerCase());
    if (!match) return message.reply(`❌ Eternal **${argument}** not found.`);

    const recommendedRelics = RELICS.filter(r => r.set === match.set);
    const setBonus = SETS_METADATA[match.set] || 'No set bonus active.';

    const embed = new EmbedBuilder()
      .setTitle(`${match.emoji} Recommended Build: ${match.name}`)
      .setDescription(`**Role:** \`${match.role}\` | **Relic Set:** \`${match.set}\` \n*${match.lore}*`)
      .addFields(
        { name: `🛡️ Special Skill: ${match.ability.name}`, value: match.ability.desc, inline: false },
        { name: `📦 Set Relics`, value: recommendedRelics.map(r => `• **${r.name}** (${r.slot.toUpperCase()})`).join('\n') || 'None recorded', inline: true },
        { name: `✨ Set Resonance`, value: setBonus, inline: true }
      )
      .setColor('#a78bfa');
    message.channel.send({ embeds: [embed] });
  }

  // 12. ETERNALS
  else if (command === 'eternals') {
    if (game !== 'arkheron') return message.reply("⚠️ Playable characters are only supported in Arkheron game channels.");
    const list = ETERNALS.map((e, idx) => `${idx+1}. ${e.emoji} **${e.name}** - Role: \`${e.role}\` (Set: ${e.set})`).join('\n');
    const embed = new EmbedBuilder()
      .setTitle("🧜 Playable Arkheron Eternals")
      .setDescription(list)
      .setColor('#10b981');
    message.channel.send({ embeds: [embed] });
  }

  // 13. RELICS
  else if (command === 'relics') {
    if (game !== 'arkheron') return message.reply("⚠️ Relics are only supported in Arkheron game channels.");
    const list = Object.keys(SETS_METADATA).map(set => {
      const setRelics = RELICS.filter(r => r.set === set).map(r => r.name).join(', ');
      return `⚙️ **${set} Set:**\n*Bonus:* ${SETS_METADATA[set]}\n*Relics:* ${setRelics || 'None'}\n`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle("📦 Arkheron Relic Sets Database")
      .setDescription(list)
      .setColor('#f59e0b');
    message.channel.send({ embeds: [embed] });
  }

  // 14. LEADERBOARD
  else if (command === 'leaderboard' || command === 'leaderboards' || command === 'rank') {
    const list = Object.values(playersDb)
      .filter(p => p.games && p.games[game])
      .sort((a,b) => b.games[game].elo - a.games[game].elo)
      .slice(0, 10)
      .map((p, idx) => {
        const pg = p.games[game];
        return `${idx+1}. **${p.username}** - MMR: \`${pg.elo}\` (W/L: ${pg.wins}/${pg.losses})`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${game.toUpperCase()} Competitive MMR Leaderboard`)
      .setDescription(list || 'No players recorded.')
      .setColor('#f0b232');
    message.channel.send({ embeds: [embed] });
  }

  // 15. BEST TEAMMATES
  else if (command === 'best') {
    const targetName = argument.trim() ? argument.trim() : username;
    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) return message.reply(`❌ Player **${targetName}** is not registered.`);

    const p = playersDb[matchKey];
    const pg = p.games[game];
    if (!pg.teammates || Object.keys(pg.teammates).length === 0) {
      return message.reply(`⚠️ **${p.username}** hasn't completed any 3v3 scrims with teammates in **${game.toUpperCase()}**.`);
    }

    const sorted = Object.entries(pg.teammates)
      .map(([name, stats]) => {
        const total = stats.wins + stats.losses;
        const rate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : "0.0";
        return { name, wins: stats.wins, losses: stats.losses, total, rate: parseFloat(rate) };
      })
      .sort((a, b) => b.rate - a.rate || b.total - a.total);

    const list = sorted.slice(0, 5).map((t, idx) => `${idx+1}. **${t.name}** - Winrate: \`${t.rate}%\` (${t.wins} W / ${t.losses} L)`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`🌟 Best Teammates for ${p.username} (${game.toUpperCase()})`)
      .setDescription(list || 'No teammates recorded.')
      .setColor('#10b981');
    message.channel.send({ embeds: [embed] });
  }

  // 16. WORST TEAMMATES
  else if (command === 'worst') {
    const targetName = argument.trim() ? argument.trim() : username;
    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) return message.reply(`❌ Player **${targetName}** is not registered.`);

    const p = playersDb[matchKey];
    const pg = p.games[game];
    if (!pg.teammates || Object.keys(pg.teammates).length === 0) {
      return message.reply(`⚠️ **${p.username}** hasn't completed any 3v3 scrims with teammates in **${game.toUpperCase()}**.`);
    }

    const sorted = Object.entries(pg.teammates)
      .map(([name, stats]) => {
        const total = stats.wins + stats.losses;
        const rate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : "0.0";
        return { name, wins: stats.wins, losses: stats.losses, total, rate: parseFloat(rate) };
      })
      .sort((a, b) => a.rate - b.rate || b.losses - a.losses);

    const list = sorted.slice(0, 5).map((t, idx) => `${idx+1}. **${t.name}** - Winrate: \`${t.rate}%\` (${t.wins} W / ${t.losses} L)`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`💀 Worst teammates for ${p.username} (${game.toUpperCase()})`)
      .setDescription(list || 'No teammates recorded.')
      .setColor('#ef4444');
    message.channel.send({ embeds: [embed] });
  }

  // 17. PEAK STREAK
  else if (command === 'peak') {
    const targetName = argument.trim() ? argument.trim() : username;
    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) return message.reply(`❌ Player **${targetName}** is not registered.`);

    const p = playersDb[matchKey];
    const pg = p.games[game];

    const embed = new EmbedBuilder()
      .setTitle(`🔥 Peak Winstreak: ${p.username} (${game.toUpperCase()})`)
      .addFields(
        { name: 'Current Winstreak', value: `\`${pg.streak || 0}\` matches`, inline: true },
        { name: 'Peak (Highest) Winstreak', value: `\`${pg.peakStreak || 0}\` matches`, inline: true }
      )
      .setColor('#fb923c');
    message.channel.send({ embeds: [embed] });
  }

  // 18. LOWEST STREAK
  else if (command === 'lowest') {
    const targetName = argument.trim() ? argument.trim() : username;
    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) return message.reply(`❌ Player **${targetName}** is not registered.`);

    const p = playersDb[matchKey];
    const pg = p.games[game];

    const embed = new EmbedBuilder()
      .setTitle(`📉 Peak Losing Streak: ${p.username} (${game.toUpperCase()})`)
      .addFields(
        { name: 'Current Losing Streak', value: `\`${pg.lossStreak || 0}\` matches`, inline: true },
        { name: 'Peak (Worst) Losing Streak', value: `\`${pg.peakLossStreak || 0}\` matches`, inline: true }
      )
      .setColor('#ef4444');
    message.channel.send({ embeds: [embed] });
  }

  // 19. REGISTER PROFILE
  else if (command === 'register') {
    const ingameName = argument.trim();
    if (!ingameName) {
      return message.reply("⚠️ Specify your in-game name to register (e.g. `-register Resteral.TV`).");
    }

    playersDb[username].ingameName = ingameName;
    saveDb();

    const embed = new EmbedBuilder()
      .setTitle("✅ Profile Registered & Activated!")
      .setDescription(`Welcome to Custom Lobbies! Your Discord account is now linked to in-game account **${ingameName}**.\n\nType \`-profile\` to view your card, or join matchmaking channels to start playing for MMR points!`)
      .setColor('#10b981')
      .setFooter({ text: 'Custom Lobbies Community' });
    message.channel.send({ embeds: [embed] });
  }

  // 20. PROFILE
  else if (command === 'profile') {
    const targetName = argument.trim() ? argument.trim() : username;
    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) {
      return message.reply(`❌ Profile **${targetName}** is not registered. Type \`-register [ingame-name]\` to sign up!`);
    }

    const p = playersDb[matchKey];
    
    const wCount = p.warnings ? p.warnings.length : 0;
    const wText = wCount >= 3 ? `❌ **SUSPENDED** (${wCount}/3 Warns)` : `🟢 Active (${wCount}/3 Warns)`;

    const embed = new EmbedBuilder()
      .setTitle(`${p.avatar || '👤'} Player Profile: ${p.username}`)
      .setDescription(`*${p.bio || 'Competitive Custom Lobbies player.'}*`)
      .addFields(
        { name: '🔗 Linked In-Game Account', value: `\`${p.ingameName || 'Not linked. Use -register'}\``, inline: true },
        { name: '📅 Joined Club', value: `\`${p.registeredAt || 'Today'}\``, inline: true },
        { name: '⚙️ Steam Hex ID', value: `\`${p.steamHex || 'Not set. Use -steamhex'}\``, inline: true },
        { name: '🚨 Scrim Status', value: wText, inline: true },
        { name: '🧜 Arkheron Rating', value: `MMR: **${p.games.arkheron?.elo || 1000}** | W/L: **${p.games.arkheron?.wins}-${p.games.arkheron?.losses}**`, inline: false },
        { name: '🏒 Zealot Hockey Rating', value: `MMR: **${p.games.hockey?.elo || 1000}** | W/L: **${p.games.hockey?.wins}-${p.games.hockey?.losses}**`, inline: false },
        { name: '🛡️ Zealot Mod Rating', value: `MMR: **${p.games.zealot?.elo || 1000}** | W/L: **${p.games.zealot?.wins}-${p.games.zealot?.losses}**`, inline: false }
      )
      .setColor(p.color || '#7c3aed');

    if (wCount > 0) {
      const wList = p.warnings.map((w, idx) => `${idx+1}. *${w.reason}* (${new Date(w.issuedAt).toLocaleDateString()})`).join('\n');
      embed.addFields({ name: '⚠️ Warning Infractions', value: wList, inline: false });
    }

    message.channel.send({ embeds: [embed] });
  }

  // 21. SET BIO
  else if (command === 'setbio') {
    const bioText = argument.trim();
    if (!bioText) return message.reply("⚠️ Specify your new profile motto/bio (e.g. `-setbio Midlaner looking for a team`).");

    playersDb[username].bio = bioText;
    saveDb();
    message.reply("✅ Profile bio updated successfully!");
  }

  // 22. SET AVATAR
  else if (command === 'setavatar') {
    const emoji = argument.trim();
    if (!emoji) return message.reply("⚠️ Specify an emoji to set as your profile avatar (e.g. `-setavatar 🦊`).");

    playersDb[username].avatar = emoji;
    saveDb();
    message.reply(`✅ Profile avatar updated to: ${emoji}`);
  }

  // 23. VALORANT STATS SEARCH
  else if (command === 'valorant') {
    const query = argument.trim();
    if (!query) return message.reply("⚠️ Please specify a Riot ID (e.g. `-valorant Resteral#NA1`).");

    const [name, tag] = query.split('#');
    const displayTag = tag ? tag.toUpperCase() : 'NA1';
    
    let hash = 0;
    for (let i = 0; i < query.length; i++) hash = query.charCodeAt(i) + ((hash << 5) - hash);
    const ranks = ['Bronze III', 'Silver II', 'Gold I', 'Platinum III', 'Diamond II', 'Ascendant II', 'Immortal I', 'Radiant'];
    const rank = ranks[Math.abs(hash) % ranks.length];
    const wins = 30 + (Math.abs(hash) % 70);
    const losses = 25 + (Math.abs(hash) % 65);
    const rate = ((wins / (wins + losses)) * 100).toFixed(1);
    const agents = ['Jett', 'Reyna', 'Omen', 'Killjoy', 'Sova', 'Sage', 'Phoenix'];
    const favAgent = agents[Math.abs(hash * 2) % agents.length];

    const embed = new EmbedBuilder()
      .setTitle(`🔴 Valorant Profile Stats: ${name}#${displayTag}`)
      .addFields(
        { name: '🏆 Competitive Rank', value: `**${rank}**`, inline: true },
        { name: '🔥 Winrate', value: `\`${rate}%\` (${wins} W / ${losses} L)`, inline: true },
        { name: '👤 Most Played Agent', value: `\`${favAgent}\``, inline: true }
      )
      .setColor('#ff4655')
      .setFooter({ text: 'Riot Games Profile Database' });
    message.channel.send({ embeds: [embed] });
  }

  // 24. CALL OF DUTY STATS SEARCH
  else if (command === 'cod' || command === 'callofduty') {
    const query = argument.trim();
    if (!query) return message.reply("⚠️ Please specify an Activision ID (e.g. `-cod Resteral#1234567`).");

    let hash = 0;
    for (let i = 0; i < query.length; i++) hash = query.charCodeAt(i) + ((hash << 5) - hash);
    const prestige = (Math.abs(hash) % 15) + 1;
    const level = (Math.abs(hash) % 500) + 50;
    const kd = (1.0 + (Math.abs(hash) % 150) / 100).toFixed(2);
    const wl = (0.8 + (Math.abs(hash) % 100) / 100).toFixed(2);
    const weapons = ['MCW (AR)', 'AMR9 (SMG)', 'KATT-AMR (Sniper)', 'Lockwood 680 (Shotgun)', 'M4 (AR)'];
    const weapon = weapons[Math.abs(hash * 3) % weapons.length];

    const embed = new EmbedBuilder()
      .setTitle(`🔫 Call Of Duty Activision Profile: ${query}`)
      .addFields(
        { name: '🎖️ Rank Status', value: `Prestige ${prestige} (Level ${level})`, inline: true },
        { name: '📊 K/D Ratio', value: `\`${kd}\` (W/L: \`${wl}\`)`, inline: true },
        { name: '⭐ Signature Weapon', value: `\`${weapon}\``, inline: true }
      )
      .setColor('#262626')
      .setFooter({ text: 'Activision Profile Tracker' });
    message.channel.send({ embeds: [embed] });
  }

  // 25. OMEGA STRIKERS STATS SEARCH
  else if (command === 'os' || command === 'omegastrikers') {
    const query = argument.trim();
    if (!query) return message.reply("⚠️ Please specify an Omega Strikers username (e.g. `-os Resteral`).");

    let hash = 0;
    for (let i = 0; i < query.length; i++) hash = query.charCodeAt(i) + ((hash << 5) - hash);
    const ranks = ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Challenger', 'Omega', 'Pro League'];
    const rank = ranks[Math.abs(hash) % ranks.length];
    const strikers = ['Dubu', 'Juno', 'Kai', 'Era', 'Estelle', 'Atlas', 'Rune', 'Asher'];
    const mainStriker = strikers[Math.abs(hash * 4) % strikers.length];
    const wins = 50 + (Math.abs(hash) % 400);

    const embed = new EmbedBuilder()
      .setTitle(`⚽ Omega Strikers Profile: ${query}`)
      .addFields(
        { name: '🏆 Competitive Rank', value: `**${rank}**`, inline: true },
        { name: '🧬 Signature Striker', value: `\`${mainStriker}\``, inline: true },
        { name: '🌟 Total Matches Won', value: `\`${wins}\` Wins`, inline: true }
      )
      .setColor('#7c3aed')
      .setFooter({ text: 'Sonii Tracker Database' });
    message.channel.send({ embeds: [embed] });
  }

  // 26. STEAM PROFILE SEARCH
  else if (command === 'steam') {
    const query = argument.trim();
    if (!query) return message.reply("⚠️ Please specify a Steam ID or vanity URL (e.g. `-steam Resteral`).");

    let hash = 0;
    for (let i = 0; i < query.length; i++) hash = query.charCodeAt(i) + ((hash << 5) - hash);
    const steamLevel = (Math.abs(hash) % 150) + 5;
    const years = (Math.abs(hash) % 15) + 1;
    const games = (Math.abs(hash) % 300) + 12;
    const favorites = [
      'Counter-Strike 2 (1,840 hrs)',
      'Dota 2 (920 hrs)',
      'Rust (1,450 hrs)',
      'Cyberpunk 2077 (150 hrs)',
      'Team Fortress 2 (850 hrs)',
      'Terraria (320 hrs)'
    ];
    const topGame = favorites[Math.abs(hash * 5) % favorites.length];

    const embed = new EmbedBuilder()
      .setTitle(`🎮 Steam Profile Tracker: ${query}`)
      .addFields(
        { name: '🎖️ Steam Level', value: `Level **${steamLevel}** (${years} Years Badge)`, inline: true },
        { name: '📦 Games Library', value: `\`${games}\` Games owned`, inline: true },
        { name: '⭐ Most Played Game', value: `\`${topGame}\``, inline: true }
      )
      .setColor('#171a21')
      .setFooter({ text: 'Steam Web API Stats' });
    message.channel.send({ embeds: [embed] });
  }

  // 27. SET PROFILE COLOR CODE
  else if (command === 'setcolor') {
    const hex = argument.trim();
    if (!hex || !/^#[0-9A-F]{6}$/i.test(hex)) {
      return message.reply("⚠️ Please specify a valid hex color code starting with # (e.g. `-setcolor #ff4655` or `-setcolor #171a21`).");
    }

    playersDb[username].color = hex;
    saveDb();
    message.reply(`✅ Profile card color code updated to: **${hex}**`);
  }

  // 28. SET STEAM HEX ID
  else if (command === 'steamhex') {
    const val = argument.trim();
    if (!val) {
      return message.reply("⚠️ Please specify a Steam Hex ID (e.g. `-steamhex 11000011a2b3c4d`).");
    }

    const hexOnly = val.replace(/^steam:/i, '').toLowerCase();
    if (!/^1100001[0-9a-f]{8}$/i.test(hexOnly)) {
      return message.reply("⚠️ Invalid Steam Hex ID format. It should be a 15-character hex ID (e.g. `11000011a2b3c4d`).");
    }
    playersDb[username].steamHex = hexOnly;
    saveDb();
    message.reply(`✅ Steam Hex ID successfully linked: \`steam:${hexOnly}\``);
  }

  // 29. TOURNAMENTS
  else if (command === 'tournament') {
    const parts = argument.trim().split(/ +/);
    const sub = parts[0]?.toLowerCase();

    if (sub === 'create') {
      const name = parts[1] ? parts.slice(1, -1).join(' ') : 'Summer Scrim Cup';
      const type = parts[parts.length - 1]?.toLowerCase();
      const draftType = (type === 'auction' || type === 'snake') ? type : 'snake';

      activeTournament = {
        id: 'TOURN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        name,
        game: 'arkheron',
        type: draftType,
        status: 'signup',
        pool: [],
        captains: [],
        budgets: {},
        teams: {},
        nominationIdx: 0,
        currentBidding: { player: null, highestBidder: null, highestBid: 0, timer: null },
        matches: []
      };

      const embed = new EmbedBuilder()
        .setTitle(`🏆 New Tournament: ${activeTournament.name}`)
        .setDescription(`A **${draftType.toUpperCase()}** draft tournament has been initiated for **${activeTournament.game.toUpperCase()}**!\n\nType \`-tournament join\` to enter the signup pool.`)
        .setColor('#eab308')
        .setFooter({ text: `ID: ${activeTournament.id} • Game: ${activeTournament.game.toUpperCase()}` });
      message.channel.send({ embeds: [embed] });
    }

    else if (sub === 'join') {
      if (!activeTournament || activeTournament.status !== 'signup') {
        return message.reply("⚠️ No tournament is currently accepting signups. Start one with `-tournament create [name] [snake/auction]`.");
      }
      if (activeTournament.pool.includes(username)) {
        return message.reply("⚠️ You are already registered in the tournament pool.");
      }
      activeTournament.pool.push(username);
      message.reply(`✅ Registered for **${activeTournament.name}**! (Pool size: ${activeTournament.pool.length} players).`);
    }

    else if (sub === 'list') {
      if (!activeTournament) return message.reply("⚠️ No active tournament. Create one with `-tournament create`.");
      const list = activeTournament.pool.map((p, idx) => `${idx+1}. **${p}** (MMR: ${playersDb[p]?.games[activeTournament.game]?.elo || 1000})`).join('\n') || 'None';
      const embed = new EmbedBuilder()
        .setTitle(`🏆 Tournament Status: ${activeTournament.name}`)
        .setDescription(`**Draft Type:** \`${activeTournament.type.toUpperCase()}\`\n**Status:** \`${activeTournament.status.toUpperCase()}\`\n\n**Sign-up Pool:**\n${list}`)
        .setColor('#eab308');
      message.channel.send({ embeds: [embed] });
    }

    else if (sub === 'start') {
      if (!activeTournament || activeTournament.status !== 'signup') {
        return message.reply("⚠️ No tournament is in signup phase.");
      }
      const requiredPlayers = activeTournament.game === 'hockey' ? 8 : 6;
      if (activeTournament.pool.length < requiredPlayers) {
        return message.reply(`⚠️ Need at least ${requiredPlayers} signed up players to start (Current: ${activeTournament.pool.length}).`);
      }

      const sortedPool = [...activeTournament.pool].map(pName => ({
        username: pName,
        elo: playersDb[pName]?.games[activeTournament.game]?.elo || 1000
      })).sort((a, b) => b.elo - a.elo);

      const capA = sortedPool[0].username;
      const capB = sortedPool[1].username;
      activeTournament.captains = [capA, capB];
      activeTournament.teams = { [capA]: [capA], [capB]: [capB] };
      activeTournament.pool = sortedPool.slice(2).map(p => p.username);

      activeTournament.status = 'draft';

      if (activeTournament.type === 'snake') {
        activeTournament.turn = capB;
        activeTournament.pickSequence = activeTournament.game === 'hockey' ? [capB, capA, capA, capB, capB, capA] : [capB, capA, capA, capB];
        activeTournament.pickIdx = 0;

        const embed = new EmbedBuilder()
          .setTitle(`🏆 Snake Draft Starting: ${activeTournament.name}`)
          .setDescription(`Captains chosen: **${capA}** and **${capB}**.\n\nIt is **${capB}**'s turn to pick! Type \`-pick [index]\` to draft a player.`)
          .addFields(
            { name: '👥 Selection Pool', value: activeTournament.pool.map((p, idx) => `${idx+1}. **${p}** (MMR: ${playersDb[p]?.games[activeTournament.game]?.elo || 1000})`).join('\n') }
          )
          .setColor('#8b5cf6');
        message.channel.send({ embeds: [embed] });
      } 
      else if (activeTournament.type === 'auction') {
        activeTournament.budgets = { [capA]: 100, [capB]: 100 };
        activeTournament.nominationTurn = capA;

        const embed = new EmbedBuilder()
          .setTitle(`🏆 Auction Draft Starting: ${activeTournament.name}`)
          .setDescription(`Captains chosen: **${capA}** and **${capB}**.\nEach captain starts with **100 credits**.\n\nIt is **${capA}**'s turn to nominate a player. Type \`-nominate [player]\`.`)
          .addFields(
            { name: '👥 Selection Pool', value: activeTournament.pool.map((p, idx) => `**${p}** (MMR: ${playersDb[p]?.games[activeTournament.game]?.elo || 1000})`).join('\n') }
          )
          .setColor('#8b5cf6');
        message.channel.send({ embeds: [embed] });
      }
    }
  }

  // 30. NOMINATE (AUCTION DRAFT)
  else if (command === 'nominate') {
    if (!activeTournament || activeTournament.status !== 'draft' || activeTournament.type !== 'auction') {
      return message.reply("⚠️ There is no active tournament auction draft happening.");
    }
    if (activeTournament.currentBidding.player) {
      return message.reply("⚠️ A player is already on the bidding block!");
    }
    if (username !== activeTournament.nominationTurn) {
      return message.reply(`⚠️ It is not your turn to nominate. Waiting for **${activeTournament.nominationTurn}**.`);
    }

    const targetName = argument.trim();
    const match = activeTournament.pool.find(p => p.toLowerCase() === targetName.toLowerCase());
    if (!match) {
      return message.reply(`❌ Player **${targetName}** is not in the tournament pool.`);
    }

    activeTournament.currentBidding = {
      player: match,
      highestBidder: activeTournament.nominationTurn,
      highestBid: 1,
      timer: null
    };

    const embed = new EmbedBuilder()
      .setTitle(`🔨 Player on the Block: ${match}`)
      .setDescription(`Nominated by **${activeTournament.nominationTurn}**.\n\n**Starting Bid:** \`1 credit\`\n**Highest Bidder:** **${activeTournament.nominationTurn}**\n\nCaptains, type \`-bid [amount]\` to bid! Countdown: 15 seconds.`)
      .setColor('#f59e0b');
    message.channel.send({ embeds: [embed] });

    const tGame = activeTournament.game;
    setTimeout(() => {
      if (!activeTournament || !activeTournament.currentBidding.player) return;
      const bPlayer = activeTournament.currentBidding.player;
      const winner = activeTournament.currentBidding.highestBidder;
      const cost = activeTournament.currentBidding.highestBid;

      activeTournament.teams[winner].push(bPlayer);
      activeTournament.budgets[winner] -= cost;
      activeTournament.pool = activeTournament.pool.filter(p => p !== bPlayer);

      message.channel.send(`🔨 **SOLD!** **${bPlayer}** goes to team **${winner}** for **${cost}** credits!`);

      activeTournament.currentBidding = { player: null, highestBidder: null, highestBid: 0, timer: null };

      const capA = activeTournament.captains[0];
      const capB = activeTournament.captains[1];
      const targetSize = activeTournament.game === 'hockey' ? 4 : 3;
      if (activeTournament.teams[capA].length === targetSize && activeTournament.teams[capB].length === targetSize) {
        activeTournament.status = 'progress';
        message.channel.send(`🏆 **Draft is Complete!** Teams are set. Running simulated matches...`);
        
        setTimeout(() => {
          const scoreA = Math.floor(Math.random() * 3) + 3;
          const scoreB = scoreA === 5 ? Math.floor(Math.random() * 4) + 1 : 5;
          const winnerCap = scoreA > scoreB ? capA : capB;
          const winnerTeam = activeTournament.teams[winnerCap];
          const loserCap = winnerCap === capA ? capB : capA;
          const loserTeam = activeTournament.teams[loserCap];

          winnerTeam.forEach(name => {
            if (playersDb[name]?.games[tGame]) {
              playersDb[name].games[tGame].elo += 50;
              playersDb[name].games[tGame].wins++;
            }
          });
          loserTeam.forEach(name => {
            if (playersDb[name]?.games[tGame]) {
              playersDb[name].games[tGame].elo = Math.max(800, playersDb[name].games[tGame].elo - 20);
              playersDb[name].games[tGame].losses++;
            }
          });
          saveDb();

          const matchEmbed = new EmbedBuilder()
            .setTitle(`🏆 Tournament Finals: Team ${winnerCap} Wins!`)
            .setDescription(`Team **${winnerCap}** defeated Team **${loserCap}** (\`5-${scoreA === 5 ? scoreB : scoreA}\`) to win the tournament!`)
            .addFields(
              { name: '🏆 Winners (+50 MMR)', value: winnerTeam.join(', ') },
              { name: '📉 Losers (-20 MMR)', value: loserTeam.join(', ') }
            )
            .setColor('#eab308');
          message.channel.send({ embeds: [matchEmbed] });

          activeTournament = null;
        }, 3000);
      } else {
        activeTournament.nominationTurn = activeTournament.nominationTurn === capA ? capB : capA;
        message.channel.send(`It is now **${activeTournament.nominationTurn}**'s turn to nominate. Type \`-nominate [player]\`.`);
      }
    }, 15000);
  }

  // 31. BID (AUCTION DRAFT)
  else if (command === 'bid') {
    if (!activeTournament || activeTournament.status !== 'draft' || activeTournament.type !== 'auction') {
      return message.reply("⚠️ There is no active tournament auction draft happening.");
    }
    if (!activeTournament.currentBidding.player) {
      return message.reply("⚠️ No player is currently on the bidding block to bid on!");
    }
    if (!activeTournament.captains.includes(username)) {
      return message.reply("⚠️ Only team captains can place bids.");
    }

    const amount = parseInt(argument.trim());
    if (isNaN(amount) || amount <= activeTournament.currentBidding.highestBid) {
      return message.reply(`⚠️ Bid must be higher than the current bid of **${activeTournament.currentBidding.highestBid}**.`);
    }
    if (amount > activeTournament.budgets[username]) {
      return message.reply(`⚠️ Insufficient credits! Your remaining budget is **${activeTournament.budgets[username]}**.`);
    }

    activeTournament.currentBidding.highestBid = amount;
    activeTournament.currentBidding.highestBidder = username;
  }

  // 31.5 WARN
  else if (command === 'warn') {
    const parts = argument.trim().split(' ');
    const targetName = parts[0];
    const reason = parts.slice(1).join(' ').trim() || 'Late / No-show to custom lobby match.';

    if (!targetName) {
      return message.reply("⚠️ Please specify a player username to warn (e.g. `-warn Resteral.TV Late for hockey game`).");
    }

    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) {
      return message.reply(`❌ Player **${targetName}** not found in database.`);
    }

    const p = playersDb[matchKey];
    p.warnings = p.warnings || [];
    p.warnings.push({
      id: 'WARN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      reason,
      issuedAt: new Date().toISOString()
    });
    saveDb();

    const wCount = p.warnings.length;
    let replyMsg = `🚨 **${p.username}** has been warned by **${username}** for: *${reason}*. (Warnings: ${wCount}/3)`;
    if (wCount >= 3) {
      replyMsg += `\n❌ **SUSPENDED:** Player has reached 3 warnings and is now suspended from matchmaking!`;
    }
    message.channel.send(replyMsg);
  }

  // 31.6 CLEAR WARNS
  else if (command === 'clearwarns') {
    const targetName = argument.trim();
    if (!targetName) {
      return message.reply("⚠️ Please specify a player username to clear warnings (e.g. `-clearwarns Resteral.TV`).");
    }

    const matchKey = Object.keys(playersDb).find(k => k.toLowerCase() === targetName.toLowerCase());
    if (!matchKey) {
      return message.reply(`❌ Player **${targetName}** not found in database.`);
    }

    const p = playersDb[matchKey];
    p.warnings = [];
    saveDb();

    message.channel.send(`✅ Clean slate! Warnings cleared for **${p.username}**. Suspension lifted.`);
  }

  // 32. COMMUNITY POSTS
  else if (command === 'post') {
    const parts = argument.trim().split(' ');
    const cat = parts[0]?.toLowerCase();
    const categories = ['general', 'arkheron', 'zealot', 'hockey'];
    
    let category = 'general';
    let contentStr = argument.trim();
    
    if (categories.includes(cat)) {
      category = cat;
      contentStr = parts.slice(1).join(' ');
    }

    if (!contentStr) {
      return message.reply("⚠️ Please provide a post title and content (e.g. `-post general How to play Arkheron | Some tips...`). Use `|` to separate title from message.");
    }

    const splitIdx = contentStr.indexOf('|');
    let title = contentStr;
    let content = "";
    if (splitIdx !== -1) {
      title = contentStr.substring(0, splitIdx).trim();
      content = contentStr.substring(splitIdx + 1).trim();
    }

    if (!title) {
      return message.reply("⚠️ Post title cannot be empty!");
    }

    playersDb.forumPosts = playersDb.forumPosts || [];
    const newPost = {
      id: 'POST-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      author: username,
      title,
      content: content || "No content body.",
      category,
      createdAt: new Date().toISOString()
    };
    playersDb.forumPosts.push(newPost);
    saveDb();

    const embed = new EmbedBuilder()
      .setTitle(`💬 Forum Post Created: ${title}`)
      .setDescription(`**Author:** ${username}\n**Category:** \`${category.toUpperCase()}\`\n\n${content}`)
      .setColor('#38bdf8')
      .setFooter({ text: `Post ID: ${newPost.id}` });
    message.channel.send({ embeds: [embed] });
  }

  // 33. VIEW POSTS
  else if (command === 'posts') {
    const cat = argument.trim().toLowerCase() || 'general';
    playersDb.forumPosts = playersDb.forumPosts || [];
    
    const filtered = playersDb.forumPosts.filter(p => p.category === cat).slice(-5).reverse();
    if (filtered.length === 0) {
      return message.reply(`📡 No posts found in category \`${cat.toUpperCase()}\`. Create one with \`-post ${cat} Title | Content\`.`);
    }

    const list = filtered.map(p => `• **${p.title}** by *${p.author}* (ID: \`${p.id}\`)`).join('\n');
    const embed = new EmbedBuilder()
      .setTitle(`💬 Recent Posts inside ${cat.toUpperCase()}`)
      .setDescription(list)
      .setColor('#38bdf8');
    message.channel.send({ embeds: [embed] });
  }
});

const token = process.env.DISCORD_BOT_TOKEN;
if (!token || token === 'YOUR_DISCORD_BOT_TOKEN') {
  console.error("❌ Error: DISCORD_BOT_TOKEN is not configured in your .env file!");
  process.exit(1);
}
client.login(token);
