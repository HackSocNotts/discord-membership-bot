import { ClientUser, GuildMember } from 'discord.js';
import { getMemberByDiscord, getMemberById, updateMember } from '../services/members';
import client from './client';

/**
 * Handle verification dm
 */
client.on('message', async (message) => {
  if (message.channel.type !== 'dm' || message.author.id === (client.user as ClientUser).id) {
    return;
  }

  const commandPattern = /([0-9]{8})/;

  if (!commandPattern.test(message.content)) {
    message.reply(
      `I don't recognize that command. Please include your Student ID Number or raise a ticket in <#${
        process.env.discordHelpChannelID as string
      }> for help.`,
    );
    return;
  }

  const id = parseInt((message.content.match(commandPattern) as RegExpMatchArray)[1]);

  try {
    const memberFromDiscord = await getMemberByDiscord(message.author.id);
    const memberFromId = await getMemberById(id);

    if (memberFromDiscord || (memberFromId && memberFromId.discord)) {
      message.reply(
        `It looks like either your Discord account or that student ID is verified. Please raise a ticket in <#${
          process.env.discordHelpChannelID as string
        }> for help.`,
      );
      return;
    }

    if (!memberFromId) {
      message.reply(
        `I can't find a member with the ID number \`${id}\`. Please make sure you entered your ID correctly or raise a ticket in <#${
          process.env.discordHelpChannelID as string
        }> for help.`,
      );
      return;
    }

    await updateMember(id, { discord: message.author.id });

    const guild = await client.guilds.fetch(process.env.discordGuildID as string);
    const members = await guild.members.fetch();
    const member = members.get(message.author.id) as GuildMember;
    await member.roles.add(process.env.discordMemberRoleID as string);

    message.reply(
      'Thanks for verifying your membership. You have been verified successfully and should see all the member channels now.',
    );
  } catch (e) {
    message.reply(
      `An error occurred, please try again later, or raise a ticket in <#${
        process.env.discordHelpChannelID as string
      }> for help.`,
    );
    console.error(e);
    return;
  }
});
