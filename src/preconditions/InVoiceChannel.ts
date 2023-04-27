import { Precondition, PreconditionResult } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";

export class InVoiceChannelPrecondition extends Precondition {
  public override async chatInputRun(interaction: CommandInteraction) {
    return this.InVoiceChannel(interaction);
  }

  /**
   * Check the the interaction user is in a voice channel.
   *
   * @param interaction The command interaction
   * @returns Error if not in a channel
   */
  async InVoiceChannel(interaction: CommandInteraction): Promise<PreconditionResult> {
    if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
      return this.ok();
    } else {
      return this.error({ message: "You must be in a voice channel to use this command!" });
    }
  }
}
