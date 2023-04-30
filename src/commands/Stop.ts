import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommand, Command, container } from "@sapphire/framework";
import { InteractionResponse } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Skip current song.",
  preconditions: ["InVoiceChannel", "HasServer", "IsPlaying"],
})
export class StopCommand extends Command {
  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  /**
   * Execute the stop song command.
   * @param interaction The slash command interaction
   * @returns An edited response confirmation
   */
  public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const message = await container.player.stop(interaction);
    return interaction.reply({ content: message });
  }
}
