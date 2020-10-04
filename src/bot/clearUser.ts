import { getMemberByDiscord, getMemberById, updateMember } from '../services/members';
import { Permissions, Snowflake } from 'discord.js';
import client from './client';

/**
 * Clear by Student ID
 */
client.on('message', async (message) => {
  const commandPattern = /\<\@\![0-9]{18}\>\sclear\s([0-9]{8})/;

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
          return;
        }

        await updateMember(member.id, { discord: null });

        message.channel.stopTyping();
        await message.reply(`\`${id}\` has been cleared.`);
      } catch (e) {
        message.channel.stopTyping();
        message.reply('An error occurred, sorry. Try again later.');
        console.error(e);
      }
    }
  }
});

/**
 * Clear by Discord User
 */
client.on('message', async (message) => {
  const commandPattern = /\<\@\![0-9]{18}\>\sclear\s\<\@\!([0-9]{18})\>/;

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
          message.reply(`<@!${snowflake}> is not verified.`);
          return;
        }

        await updateMember(member.id, { discord: null });

        message.channel.stopTyping();
        await message.reply(`<@!${snowflake}> has been cleared.`);
      } catch (e) {
        message.channel.stopTyping();
        message.reply('An error occurred, sorry. Try again later.');
        console.error(e);
      }
    }
  }
});
