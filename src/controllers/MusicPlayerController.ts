// "use strict";
import { Command } from "@sapphire/framework";
import { MusicPlayer } from "../models/MusicPlayer";
import { Guild } from "discord.js";

export class MusicPlayerController {
  private servers: Map<string, MusicPlayer> = new Map<string, MusicPlayer>();

  /**
   * Create a new server mapping
   * @param serverId The guild id
   */
  public addServer(serverId: string) {
    this.servers.set(serverId, new MusicPlayer());
  }

  /**
   * Search for a song or play a link and start the audio
   * @param interaction Input command
   * @returns Message output
   */
  public async play(interaction: Command.ChatInputCommandInteraction): Promise<string> {
    const serverId = interaction.guild!.id;
    const songString = interaction.options.getString("input")?.trim();
    if (!songString) return "What is that?";
    // Add a song/playlist to the queue and play next
    return (await this.servers.get(serverId)!.addSong(interaction, songString)) ?? "Playback failed";
  }

  /**
   * Search for and select from top 5 search query results
   * @param interaction Input command
   * @returns Message output
   */
  public async search(interaction: Command.ChatInputCommandInteraction): Promise<void> {
    const serverId = interaction.guild!.id;
    const searchString = interaction.options.getString("input")?.trim();
    if (!searchString) {
      await interaction.editReply({ content: "What is that?" });
      return;
    }
    // Search for top 5 results
    await this.servers.get(serverId)!.searchResults(interaction, searchString);
  }

  /**
   * Print out the queue and currently playing song
   * @param interaction Input command
   * @returns Message output
   */
  public queue(interaction: Command.ChatInputCommandInteraction) {
    const serverId = interaction.guild!.id;
    return this.servers.get(serverId)!.printQueue();
  }

  /**
   * Skip currently playing song
   * @param interaction Input command
   * @returns Message output
   */
  public skip(interaction: Command.ChatInputCommandInteraction) {
    const serverId = interaction.guild!.id;
    return this.servers.get(serverId)!.skipSong();
  }

  /**
   * Stop playing and clear the queue
   * @param interaction Input command
   * @returns Message output
   */
  public stop(interaction: Command.ChatInputCommandInteraction) {
    const serverId = interaction.guild!.id;
    return this.servers.get(serverId)!.stop();
  }

  /**
   * Shuffle the queue
   * @param interaction Input command
   * @returns Message output
   */
  public shuffle(interaction: Command.ChatInputCommandInteraction) {
    const serverId = interaction.guild!.id;
    return this.servers.get(serverId)!.shuffle();
  }

  /**
   * Clear the queue
   * @param interaction Input command
   * @returns Message output
   */
  public clear(interaction: Command.ChatInputCommandInteraction) {
    const serverId = interaction.guild!.id;
    const songPosition = interaction.options.getInteger("position");
    return this.servers.get(serverId)!.clear(songPosition);
  }
}
