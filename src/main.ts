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
    userMention,
    GatewayIntentBits,
} from "discord.js";

async function main() {
    const rest = new REST().setToken(process.env.DISCORD_ACCESS_SECRET!);
    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages],
    });

    client.once(Events.ClientReady, () => {
        console.log("Sergeant Salauddin, reporting to duty, sir!");
    });

    await client.login(process.env.DISCORD_ACCESS_SECRET!);

    const summonCommand = new SlashCommandBuilder().setName("summon").setDescription("Summon the radiants.");

    await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
        body: [summonCommand],
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.guildId !== process.env.DISCORD_GUILD_ID!) return;
        if (!interaction.isChatInputCommand()) return;

        switch (interaction.commandName) {
            case summonCommand.name: {
                console.debug("Command Triggered:", summonCommand.name);

                await interaction.reply({
                    // content: roleMention(process.env.RADIANT_ROLE_ID!) + " Radiants, assemble.",
                    content: roleMention(process.env.RADIANT_ROLE_ID!) + " Indian chudmu ajke, ay.",
                });

                const guild = client.guilds.resolve(process.env.DISCORD_GUILD_ID!)!;

                console.debug("Triggered In Guild:", guild.name);

                await guild.members.fetch();
                const role = (await guild.roles.fetch(process.env.RADIANT_ROLE_ID!))!;
                console.debug("Mentioning Role:", role.name);

                const audio = new AttachmentBuilder("assets/audio/summon.mp3");

                const membersToDM = role.members.filter((member) => member.id !== interaction.user.id);
                console.debug(
                    "Sending DMs:",
                    membersToDM.map((member) => member.nickname || member.displayName).join(", ")
                );

                await Promise.all(
                    membersToDM.map((member) => {
                        return member.send({
                            // content:
                            //     "You're being summoned in " +
                            //     channelMention(interaction.channelId) +
                            //     " to play a match of Valorant.",
                            content:
                                userMention(interaction.user.id) +
                                " tore Valorant khelte daktese ei channel e " +
                                channelMention(interaction.channelId) +
                                ". Taratari ay, otherwise guli bade shob lagay lamu.",
                            files: [audio],
                        });
                    })
                );

                console.debug("Command Trigger Successful", summonCommand.name);
            }
        }
    });
}

config({ quiet: true });
main();
