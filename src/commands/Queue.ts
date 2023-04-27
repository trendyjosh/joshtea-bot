import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommand, Command, container } from "@sapphire/framework";
import { InteractionResponse } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Show the queued songs.",
  preconditions: ["InVoiceChannel", "HasServer", "IsPlaying"],
})
export class QueueCommand extends Command {
  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  /**
   * Execute the queue song command.
   * @param interaction The slash command interaction
   * @returns An edited response confirmation
   */
  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const message = container.player.queue(interaction);
    return interaction.reply(message);
  }
}
