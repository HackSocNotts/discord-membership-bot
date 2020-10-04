import { getMemberByDiscord, getMemberById, updateMember } from '../services/members';
import client from './client';
import { GuildMember } from 'discord.js';

/**
 * Handle verification dm
 */
client.on('message', async (message) => {
  const commandPattern = /\<\@\![0-9]{18}\>\sverify\s([0-9]{8})\s<\@\!([0-9]{18})\>/;

  if (!client.user || (client.user && message.author.id === client.user.id)) {
    return;
  }

  if (commandPattern.test(message.content)) {
    const id = parseInt((message.content.match(commandPattern) as RegExpMatchArray)[1]);
    const snowflake = (message.content.match(commandPattern) as RegExpMatchArray)[2];

    message.channel.startTyping();
    try {
      const memberFromDiscord = await getMemberByDiscord(snowflake);
      const memberFromId = await getMemberById(id);

      if (memberFromDiscord || (memberFromId && memberFromId.discord)) {
        message.channel.stopTyping();
        message.reply(`It looks like either that Discord account or student ID is already verified.`);
        return;
      }

      if (!memberFromId) {
        message.channel.stopTyping();
        message.reply(
          `I can't find a member with the ID number \`${id}\`. Please make sure you entered the ID correctly.`,
        );
        return;
      }

      await updateMember(id, { discord: message.author.id });

      const guild = await client.guilds.fetch(process.env.discordGuildID as string);
      const members = await guild.members.fetch();
      const member = members.get(message.author.id) as GuildMember;
      await member.roles.add(process.env.discordMemberRoleID as string);

      message.channel.stopTyping();
      message.reply(
        `<@${snowflake}> has been verified as \`${id}\` successfully and should see all the member channels now.`,
      );
    } catch (e) {
      message.channel.stopTyping();
      message.reply(
        `An error occurred, please try again later, or raise a ticket in <#${
          process.env.discordHelpChannelID as string
        }> for help.`,
      );
      console.error(e);
      return;
    }
  }
});
