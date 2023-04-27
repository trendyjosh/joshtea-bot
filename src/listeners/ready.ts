import { ApplyOptions } from "@sapphire/decorators";
import { Listener, SapphireClient } from "@sapphire/framework";
import { ActivityType } from "discord.js";

@ApplyOptions<Listener.Options>({
  once: true,
  event: "ready",
})
export class ReadyListener extends Listener {
  run(client: SapphireClient) {
    client.user?.setActivity("with your mum", { type: ActivityType.Playing });
  }
}
