import { TextBasedChannel } from "discord.js";
type SongType = "youtube" | "spotify";

export class Song {
  public title: string;
  public length: number;
  public started: number;
  public url: string;
  public type: SongType;
  public textChannel: TextBasedChannel;

  constructor(title: string, length: number, url: string, textChannel: TextBasedChannel, started: number = 0, type: SongType = "youtube") {
    this.title = title;
    this.length = length;
    this.started = started;
    this.url = url;
    this.type = type;
    this.textChannel = textChannel;
  }
}
