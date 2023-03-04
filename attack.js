// Attack

class Attack {
    /**
     * Creates an Attack
     * @param {int} timestamp
     * @param {string} source
     * @param {string} name
     * @param {int} amount
     * @param {boolean} isCrushing
     */
    constructor(timestamp, source, name, amount, isCrushing) {
        this.source = source;
        this.name = name;
        this.amount = amount;
        this.is_crushing = isCrushing;
        this.casts = 1;
        this.dps = 0;
    }
}

export default Attack;