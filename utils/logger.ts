import chalk from "chalk";

class Logger {
  private method: (text: string) => void;
  private errorMethod: (text: string) => void;

  constructor(method: (text: string) => void, error?: (text: string) => void) {
    this.method = method;
    this.errorMethod = error || method;
  }

  log(message: string) {
    this.method(message);
  }

  info(message: string) {
    this.log(chalk.bgGreen("INFO:") + " " + message);
  }

  warning(message: string) {
    this.log(chalk.bgYellow("WARNING:") + " " + message);
  }

  error(message: string) {
    this.errorMethod(chalk.bgRed("ERROR:") + " " + message);
  }
}

export default Logger;
