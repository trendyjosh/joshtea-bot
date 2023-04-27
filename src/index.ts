"use strict";
import { SapphireClient, container } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import config from "./config.json";
import { MusicPlayerController } from "./controllers/MusicPlayerController";

// Create the music player object
container.player = new MusicPlayerController();

// Initiate the Sapphire client
const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

// Login the bot
client.login(config.token);
