class CommandErrorDetection {
  static FindIssues(testString) {
    const invalidCommands = new Set(['-no-10-again', '-8-again', '-9-again', '-10-again', '-rote']);
    const allWords = testString.split(' ');
    const detectedErrors = allWords.filter(a => invalidCommands.has(a));
    return detectedErrors;
  }
}

module.exports = CommandErrorDetection;
