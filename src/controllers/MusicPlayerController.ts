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
   * @param songString Youtube link or search query
   * @returns Message output
   */
  public async play(interaction: Command.ChatInputCommandInteraction, songString: string): Promise<string> {
    const serverId = interaction.guild!.id;
    // Add a song/playlist to the queue and play next
    const message = (await this.servers.get(serverId)!.addSong(interaction, songString)) ?? "Playback failed";
    return message;
  }

  /**
   * Search for and select from top 5 search query results
   * @param interaction Input command
   * @param searchString Youtube search query
   * @returns Message output
   */
  public async search(interaction: Command.ChatInputCommandInteraction, searchString: string): Promise<string> {
    const serverId = interaction.guild!.id;
    // Search for top 5 results
    await this.servers.get(serverId)!.searchResults(interaction, searchString);
    return "Successfully added";
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
}
