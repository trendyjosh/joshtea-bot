import { ApplyOptions } from "@sapphire/decorators";
import { Listener, SapphireClient } from "@sapphire/framework";
import { VoiceState } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: "voiceStateUpdate",
})
export class ChatInputCommandDenied extends Listener {
  run(client: SapphireClient, oldState: VoiceState, newState: VoiceState) {
    /**
     * TODO
     *
     * Automatically disconnect bot if no users in voice channel.
     */
  }
}
