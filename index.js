import { Client, GatewayIntentBits } from "discord.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Define constants based on the **2000-character** limit from the latest Discord error
const MAX_DISCORD_TOKENS = 500; // 2000 characters / 4 characters/token ≈ 500 tokens
const DISCORD_MAX_LENGTH = 2000; // The confirmed hard limit from the error

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  config: {
    // UPDATED: Changed instructions to reflect the 2000-character limit
    systemInstruction:
      "You are a helpful Discord bot. All of your responses must be concise and kept strictly under 500 tokens (approx 2000 characters) to fit Discord's message limits.", // ADDED: Hard token limit to control API output size
    maxOutputTokens: MAX_DISCORD_TOKENS,
  },
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  console.log(message.content);
  const userPrompt = message.content; // UPDATED: Changed prompt instruction to reflect the 2000-character limit
  const fullPrompt = `${userPrompt}. Give your answer within 500 tokens (approximately 2000 characters).`;
  const result = await model.generateContent(fullPrompt);
  console.log(result);
  const response = result.response; // CRITICAL: Must be declared with 'let' to allow reassignment
  let text = response.text(); // --- FINAL CHARACTER-BASED TRUNCATION (The Safety Net) ---
  if (text.length > DISCORD_MAX_LENGTH) {
    // Calculate safe length, leaving room for the notice
    const TRUNCATE_NOTICE =
      "\n\n... (Response was too long and has been truncated.)"; // Ensure the safe length leaves room for the notice itself
    const safeLength = DISCORD_MAX_LENGTH - TRUNCATE_NOTICE.length; // Truncate the text and add the notice
    text = text.substring(0, safeLength) + TRUNCATE_NOTICE;
  } // --------------------------------------------------------
  await message.reply({
    content: text,
  });
});

client.on("interactionCreate", (interaction) => {
  interaction.reply("Pong!!");
});

client.login(process.env.CLIENT_TOKEN);
