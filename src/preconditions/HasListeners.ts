import { Precondition, PreconditionResult } from "@sapphire/framework";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";

export class HasListenersPrecondition extends Precondition {
  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.HasListeners(interaction);
  }

  /**
   * Check that the bot doesn't already have listeners.
   * @param interaction The command interaction
   * @returns Error if not in a channel
   */
  async HasListeners(interaction: ChatInputCommandInteraction): Promise<PreconditionResult> {
    if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
      return this.ok();
    } else {
      return this.error({ message: "You must be in a voice channel to use this command!" });
    }
  }
}
