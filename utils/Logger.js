const chalk = require("chalk");

class Logger {
  constructor(method, error) {
    this.method = method;
    this.errorMethod = error || method;
  }

  log(message) {
    this.method(message);
  }

  info(message) {
    this.log(chalk.bgGreen("INFO:") + " " + message);
  }

  warning(message) {
    this.log(chalk.bgYellow("WARNING:") + " " + message);
  }

  error(message) {
    this.errorMethod(chalk.bgRed("ERROR:") + " " + message);
  }
}

module.exports = Logger;
