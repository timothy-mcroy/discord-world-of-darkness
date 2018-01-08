const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const Command = require('./command.js');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.level = 'debug';
// Initialize Discord Bot
const bot = new Discord.Client({
  token: auth.token,
  autorun: true,
});
bot.on('ready', () => {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(`${bot.username} - (${bot.id})`);
});
bot.on('disconnect', (err, code) => {
  console.log(err, code);
})
bot.on('message', (user, userID, channelID, message) => {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 5) === '/roll') {
    const cmd = new Command(message);
    const roteMessage = !cmd.roteEnabled ? '' :
      `${cmd.roteSuccesses} Rote
${cmd.roteAgains} Rote Agains `;
    const echoMessage = `\`${message}\``;
    const responseMessage =
`<@${userID}> - ${echoMessage}

**${cmd.totalSuccesses}** successes from ${cmd.dicePool} initial dice

\`\`\`javascript
Success breakdown
-----------------
${cmd.successes} Initial Roll
${cmd.agains} Agains
${roteMessage}

${cmd.allDice.length} total dice
${cmd.allDice.join(', ')}
\`\`\``;

    const helpMessage =
`Sorry, <@${userID}> - I didn't understand \`${message}\`
Roll commands must follow a certain format.
\`\`\`
/roll 15
/roll 15 --rote
/roll 15 --8-again
/roll 15 --no-10-again
/roll 15 --rote --8-again
/roll 15 --8-again --rote
\`\`\`
`;
    bot.sendMessage({
      to: channelID,
      message: cmd.allDice.length === 0 ? helpMessage : responseMessage,
    });
  }
});
