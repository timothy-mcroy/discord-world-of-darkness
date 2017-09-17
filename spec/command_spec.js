const Command = require('../command.js');

describe('A command', () => {
  describe('a basic roll', () => {
    let dependencies;
    let cmd;
    const firstRollResult = [10, 9, 8, 7, 6, 5];
    beforeEach(() => {
      dependencies = {
        rollingService: {
          roll() {},
        },
      };
      spyOn(dependencies.rollingService, 'roll').and.returnValues([10, 9, 8, 7, 6, 5], [1]);
      cmd = new Command(`/roll ${firstRollResult.length}`, dependencies);
    });

    it('rolls the expected amount', () => {
      expect(cmd.resultPool.length).toEqual(6);
    });
    it('counts any number above or equal to 8 as a success', () => {
      expect(cmd.totalSuccesses).toEqual(3);
    });
    it('does not have rote dice', () => {
      expect(cmd.roteDice.length).toEqual(0);
    });
    it('rolls 10-again by default', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(firstRollResult.length);
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(1);

      expect(cmd.allDice.length).toEqual(7);
    });
  });

  describe('a roll with 9-again', () => {
    let dependencies;
    let cmd;
    const firstRollResult = [10, 9, 9, 8, 7, 6, 5];
    beforeEach(() => {
      dependencies = {
        rollingService: {
          roll() {},
        },
      };
      spyOn(dependencies.rollingService, 'roll').and.returnValues(firstRollResult, [1, 2, 3]);
      cmd = new Command(`/roll ${firstRollResult.length} --9-again`, dependencies);
    });
    it('rolls results of 9 and higher once more', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(firstRollResult.length);
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(3);

      expect(cmd.allDice.length).toEqual(10);
    });
  });

  describe('a roll with 8-again', () => {
    let dependencies;
    let cmd;
    const firstRollResult = [10, 9, 9, 8, 7, 6, 5];
    beforeEach(() => {
      dependencies = {
        rollingService: {
          roll() {},
        },
      };
      spyOn(dependencies.rollingService, 'roll').and.returnValues(firstRollResult, [1, 2, 3, 4]);
      cmd = new Command(`/roll ${firstRollResult.length} --8-again`, dependencies);
    });
    it('rolls results of 8 and higher once more', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(firstRollResult.length);
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(4);
      expect(cmd.allDice.length).toEqual(11);
    });
  });

  describe('a roll with rote action', () => {
    let dependencies;
    let cmd;
    const firstRollResult = [10, 9, 9, 8, 7, 6, 5, 1, 1, 1];
    beforeEach(() => {
      dependencies = {
        rollingService: {
          roll() {},
        },
      };
      spyOn(dependencies.rollingService, 'roll')
        .and.returnValues(firstRollResult, [1, 2, 3, 4, 5, 6], [1, 2, 3, 4], [1]);
      cmd = new Command(`/roll ${firstRollResult.length} --rote`, dependencies);
    });
    it('rolls the an initial dice pool', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(firstRollResult.length);
    });
    it('rolls the missed rolls for another shot.', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(6);
    });
    it('still rolls 10-agains', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(1);
    });
    it('sets a roteDice property', () => {
      expect(cmd.roteDice.length).toEqual(6);
    });
    it('affects the total dice rolled', () => {
      expect(cmd.allDice.length).toEqual(20);
    });
  });
  describe('a roll with exploding dice', () => {
    let dependencies;
    let cmd;
    const firstRollResult = [10, 9, 9, 8, 7, 6, 5, 1, 1, 1];
    beforeEach(() => {
      dependencies = {
        rollingService: {
          roll() {},
        },
      };
      spyOn(dependencies.rollingService, 'roll')
        .and.returnValues(firstRollResult, [8, 9, 10, 7], [8, 8, 7], [1, 1]);
      cmd = new Command(`/roll ${firstRollResult.length} --8-agains`, dependencies);
    });
    it('rerolls the first wave of exploding dice', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(4);
    });
    it('rerolls the second wave of exploding dice', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(3);
    });
    it('rerolls the third wave of exploding dice', () => {
      expect(dependencies.rollingService.roll).toHaveBeenCalledWith(2);
    });
    it('keeps track of the total dice rolled', () => {
      expect(cmd.allDice.length).toEqual(firstRollResult.length + 9);
    });
  });
});
