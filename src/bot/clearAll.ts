import { Collection, Guild, GuildMember, Message, Permissions, Snowflake } from 'discord.js';
import client from './client';
import { getMemberByDiscord } from '../services/members';

const clearAll = (members: Collection<Snowflake, GuildMember>, message: Message) =>
  members.forEach(async (member) => {
    try {
      if (!member.roles.cache.has(process.env.discordMemberRoleId as string) || member.user.bot) {
        return;
      }

      const potentialMember = await getMemberByDiscord(member.id);
      if (potentialMember) {
        return;
      }

      await member.roles.remove(process.env.discordMemberRoleID as string);

      await message.channel.send(`Cleared <@!${member.id}>.`);
    } catch (e) {
      await message.channel.send(
        `Something went wrong with <@!${member.id}>.\`\`\`json\n${JSON.stringify(e, null, 2)}\n\`\`\``,
      );
      console.error(e);
    }
  });

/**
 * Clear All Users Command
 */
client.on('message', async (message) => {
  if (!client.user || (client.user && message.author.id === client.user.id)) {
    return;
  }

  if (
    message.channel.type === 'text' &&
    message.member &&
    message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
    client.user &&
    message.content === `<@!${client.user.id}> clear all unverified`
  ) {
    const verificationMessage = await message.reply(
      'Are you sure you want me to clear all unverified users? **WARNING!!! THIS ACTION IS NOT REVERSIBLE**',
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
          clearAll(members, message);
          await verificationMessage.delete();
          await message.reply("Thanks, I'll clear all unverified users now.");
        }
      }
    });
  }
});
