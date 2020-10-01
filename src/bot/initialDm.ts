import client from './client';

/**
 * Message user on server join
 */
client.on('guildMemberAdd', async (member) => {
  console.log(member.displayName, 'joined');
  member.send('Hello World!');
});
