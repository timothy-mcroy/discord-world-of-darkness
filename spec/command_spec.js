const Command = require('../command.js');

describe('A command', () => {
  describe('a basic roll', () => {
    let dependencies;
    let cmd;
    const rollLength = 6;
    beforeEach(() => {
      dependencies = {
        rollingService: {
          roll() {},
        },
      };
      spyOn(dependencies.rollingService, 'roll').and.returnValues([10, 9, 8, 7, 6, 5], [1]);
      cmd = new Command(`/roll ${rollLength}`, dependencies);
    });

    it('rolls the expected amount', () => {
      expect(cmd.resultPool.length).toEqual(6);
    });
    it('counts any number above or equal to 8 as a success', () => {
      expect(cmd.totalSuccesses).toBeGreaterThan(2);
    });
    it('does not have rote dice', () => {
      expect(cmd.roteDice.length).toEqual(0);
    });
    it('rolls 10-again by default', () => {
      expect(cmd.allDice.length).toEqual(7);
    });
  });
});
