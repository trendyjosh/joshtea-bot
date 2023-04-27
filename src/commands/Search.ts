import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommand, Command, container } from "@sapphire/framework";

@ApplyOptions<Command.Options>({
  description: "Top 5 results for song/artist name.",
  preconditions: ["InVoiceChannel", "HasServer"],
})
export class SearchCommand extends Command {
  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option //
            .setName("input")
            .setDescription("Enter a song/artist name!")
            .setRequired(true)
        )
    );
  }

  /**
   * Let user choose song from top 5 search results.
   * @param interaction The slash command interaction
   * @returns An edited response confirmation
   */
  public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<void> {
    interaction.deferReply();
    const string = interaction.options.getString("input")?.trim();
    let message: string = "What is that";
    if (string && interaction.guild) {
      message = await container.player.search(interaction, string);
    }
    console.log(message);
  }
}
