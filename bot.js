var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 5) == '/roll') {
        let cmd = new Command(message);
        let newMessage =
`Rolled ${cmd.dicePool} dice for ${cmd.successes} successes
Raw dice ${cmd.resultPool.join(', ')}`;
        bot.sendMessage({
          to: channelID,
          message: newMessage
        });

     }
});

class Command {
  constructor(commandText) {
    this.commandText = commandText;
    let re = /\/roll\s+(\d+)/
    let matches = re.exec(commandText)
    if (!matches[1]) return;
    this.dicePool = +matches[1];
    this.resultPool = this.roll(this.dicePool).sort((a,b) => b-a);
    this.successes = this.resultPool.filter(a => a >= 8).length;
  }
  roll(n) {
    return new Array(n).fill(0).map( s => 1 + Math.floor(Math.random() * 10))
  }
}
