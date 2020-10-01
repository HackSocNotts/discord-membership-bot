import './initialDm';
import './lookup';
import './verify';
import './verifyAll';
import client from './client';
import { ClientUser } from 'discord.js';

client.login(process.env.discordBotToken);

client.on('ready', () => {
  console.log(`Logged in as ${(client.user as ClientUser).tag}!`);
});
