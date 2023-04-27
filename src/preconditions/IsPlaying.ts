import { Precondition, PreconditionResult, container } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

export class IsPlayingChannelPrecondition extends Precondition {
  public override async chatInputRun(interaction: CommandInteraction) {
    return this.IsPlayingChannel(interaction);
  }

  /**
   * Check the the interaction user is in a voice channel.
   *
   * @param interaction The command interaction
   * @returns Error if not in a channel
   */
  async IsPlayingChannel(interaction: CommandInteraction): Promise<PreconditionResult> {
    // Check the bot is playing already
    const serverId = interaction.guild!.id;
    if (!container.player.servers.get(serverId).isPlaying) return this.error({ message: "I'm not doing anything!" });
    return this.ok();
  }
}
