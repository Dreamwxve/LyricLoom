const { Client, GatewayIntentBits, Partials, ActivityType, Collection, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { connect, connection, set } = require('mongoose');
const Utils = require('../Handler/Utils');
const { Kazagumo, Plugins } = require('kazagumo');
const Spotify = require('kazagumo-spotify');
const { Connectors } = require('shoukaku');
const { readdirSync } = require('node:fs');
const { join } = require('path');
const PlayerExtends = require('./DispatcherExtend');
const spotify = require('./Spotify');
const Topgg = require("@top-gg/sdk");
const topggApi = new Topgg.Api("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwNDQ1OTYwNTA4NTk2NjM0MDEiLCJib3QiOnRydWUsImlhdCI6MTY5NTIyMDMzOX0.Avm5V-TERBa_hq9Fbh35lX7wmMNWe5QF7Pvhl_bAUIE");
const client = require('discord.js')
const Intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
];

class Savaan extends Client {
    constructor() {
        super({
            shards: 'auto',
            allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: false },
            intents: Intents,
            partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User, Partials.Reaction],
            ws: Intents,
            restTimeOffset: 0,
            restRequestTimeout: 20000,
        });
        this.Commands = new Collection();
        this.Slash = new Collection();
        this.ButtonInt = new Collection();
        this.Cooldown = new Collection();
        this.Aliases = new Collection();
        this.config = require('../Config');
        this.prefix = this.config.Prefix;
        this.color = this.config.EmbedColor;
        this.owners = this.config.Owners;
        this.dispatcher;
        this.console = require('../Utility/Console');
        this.emoji = require('../Handler/Emoji');
        this.spotify = new spotify(this);
        this.util = new Utils(this);
        if (!this.token) this.token = this.config.Token;
        this._connectMongodb();
        this.connect();
        this.updateActivityStatus(); // Add auto-update activity status.
    }

    /**
     * @param {import('discord.js').APIEmbed} data
     * @returns {EmbedBuilder}
     */
    embed(data) {
        return new EmbedBuilder(data);
    }

    /**
     * @param {import('discord.js').APIButtonComponent} data
     * @returns {ButtonBuilder}
     */
    button(data) {
        return new ButtonBuilder(data);
    }

    /**
     * @param {import('discord.js').APISelectMenuComponent} data
     * @returns {StringSelectMenuBuilder}
     */
    menu(data) {
        return new StringSelectMenuBuilder(data);
    }

    /**
     * @param {import('discord.js').APIActionRowComponent} data
     * @returns {ActionRowBuilder}
     */
    row(data) {
        return new ActionRowBuilder(data);
    }

    _loadPlayer() {
    this.client = this;
    this.dispatcher = new Kazagumo({
        defaultSearchEngine: 'youtube_music',
        extends: { player: PlayerExtends },
        plugins: [
            new Spotify({
                clientId: this.config.spotify.ID,
                clientSecret: this.config.spotify.Secret,
                playlistPageLimit: 1, // optional ( 100 tracks per page )
                albumPageLimit: 1, // optional ( 50 tracks per page )
                searchLimit: 10, // optional ( track search limit. Max 50 )
                searchMarket: 'IN'
            }),
            new Plugins.PlayerMoved(this),
        ],
        send: (guildId, payload) => { this.client = this; const guild = this.guilds.cache.get(guildId); if (guild) guild.shard.send(payload) },
    }, new Connectors.DiscordJS(this), this.config.Nodes);
    let count = 0;
    const eventFiles = readdirSync(join(__dirname, '..', 'Events', 'Dispatcher')).filter(files => files.endsWith('.js'));
    for (const files of eventFiles) {
        const event = require(`../Events/Dispatcher/${files}`);
        this.dispatcher.on(event.name, (...args) => event.execute(this, ...args));
        count++;
    }
    this.console.log(`Loaded: ${count}`, 'player');

    let counting = 0;
    const nodeFiles = readdirSync(join(__dirname, '..', 'Events', 'Nodes')).filter(files => files.endsWith('.js'));
    for (const files of nodeFiles) {
        const event = require(`../Events/Nodes/${files}`);
        this.dispatcher.shoukaku.on(event.name, (...args) => event.execute(this, ...args));
        counting++;
    }
    this.console.log(`Loaded: ${counting}`, 'node');
    return this.dispatcher;
    }

    async _connectMongodb() {
        set('strictQuery', true);
        const dbOptions = {
            useNewUrlParser: true,
            autoIndex: false,
            connectTimeoutMS: 10000,
            family: 4,
            useUnifiedTopology: true,
        };
        if ([1, 2, 99].includes(connection.readyState)) return;
        connect(this.config.MongoData, dbOptions);
        this.console.log('Successfully connected to MongoDB.', 'api');
    }

    async connect() {
        super.login(this.token);
        this._loadPlayer();
        ["Button", "Message", "Events"].forEach((files) => {
            require(`../Scripts/${files}`)(this);
        });
    }

    updateActivityStatus() {
        const activities = [
            { name: 'JAI SHREE RAM 🚩', type: ActivityType.PLAYING },
            { name: 'SYSTEM NODE 🟢', type: ActivityType.PLAYING },
            { name: 'JOIN MY SUPPORT SERVER FOR HELP', type: ActivityType.WATCHING },
            { name: 'JAI HIND 🇮🇳', type: ActivityType.LISTENING },
            { name: 'JAI SHREE RAM 🚩', type: ActivityType.STREAMING },
            { name: 'Powered by VAYU ESPORTS', type: ActivityType.WATCHING },
            { name: 'JAI HIND 🇮🇳', type: ActivityType.LISTENING },
            { name: 'गर्व से कहो हम हिंदू हैं। 🚩', type: ActivityType.STREAMING },
            { name: '+play', type: ActivityType.PLAYING },
            { name: 'Powered by VAYU ESPORTS', type: ActivityType.WATCHING },
            { name: '+HELP', type: ActivityType.LISTENING },
            { name: 'गर्व से कहो हम हिंदू हैं। 🚩', type: ActivityType.STREAMING },
        ];

        let activityIndex = 0;

        setInterval(() => {
            const activity = activities[activityIndex];
            this.user.setActivity(activity.name, { type: activity.type });
            activityIndex = (activityIndex + 1) % activities.length;
        }, 3000); // Update activity every 3 seconds.
    }
}

module.exports = { Savaan };
