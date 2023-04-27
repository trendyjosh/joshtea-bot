import { ApplyOptions } from "@sapphire/decorators";
import { Listener, SapphireClient } from "@sapphire/framework";
import { VoiceState } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: "voiceStateUpdate",
})
export class ChatInputCommandDenied extends Listener {
  run(client: SapphireClient, oldState: VoiceState, newState: VoiceState) {
    // console.log(oldState, newState);
    // console.log("ClientId: ", client.id ?? "");
    // if (oldState.channel && client.id) {
    //   console.log("Bot is here: ", oldState.channel.members.get(client.id));
    // }
    // if (oldState.channel !== null && oldState.guild.me.voice.channel !== null) {
    //   if (!newState.channel || newState.channel.id !== oldState.guild.me.voice.channel.id) {
    //     if (oldState.channel.members.size <= 1 && oldState.channel.id === oldState.guild.me.voice.channel.id) {
    //     //   leave(oldState.guild.id);
    //     }
    //   }
    // }
  }
}
