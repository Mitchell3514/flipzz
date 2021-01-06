function logger({ color = "\x1b[37m", prefix = "[LOGGER]", background = "\x1b[40m" } = {}) {
    const reset = "\x1b[0m";
    const warn = "\x1b[33m";
    const error = "\x1b[31m";

    this.color = color;
    this.log = (str) => process.stdout.write(`${background}${color}${prefix} ${reset}${background}${str}${reset}\n`);
    this.warn = (str) => process.stdout.write(`${background}${color}${prefix} ${warn}${str}${reset}\n`)
    this.error = (str) => process.stderr.write(`${background}${color}${prefix} ${error}${str}${reset}\n`);
}

module.exports = logger;