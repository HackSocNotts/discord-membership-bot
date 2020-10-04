import { Guild, GuildMember, MessageEmbed, Permissions } from 'discord.js';
import client from './client';
import { getMemberByDiscord } from '../services/members';

const isVerified = async (member: GuildMember) => {
  if (member.roles.cache.has(process.env.discordMemberRoleID as string) && !member.user.bot) {
    const potentialMember = await getMemberByDiscord(member.id);
    if (potentialMember) {
      return potentialMember;
    }
  }

  return false;
};

/**
 * Verify All Users Command
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
    message.content === `<@!${client.user.id}> who is verified`
  ) {
    try {
      message.channel.startTyping();
      const members = await (message.guild as Guild).members.fetch();
      let embedBody = '';
      let i = 1;
      const embeds: MessageEmbed[] = [];

      for (const member of members.array()) {
        const dbMember = await isVerified(member);
        embedBody += !!dbMember ? `\n ${i++}. <@${member.id}> - ${dbMember.name} (${dbMember.id})` : '';

        if (embedBody.length >= 2000) {
          embeds.push(new MessageEmbed().setTitle(`Verified Members - ${embeds.length + 1}`).setDescription(embedBody));
          embedBody = '';
        }
      }
      embeds.push(new MessageEmbed().setTitle(`Verified Members - ${embeds.length + 1}`).setDescription(embedBody));

      message.channel.stopTyping();
      await message.reply(`Here are the verified members - ${embeds.length} parts.`);
      for (const embed of embeds) {
        await message.channel.send(embed);
      }
    } catch (e) {
      message.channel.stopTyping();
      message.channel.send(`An error occurred:\n\`\`\`json\n${JSON.stringify(e, null, 2)}\n\`\`\``);
      console.error(e);
    }
  }
});
