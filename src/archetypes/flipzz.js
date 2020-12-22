module.exports = class Flippz {
    #priv;
    test = 2;

    constuctor() {
        this.priv = 2;
        this.test ?= 3;
    }

    test() { return this.priv; }
};
