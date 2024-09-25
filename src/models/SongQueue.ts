import { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextBasedChannel } from "discord.js";
import { Song } from "./Song";
import { getSongTime } from "./SongTime";
import shuffleArray from "shuffle-array";
import youtube from "play-dl";
import validUrl from "valid-url";
import ytdl, { MoreVideoDetails } from "@distube/ytdl-core";

export class SongQueue {
  private queue: Array<Song> = new Array<Song>();
  private displayItems: number = 20;
  private searchResults: number = 5;

  /**
   * Get the total number of songs in queue.
   * @returns Total length
   */
  public size(): number {
    return this.queue.length;
  }

  /**
   * Get the next song in queue.
   * @returns Next song
   */
  public getNext(): Song | undefined {
    return this.queue.shift();
  }

  /**
   * Print out all queued songs.
   * @param embed Message embed element
   * @param remaining Current song remaining time
   * @returns Updated embed
   */
  public print(embed: EmbedBuilder, remaining: number): EmbedBuilder {
    // Counter for total queue time
    let seconds = 0;
    // Print all songs
    if (this.queue.length > 0) {
      for (let i = 0; i < this.queue.length; i++) {
        if (i < this.displayItems) {
          embed.addFields({ name: "Position: " + (i + 1), value: this.queue[i].title, inline: true });
        }
        seconds += this.queue[i].length;
      }
      if (this.queue.length > this.displayItems) {
        const otherSongs = this.queue.length - this.displayItems;
        embed.addFields({ name: "...", value: otherSongs + " more song(s)", inline: true });
      }
      // Display total queue time remaining
      embed.setFooter({
        text: "Total remaining: " + getSongTime(seconds + remaining),
      });
    } else {
      embed.setFooter({
        text: "No songs queued",
      });
    }
    return embed;
  }

  /**
   * Add a youtube video to the queue.
   * @param youtubeVideoDetails Youtube video details object
   * @param textChannel The text channel the command was sent in
   * @returns Song title
   */
  private queueYoutubeSong(youtubeVideoDetails: MoreVideoDetails, textChannel: TextBasedChannel): string {
    const title = youtubeVideoDetails.title ?? youtubeVideoDetails.video_url;
    const song = new Song(title, parseInt(youtubeVideoDetails.lengthSeconds), youtubeVideoDetails.video_url, textChannel);
    this.queue.push(song);
    return title;
  }

  /**
   * Add a youtube video to queue with by link.
   * @param youtubeUrl Validated link to youtube video
   * @param textChannel The text channel the command was sent in
   * @returns Song title
   */
  private async addYoutubeLink(youtubeUrl: string, textChannel: TextBasedChannel): Promise<string> {
    try {
      let basicInfo = await ytdl.getBasicInfo(youtubeUrl);
      // let info = await ytdl.getInfo(youtubeUrl);
      console.log(basicInfo);
      const yt_info = await ytdl.getBasicInfo(youtubeUrl);
      return this.queueYoutubeSong(yt_info.videoDetails, textChannel);
    } catch (err) {
      console.log(err);
      return "Computer says no";
    }
  }

  /**
   * Add all songs in a youtube playlist to the queue.
   * @param youtubePlaylistUrl Validated link to youtube playlist
   * @param textChannel The text channel the command was sent in
   * @returns Playlist title
   */
  private async addYoutubePlaylist(youtubePlaylistUrl: string, textChannel: TextBasedChannel): Promise<string | any> {
    return await youtube
      .playlist_info(youtubePlaylistUrl, { incomplete: true })
      .then(async (playlist) => {
        return await playlist
          .all_videos()
          .then(async (videos) => {
            for (let $i = 0; $i < videos.length; $i++) {
              // Add each song to the list
              const yt_info = await ytdl.getBasicInfo(videos[$i].url);
              this.queueYoutubeSong(yt_info.videoDetails, textChannel);
            }
            return playlist.title;
          })
          .catch((error) => {
            return `Failed to add all videos: ${error}`;
          });
      })
      .catch((error) => {
        return `Failed to add: ${error}`;
      });
  }

  /**
   * Queue a song by youtube link or search query.
   * @param songString Link or search query
   * @param textChannel The text channel the command was sent in
   * @returns Queued song or playlist title
   */
  public async queueSong(songString: string, textChannel: TextBasedChannel): Promise<string> {
    if (validUrl.isUri(songString)) {
      // Get from link
      if (youtube.yt_validate(songString) == "video") {
        // Add single link
        return await this.addYoutubeLink(songString, textChannel);
      } else if (youtube.yt_validate(songString) == "playlist") {
        // Add playlist links
        return await this.addYoutubePlaylist(songString, textChannel);
      }
    } else {
      // Get top result from search
      const searchResults = await youtube.search(songString, { limit: 1 });
      const yt_info = await ytdl.getBasicInfo(searchResults[0].url);
      return this.queueYoutubeSong(yt_info.videoDetails, textChannel);
    }
    return "Why you do me like this? :(";
  }

  /**
   * Search for and select from top 5 search query results.
   * @param select Select message element
   * @param searchString Search query
   * @returns Updated select message element
   */
  public async searchYoutube(select: StringSelectMenuBuilder, searchString: string): Promise<StringSelectMenuBuilder> {
    const yt_info = await youtube.search(searchString, { limit: this.searchResults });
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    yt_info.forEach((song) => {
      const title = song.title?.slice(0, 99) ?? song.url;
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(title)
          .setDescription(song.channel + " - " + getSongTime(song.durationInSec) + " - " + formatter.format(song.views) + " views")
          .setValue(song.url)
      );
    });
    select.addOptions(new StringSelectMenuOptionBuilder().setLabel("None").setDescription("None of the above").setValue("none"));
    return select;
  }

  /**
   * Shuffle the queued songs.
   * @returns Output to text channel
   */
  public shuffle(): string {
    if (this.queue.length > 0) {
      shuffleArray(this.queue);
      return "Fucked that shit up";
    } else {
      return "https://tenor.com/view/ive-got-nothing-left-crying-easterenders-got-nothin-left-nothing-left-gif-14296691";
    }
  }

  /**
   * Clear all queued songs.
   * @returns Response message
   */
  public clear(): string {
    if (this.queue.length > 0) {
      this.queue = new Array<Song>();
      return "Takin' out the trash";
    } else {
      return "https://tenor.com/view/ive-got-nothing-left-crying-easterenders-got-nothin-left-nothing-left-gif-14296691";
    }
  }

  /**
   * Remove a song from chosen position in the queue.
   * @param position Position of the song in the queue
   * @returns Response message
   */
  public remove(position: number): string {
    if (this.queue.length > 0) {
      this.queue.splice(position - 1, 1);
      return "Binned it";
    } else {
      return "https://tenor.com/view/ive-got-nothing-left-crying-easterenders-got-nothin-left-nothing-left-gif-14296691";
    }
  }
}
