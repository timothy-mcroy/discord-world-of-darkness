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
        let roteMessage = !cmd.roteEnabled ? "" :
`Rote ${cmd.roteSuccesses}
Rote Agains ${cmd.roteAgains}`;
        let newMessage =
`Rolled ${cmd.dicePool} dice for ${cmd.totalSuccesses} successes
${roteMessage}
Agains ${cmd.agains}

Raw dice ${cmd.allDice.join(', ')}`;

        bot.sendMessage({
          to: channelID,
          message: newMessage
        });

     }
});

class Command {
  constructor(commandText) {
    this.commandText = commandText;
    this.allDice = []
    let rollExpression = /\/roll\s+(\d+)/
    let matches = rollExpression.exec(commandText)
    if (matches === null || +matches[1] > 1000) return;
    this.dicePool = +matches[1];
    this.resultPool = this.roll(this.dicePool);
    this.successes = this.resultPool.filter(a => a >= 8).length;
    let roteExpression = /--rote/;
    let initialMisses = this.dicePool - this.successes;
    let againValue = this.parseAgainValue(commandText);
    this.roteDice = []
    this.roteAgains = 0;
    this.roteSuccesses = 0;
    this.roteEnabled = roteExpression.test(commandText);
    if (this.roteEnabled) {
      this.roteDice = this.roll(initialMisses);
      this.roteSuccesses = this.roteDice.filter(a => a >= 8).length;
      this.roteAgains = this.rollAgains(this.roteDice, againValue);

    }
    this.agains = this.rollAgains(this.resultPool, againValue);
    this.totalSuccesses = this.successes + this.agains + this.roteAgains + this.roteSuccesses;
  }

  rollAgains(dice, againValue) {
    return this._rollAgains(dice.filter(d => d >= againValue).length, againValue);
  }

  _rollAgains(dice, againValue) {
    if (dice == 0) return 0;
    let roll = this.roll(dice).filter(d => d >= 8);
    return roll.length + this._rollAgains(roll.filter( d => d >= againValue).length, againValue);
  }

  parseAgainValue(commandText) {
    let againExpression = /--(8|9|10)-again/;
    let aEMatches = againExpression.exec(commandText);
    if (aEMatches !== null && aEMatches[1]) return +aEMatches[1];
    let noTenAgainExpression = /--no-10-again/;
    let noTenMatch = noTenAgainExpression.test(commandText);
    if (noTenMatch) return 11;
    return 10;
  }
  roll(n) {
    var dice = new Array(n).fill(0).map( s => 1 + Math.floor(Math.random() * 10));
    this.allDice = this.allDice.concat(dice).sort((a,b) => b-a);
    return dice;
  }
}
