// "use strict";
import { Command, CommandStore } from "@sapphire/framework";
import { MusicPlayer } from "../models/MusicPlayer";
import { EmbedBuilder, InteractionReplyOptions } from "discord.js";
import Keyv from "keyv";

export class MusicPlayerController {
  private servers: Map<string, MusicPlayer> = new Map<string, MusicPlayer>();
  private storage: Keyv;

  /**
   * Initialise a new controller instance.
   */
  public constructor() {
    // Initialise storage object
    this.storage = new Keyv("sqlite://database/storage.sqlite");
  }

  /**
   * Create a new server mapping.
   * @param serverId The guild id
   */
  public addServer(serverId: string): void {
    this.servers.set(serverId, new MusicPlayer());
  }

  /**
   * Search for a song or play a link and start the audio.
   * @param interaction Input command
   * @returns Message output
   */
  public async play(interaction: Command.ChatInputCommandInteraction): Promise<string> {
    const serverId: string = interaction.guild!.id;
    const songString = interaction.options.getString("input")?.trim();
    if (!songString) return "What is that?";
    // Add a song/playlist to the queue and play next
    return (await this.servers.get(serverId)!.addSong(interaction, songString)) ?? "Playback failed";
  }

  /**
   * Search for and select from top 5 search query results.
   * @param interaction Input command
   * @returns Message output
   */
  public async search(interaction: Command.ChatInputCommandInteraction): Promise<void> {
    const serverId: string = interaction.guild!.id;
    const searchString = interaction.options.getString("input")?.trim();
    if (!searchString) {
      await interaction.editReply({ content: "What is that?" });
      return;
    }
    // Search for top 5 results
    await this.servers.get(serverId)!.searchResults(interaction, searchString);
  }

  /**
   * Skip currently playing song.
   * @param interaction Input command
   * @returns Message output
   */
  public skip(interaction: Command.ChatInputCommandInteraction): string {
    const serverId: string = interaction.guild!.id;
    return this.servers.get(serverId)!.skipSong();
  }

  /**
   * Print out the queue and currently playing song.
   * @param interaction Input command
   * @returns Message output
   */
  public queue(interaction: Command.ChatInputCommandInteraction): InteractionReplyOptions {
    const serverId = interaction.guild!.id;
    return this.servers.get(serverId)!.printQueue();
  }

  /**
   * Shuffle the queue.
   * @param interaction Input command
   * @returns Message output
   */
  public shuffle(interaction: Command.ChatInputCommandInteraction): string {
    const serverId: string = interaction.guild!.id;
    return this.servers.get(serverId)!.shuffle();
  }

  /**
   * Clear the queue.
   * @param interaction Input command
   * @returns Message output
   */
  public clear(interaction: Command.ChatInputCommandInteraction): string {
    const serverId: string = interaction.guild!.id;
    const songPosition = interaction.options.getInteger("position");
    return this.servers.get(serverId)!.clear(songPosition);
  }

  /**
   * Stop playing and clear the queue.
   * @param interaction Input command
   * @returns Message output
   */
  public stop(interaction: Command.ChatInputCommandInteraction): string {
    const serverId: string = interaction.guild!.id;
    return this.servers.get(serverId)!.stop();
  }

  /**
   * Leave the voice channel.
   * @param serverId Guild id
   */
  public leave(serverId: string): void {
    const musicPlayer = this.servers.get(serverId);
    if (musicPlayer) {
      musicPlayer.stopPlaying();
      musicPlayer.leaveVoice();
      this.servers.set(serverId, new MusicPlayer());
    }
  }

  /**
   * Print out the application commands.
   * @param commands All bot commands
   * @returns Message embed
   */
  public help(commands: CommandStore): InteractionReplyOptions {
    const embed = new EmbedBuilder().setColor(0x274437).setTitle("All commands");
    let commandsString: string = "";
    commands.each((command, key, col) => {
      commandsString += `/${command.name} - ${command.description}`;
      if (!Object.is(commands.last(), command)) {
        commandsString += "\n";
      }
    });
    embed.setDescription(commandsString);
    return { embeds: [embed] };
  }
}
