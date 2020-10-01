import { ClientUser, Collection, Guild, GuildMember, Message, Permissions, Snowflake } from 'discord.js';
import client from './client';
import { getMemberByDiscord } from '../services/members';

const verifyAll = (members: Collection<Snowflake, GuildMember>, message: Message) =>
  members.forEach(async (member) => {
    try {
      if (!member.roles.cache.has(process.env.discordMemberRoleID as string) || member.user.bot) {
        console.log(
          process.env.discordMemberRoleID,
          !member.roles.cache.has(process.env.discordMemberRoleID as string),
        );
        return;
      }

      const potentialMember = await getMemberByDiscord(member.id);
      if (potentialMember) {
        return;
      }

      await member.send(
        `Hey there <@!${
          member.user.id
        }> :wave:\nIt looks like you're membership may have expired since you last verified your membership with me.\nPlease respond with your student ID number so I can verify that you are a HackSoc member.\nIf you believe this is in error please raise a ticket in <#${
          process.env.discordHelpChannelID as string
        }> for help.\nThanks,\nThe HackSoc Bot.`,
      );

      await message.channel.send(`DM'd <@!${member.id}>.`);
    } catch (e) {
      await message.channel.send(
        `Something went wrong with <@!${member.id}>.\`\`\`json\n${JSON.stringify(e, null, 2)}\n\`\`\``,
      );
      console.error(e);
    }
  });

/**
 * Verify All Users Command
 */
client.on('message', async (message) => {
  if (message.author.id === (client.user as ClientUser).id) {
    return;
  }

  if (
    message.channel.type === 'text' &&
    (message.member as GuildMember).permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
    message.content === `<@!${(client.user as ClientUser).id}> verify all`
  ) {
    const verificationMessage = await message.reply(
      'Are you sure you want me to verify all users? **WARNING!!! THIS WILL DM EVERY GUILD MEMBER**',
    );

    client.on('messageReactionAdd', async (react, user) => {
      if (react.message.id === verificationMessage.id && user.id === message.author.id) {
        const reactions = react.message.reactions.cache.filter(
          (reaction) =>
            reaction.users.cache.has(message.author.id) &&
            (reaction.emoji.identifier === '%F0%9F%87%BE' ||
              reaction.emoji.identifier === '%F0%9F%87%AA' ||
              reaction.emoji.identifier === '%F0%9F%87%B8'),
        );
        if (reactions.size === 3) {
          const members = await (message.guild as Guild).members.fetch();
          verifyAll(members, message);
          await verificationMessage.delete();
          await message.reply("WHAT HAVE YOU DONE?! I'M NOW DMing EVERYONE!");
        }
      }
    });
  }
});
