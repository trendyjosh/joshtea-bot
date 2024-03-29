import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommand, Command, container } from "@sapphire/framework";
import { InteractionResponse, Message } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Search for a song or play a youtube link.",
  preconditions: ["InVoiceChannel", "HasServer"],
})
export class PlayCommand extends Command {
  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option //
            .setName("input")
            .setDescription("Enter a song/artist/url.")
            .setRequired(true)
        )
    );
  }

  /**
   * Get youtube song by search or url and add play.
   * @param interaction The slash command interaction
   * @returns An edited response confirmation
   */
  public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<Message<boolean>> {
    await interaction.deferReply();
    const message = await container.player.play(interaction);
    return interaction.editReply({ content: message });
  }
}
