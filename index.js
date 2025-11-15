import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith("create")) {
    const url = message.content.split("create")[1];
    return message.reply({
      content: "Generting Short ID for " + url,
    });
  }
  message.reply({
    content: "Hi From Bot",
  });
});

client.on("interactionCreate", (interaction) => {
  interaction.reply("Pong!!");
});

client.login(
  process.env.CLIENT_TOKEN
);
