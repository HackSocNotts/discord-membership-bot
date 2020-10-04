import { ClientUser, Guild, GuildMember, MessageEmbed, Permissions } from 'discord.js';
import client from './client';
import { getMemberByDiscord } from '../services/members';

const needsToBeVerified = async (member: GuildMember) => {
  if (member.roles.cache.has(process.env.discordMemberRoleID as string) && !member.user.bot) {
    const potentialMember = await getMemberByDiscord(member.id);
    if (potentialMember) {
      return false;
    }

    return true;
  }

  return false;
};

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
    message.content === `<@!${(client.user as ClientUser).id}> who to verify`
  ) {
    try {
      message.channel.startTyping();
      const members = await (message.guild as Guild).members.fetch();
      let embedBody = '';

      for (const member of members.array()) {
        embedBody += (await needsToBeVerified(member)) ? `\n - <@${member.id}>` : '';
      }

      const embed = new MessageEmbed().setTitle(`Unverified members`).setDescription(embedBody);

      message.channel.stopTyping();
      await message.channel.send('Here are the unverified members', embed);
    } catch (e) {
      message.channel.stopTyping();
      message.channel.send(`An error occurred:\n\`\`\`json\n${JSON.stringify(e, null, 2)}\n\`\`\``);
      console.error(e);
    }
  }
});
