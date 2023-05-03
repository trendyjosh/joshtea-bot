import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, container } from "@sapphire/framework";
import { VoiceState } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.VoiceStateUpdate,
})
export class UserLeftListener extends Listener<typeof Events.VoiceStateUpdate> {
  run(oldState: VoiceState, newState: VoiceState) {
    const clientVoiceChannel = oldState.guild.members.me?.voice.channel,
      oldChannel = oldState.channel,
      newChannel = newState.channel;
    if (oldChannel !== null && clientVoiceChannel != null) {
      if (!newChannel || newChannel.id !== clientVoiceChannel.id) {
        if (oldChannel.members.size <= 1 && oldChannel.id === clientVoiceChannel.id) {
          container.player.leave(oldState.guild.id);
        }
      }
    }
  }
}
