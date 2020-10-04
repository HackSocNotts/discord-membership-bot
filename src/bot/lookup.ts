import { getMemberByDiscord, getMemberById } from '../services/members';
import { Permissions, Snowflake } from 'discord.js';
import client from './client';

/**
 * Lookup verification by Student ID
 */
client.on('message', async (message) => {
  const commandPattern = /\<\@\![0-9]{18}\>\slookup\s([0-9]{8})/;

  if (!client.user || (client.user && message.author.id === client.user.id)) {
    return;
  }

  if (commandPattern.test(message.content)) {
    const id = parseInt((message.content.match(commandPattern) as RegExpMatchArray)[1]);

    if (
      client.user &&
      message.mentions.has(client.user) &&
      message.member &&
      message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)
    ) {
      try {
        message.channel.startTyping();
        const member = await getMemberById(id);

        if (!member || !member.discord) {
          message.channel.stopTyping();
          message.reply(`\`${id}\` has not been verified on this server.`);
        }

        if (member && member.discord) {
          message.channel.stopTyping();
          message.reply(`\`${id}\` has been verified by <@!${member.discord}> as ${member.name}`);
        }
      } catch (e) {
        message.channel.stopTyping();
        message.reply('An error occurred, sorry. Try again later.');
        console.error(e);
      }
    }
  }
});

/**
 * Lookup verification by Discord User
 */
client.on('message', async (message) => {
  const commandPattern = /\<\@\![0-9]{18}\>\slookup\s\<\@\!([0-9]{18})\>/;

  if (!client.user || (client.user && message.author.id === client.user.id)) {
    return;
  }

  if (commandPattern.test(message.content)) {
    const snowflake: Snowflake = (message.content.match(commandPattern) as RegExpMatchArray)[1];

    if (
      client.user &&
      message.mentions.has(client.user) &&
      message.member &&
      message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)
    ) {
      try {
        message.channel.startTyping();
        const member = await getMemberByDiscord(snowflake);

        if (!member || !member.id) {
          message.channel.stopTyping();
          message.reply(`<@!${snowflake}> has not been verified on this server.`);
        }

        if (member && member.id) {
          message.channel.stopTyping();
          message.reply(`<@!${snowflake}> has been verified as ${member.name} - \`${member.id}\``);
        }
      } catch (e) {
        message.channel.stopTyping();
        message.reply('An error occurred, sorry. Try again later.');
        console.error(e);
      }
    }
  }
});
