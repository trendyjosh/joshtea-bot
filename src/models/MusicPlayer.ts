import { AudioPlayer, AudioPlayerStatus, VoiceConnection, createAudioPlayer, createAudioResource, NoSubscriberBehavior, entersState, VoiceConnectionStatus, joinVoiceChannel } from "@discordjs/voice";
import { Song } from "./Song";
import youtube from "play-dl";
import { SongQueue } from "./SongQueue";
import { ActionRowBuilder, EmbedBuilder, GuildMember, InteractionReplyOptions, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel, VoiceBasedChannel, VoiceState } from "discord.js";
import { getSongTime } from "./SongTime";
import { Command } from "@sapphire/framework";

export class MusicPlayer {
  private queue: SongQueue = new SongQueue();
  private isPlaying: boolean = false;
  private currentSong: any;
  private connection!: VoiceConnection;
  private player!: AudioPlayer;

  /**
   * Set the currently playing song info.
   * @param song The song being playing
   */
  private setSong(song: Song): void {
    this.currentSong = song;
  }

  /**
   * Clear currently playing song.
   */
  private clearSong(): void {
    this.currentSong = null;
  }

  /**
   * Set the bot as playing.
   * @param song The song being playing
   */
  public startPlaying(song: Song): void {
    this.isPlaying = true;
    this.setSong(song);
  }

  /**
   * Set the bot as not playing.
   */
  public stopPlaying(): void {
    this.isPlaying = false;
    this.player?.stop();
    this.clearSong();
  }

  /**
   * Leave the voice channel and reset the player variables.
   */
  public leaveVoice(): void {
    this.queue = new SongQueue();
    this.player = new AudioPlayer();
    this.connection.destroy();
  }

  /**
   * Handle AudioPlayer idle state.
   * @param voiceChannel The current voice channel
   */
  private async idle(voiceChannel: VoiceBasedChannel): Promise<void> {
    this.stopPlaying();
    // Die if no listeners
    if (voiceChannel.members.size <= 1) {
      this.leaveVoice();
    }
    // Play next queued song
    if (this.queue.size() > 0) {
      await this.playNext();
    }
  }

  /**
   * Create a new AudioPlayer.
   *
   * @param voiceChannel The current voice channel
   */
  private newPlayer(voiceChannel: VoiceBasedChannel): void {
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });
    this.connection.subscribe(this.player);
    this.player.on(AudioPlayerStatus.Idle, async () => {
      await this.idle(voiceChannel);
    });
  }

  /**
   * Check if an AudioPlayer exists otherwise create one.
   * @param voiceChannel The current voice channel
   */
  public checkPlayer(voiceChannel: VoiceBasedChannel): void {
    if (!this.player) {
      this.newPlayer(voiceChannel);
    }
  }

  /**
   * Create a new VoiceConnection.
   * @param voiceChannel The current voice channel
   */
  private newConnection(voiceChannel: VoiceBasedChannel): void {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });
    // Handle disconnect
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([entersState(connection, VoiceConnectionStatus.Signalling, 5_000), entersState(connection, VoiceConnectionStatus.Connecting, 5_000)]);
        // Seems to be reconnecting to a new channel - ignore disconnect
      } catch (error) {
        // Seems to be a real disconnect which shouldn't be recovered from
        connection.destroy();
      }
    });
    this.connection = connection;
  }

  /**
   * Check if a VoiceConnection exists otherwise create one.
   * @param voiceChannel The current voice channel
   */
  public checkConnection(voiceChannel: VoiceBasedChannel): void {
    if (!this.connection) {
      this.newConnection(voiceChannel);
    }
  }

  /**
   * Add a song to the queue.
   * @param interaction The current slash command interaction
   * @param songString The song search/url string
   * @returns Interaction response message
   */
  public async addSong(interaction: Command.ChatInputCommandInteraction, songString: string): Promise<string> {
    let message: string = "Invalid request";
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel || !(interaction.channel instanceof TextChannel)) return message;
    const voiceChannel = interaction.member.voice.channel;
    const textChannel = interaction.channel;
    // Add song to the queue
    message = await this.queue.queueSong(songString, textChannel);
    // Check a connection exists
    this.checkConnection(voiceChannel);
    // Check a player exists
    this.checkPlayer(voiceChannel);
    // Start playing if not already
    if (!this.isPlaying) {
      this.playNext();
    }
    return `Added to queue: ${message}`;
  }

  /**
   * Let user pick from top 5 song search results.
   * @param interaction The current slash command interaction
   * @param songString The song search/url string
   * @returns Interaction response message
   */
  public async searchResults(interaction: Command.ChatInputCommandInteraction, searchString: string): Promise<any> {
    let select = new StringSelectMenuBuilder().setCustomId("search").setPlaceholder("Make a selection!");
    select = await this.queue.searchYoutube(select, searchString);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    const response = await interaction.editReply({
      content: "Which song?",
      components: [row],
    });

    const filter = (i: { user: { id: string } }) => i.user.id === interaction.user.id;
    try {
      const confirmation = await response.awaitMessageComponent({ filter, time: 300_000 });
      if (confirmation instanceof StringSelectMenuInteraction && confirmation.customId === "search") {
        const songString = confirmation.values[0];
        if (songString === "none") return response.edit({ content: "None selected.", components: [] });
        const message = await this.addSong(interaction, songString);
        await confirmation.update({ content: message, components: [] });
      }
    } catch (e) {
      await response.edit({ content: "Confirmation not received within 5 minutes.", components: [] });
    }
  }

  /**
   * Play the next song in the queue.
   * @returns Interaction response message
   */
  public async playNext(): Promise<void> {
    let message: string;
    const nextSong: Song | undefined = this.queue.getNext();
    if (nextSong) {
      message = "Song playback failed";
      await youtube
        .stream(nextSong.url, {
          discordPlayerCompatibility: true,
        })
        .then(async (stream) => {
          message = "Playing: " + nextSong.title;
          nextSong.started = Math.round(new Date().getTime() / 1000);

          const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
          });
          this.player.play(resource);
          this.startPlaying(nextSong);
        })
        .catch((error) => {
          console.log("Failed stream: " + error);
          this.stopPlaying();
        });
      if (!this.isPlaying) {
        message = "Failed stream: " + nextSong.title;
        if (this.queue.size() > 0) {
          console.log("Trying too early");
          this.playNext();
        }
      }
      nextSong.textChannel.send(message);
    } else {
      console.log("No next song");
    }
  }

  /**
   * Print out the currently playing song info and get queued songs.
   * @returns The message embed
   */
  public printQueue(): InteractionReplyOptions {
    let embed = new EmbedBuilder().setColor(0x274437).setTitle("Current Song").setAuthor({ name: "Music Queue" });
    const dateObj = new Date();
    let remaining = Math.round(dateObj.getTime() / 1000) - this.currentSong.started;
    remaining = this.currentSong.length - remaining;
    embed.setDescription(this.currentSong.title + " - " + getSongTime(remaining) + " remaining");
    embed = this.queue.print(embed, remaining);
    return { embeds: [embed] };
  }

  /**
   * Skip the currently playing song.
   * @returns The message string
   */
  public skipSong(): string {
    const previousSong = this.currentSong.title;
    if (this.queue.size() > 0) {
      this.playNext();
    } else {
      this.stopPlaying();
    }
    return `Skipped: ${previousSong}`;
  }

  /**
   * Stop playing and clear queue.
   * @returns The message string
   */
  public stop(): string {
    this.stopPlaying();
    if (this.queue.size() > 0) {
      this.queue.clear();
    }
    return `Stopping...`;
  }

  /**
   * Shuffle the queue.
   * @returns The message string
   */
  public shuffle(): string {
    return this.queue.shuffle();
  }

  /**
   * Clear all queued songs or just the one in selected position.
   * @param position Position of song in queue
   * @returns The message string
   */
  public clear(position: number | null): string {
    if (position) {
      return this.queue.remove(position);
    } else {
      return this.queue.clear();
    }
  }
}
