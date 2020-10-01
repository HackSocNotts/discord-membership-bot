import { ClientUser, GuildMember, Permissions, Snowflake } from 'discord.js';
import { getMemberByDiscord, getMemberById } from '../services/members';
import client from './client';

/**
 * Lookup verification by Student ID
 */
client.on('message', async (message) => {
  const commandPattern = /\<\@\![0-9]{18}\>\slookup\s([0-9]{8})/;
  if (commandPattern.test(message.content)) {
    const id = parseInt((message.content.match(commandPattern) as RegExpMatchArray)[1]);

    if (
      message.mentions.has(client.user as ClientUser) &&
      (message.member as GuildMember).permissions.has(Permissions.FLAGS.MANAGE_ROLES)
    ) {
      try {
        const member = await getMemberById(id);

        if (!member || !member.discord) {
          message.reply(`\`${id}\` has not been verified on this server.`);
        }

        if (member && member.discord) {
          message.reply(`\`${id}\` has been verified by <@!${member.discord}>`);
        }
      } catch (e) {
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
  if (commandPattern.test(message.content)) {
    const snowflake: Snowflake = (message.content.match(commandPattern) as RegExpMatchArray)[1];

    if (
      message.mentions.has(client.user as ClientUser) &&
      (message.member as GuildMember).permissions.has(Permissions.FLAGS.MANAGE_ROLES)
    ) {
      try {
        const member = await getMemberByDiscord(snowflake);

        if (!member || !member.id) {
          message.reply(`<@!${snowflake}> has not been verified on this server.`);
        }

        if (member && member.id) {
          message.reply(`<@!${snowflake}> has been verified as \`${member.id}\``);
        }
      } catch (e) {
        message.reply('An error occurred, sorry. Try again later.');
        console.error(e);
      }
    }
  }
});
