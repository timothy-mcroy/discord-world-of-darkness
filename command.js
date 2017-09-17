const Roller = require('./roller.js');

class Command {
  constructor(commandText, config) {
    this.rollingService = config != null ? config.rollingService : Roller;
    this.commandText = commandText;
    this.allDice = [];
    const rollExpression = /\/roll\s+(\d+)/;
    const matches = rollExpression.exec(commandText);
    if (matches === null || +matches[1] > 1000) return;
    this.dicePool = +matches[1];
    this.resultPool = this.roll(this.dicePool);
    this.successes = this.resultPool.filter(a => a >= 8).length;
    const roteExpression = /--rote/;
    const initialMisses = this.dicePool - this.successes;
    const againValue = Command.parseAgainValue(commandText);
    this.roteDice = [];
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
    return this.recursiveRollAgains(dice.filter(d => d >= againValue).length, againValue);
  }

  recursiveRollAgains(dice, againValue) {
    if (dice === 0) return 0;
    const roll = this.roll(dice).filter(d => d >= 8);
    return roll.length +
      this.recursiveRollAgains(roll.filter(d => d >= againValue).length, againValue);
  }

  static parseAgainValue(commandText) {
    const againExpression = /--(8|9|10)-again/;
    const aEMatches = againExpression.exec(commandText);
    if (aEMatches !== null && aEMatches[1]) return +aEMatches[1];
    const noTenAgainExpression = /--no-10-again/;
    const noTenMatch = noTenAgainExpression.test(commandText);
    if (noTenMatch) return 11;
    return 10;
  }
  roll(n) {
    const dice = this.rollingService.roll(n);
    this.allDice = this.allDice.concat(dice).sort((a, b) => b - a);
    return dice;
  }
}

module.exports = Command;
