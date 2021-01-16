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

/**
 * @source https://stackoverflow.com/a/41407246/5909894
    Reset = "\x1b[0m"
    Bright = "\x1b[1m"
    Dim = "\x1b[2m"
    Underscore = "\x1b[4m"
    Blink = "\x1b[5m"
    Reverse = "\x1b[7m"
    Hidden = "\x1b[8m"

    FgBlack = "\x1b[30m"
    FgRed = "\x1b[31m"
    FgGreen = "\x1b[32m"
    FgYellow = "\x1b[33m"
    FgBlue = "\x1b[34m"
    FgMagenta = "\x1b[35m"
    FgCyan = "\x1b[36m"
    FgWhite = "\x1b[37m"

    BgBlack = "\x1b[40m"
    BgRed = "\x1b[41m"
    BgGreen = "\x1b[42m"
    BgYellow = "\x1b[43m"
    BgBlue = "\x1b[44m"
    BgMagenta = "\x1b[45m"
    BgCyan = "\x1b[46m"
    BgWhite = "\x1b[47m"
 */