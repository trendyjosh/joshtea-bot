import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommand, Command, container } from "@sapphire/framework";
import { Message } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Shuffle the queue.",
  preconditions: ["InVoiceChannel", "HasServer", "IsPlaying"],
})
export class ShuffleCommand extends Command {
  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  /**
   * Execute the clear queue command.
   * @param interaction The slash command interaction
   * @returns An edited response confirmation
   */
  public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<Message<boolean>> {
    const message = container.player.shuffle(interaction);
    return interaction.reply(message);
  }
}
