import { Precondition, PreconditionResult, container } from "@sapphire/framework";
import { CommandInteraction, Guild } from "discord.js";

export class HasServerPrecondition extends Precondition {
  public override async chatInputRun(interaction: CommandInteraction) {
    return this.HasServerChannel(interaction);
  }

  /**
   * Check the current server exists for the music player.
   *
   * @param interaction The command interaction
   * @returns Error if not in a channel
   */
  async HasServerChannel(interaction: CommandInteraction): Promise<PreconditionResult> {
    // Confirm the query is from a guild
    if (!(interaction.guild instanceof Guild)) return this.error({ message: "Invalid request!" });
    // Create an entry for the server if one doesn't already exist
    const serverId = interaction.guild.id;
    if (!container.player.servers.get(serverId)) {
      container.player.addServer(serverId);
    }
    return this.ok();
  }
}
