function logger({ color = "\x1b[37m", prefix = "[LOGGER]", background = "\x1b[40m" } = {}) {
    const reset = "\x1b[0m";
    const warn = "\x1b[33m";
    const error = "\x1b[31m";

    this.color = color;
    this.log = (str) => console.log(`${background}${color}${prefix} ${reset}${background}${str}${reset}`);
    this.warn = (str) => console.log(`${background}${color}${prefix} ${warn}${str}${reset}`)
    this.error = (str) => console.log(`${background}${color}${prefix} ${error}${str}${reset}`);
}

module.exports = logger;