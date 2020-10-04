import './initialDm';
import './lookup';
import './clearUser';
import './clearAll';
import './verify';
import './verifyAll';
import { beat } from '../services/heartbeat';
import client from './client';
import { ClientUser } from 'discord.js';

client.login(process.env.discordBotToken);

client.on('ready', () => {
  console.log(`Logged in as ${(client.user as ClientUser).tag}!`);
});

const checkStatus = () => {
  try {
    if ((client.user as ClientUser).presence.status === 'online') {
      beat();
    }
  } catch (e) {
    console.error(e);
  }
};

setInterval(checkStatus, 1 * 60 * 1000);
