import { config } from "dotenv";

import {
    REST,
    Client,
    Events,
    SlashCommandBuilder,
    Routes,
    roleMention,
    channelMention,
    AttachmentBuilder,
} from "discord.js";
import { join } from "path";

async function main() {
    const rest = new REST().setToken(process.env.DISCORD_ACCESS_SECRET!);
    const client = new Client({ intents: [] });

    client.once(Events.ClientReady, () => {
        console.log("Sergeant Salauddin, reporting to duty, sir!");
    });

    await client.login(process.env.DISCORD_ACCESS_SECRET!);

    const summonCommand = new SlashCommandBuilder().setName("summon").setDescription("Summon the radiants.");

    await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
        body: [summonCommand],
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        switch (interaction.commandName) {
            case summonCommand.name: {
                const summonerID = interaction.user.id;

                await interaction.reply({
                    content: roleMention(process.env.RADIANT_ROLE_ID!) + " Radiants, assemble.",
                });

                const guild = client.guilds.resolve(process.env.DISCORD_GUILD_ID!)!;

                const role = (await guild.roles.fetch(process.env.RADIANT_ROLE_ID!))!;

                const audio = new AttachmentBuilder("assets/audio/summon.mp3");

                await Promise.all(
                    role.members.map((member) => {
                        member.send({
                            content:
                                "You're being summoned in " +
                                channelMention(interaction.channelId) +
                                " to play a match of Valorant.",
                            tts: true,
                            files: [audio],
                        });
                    })
                );
            }
        }
    });
}

config({ quiet: true });
main();
