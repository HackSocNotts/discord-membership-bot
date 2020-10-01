import { getMemberByDiscord, getMemberById } from '../services/members';
import client from './client';
import { ClientUser } from 'discord.js';

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
  } catch (e) {
    message.reply(
      'An error occurred, please try again later, or raise a ticket in <#${process.env.discordHelpChannelID as string}> for help.',
    );
    console.error(e);
    return;
  }
});
