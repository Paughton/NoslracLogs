class Source {
    constructor(name) {
        this.name = name;
        this.events = [];
        this.abilityBreakdown = [];
        this.damageDone = 0;
        this.dps = 0;
    }

    addEvent(event) {
        this.events.push(event);
    }

    /**
     * Calculates the damage per second between the two timestamps
     * @param {int} startTime
     * @param {int} endTime
     */
    calculateDPS(startTime, endTime) {
        // Reset variables
        this.abilityBreakdown = [];
        this.damageDone = 0;

        this.events.forEach((event) => {
            // Make sure this is an attack and is between the startTime and endTime
            if (event.type === "attack" && event.timestamp >= startTime && event.timestamp <= endTime) {
                this.damageDone += event.damageDone;

                // Get the ability from the ability breakdown array
                let ability = this.abilityBreakdown.find(x => x.name === event.abilityName);

                // Update the ability breakdown
                // If it is not already in the array then add it
                if (ability !== undefined) {
                    ability.damageDone += event.damageDone;
                    ability.crushingBlowHits += event.isCrushingBlow;
                    ability.hits++;
                } else {
                    let ability = {
                        name: event.abilityName,
                        damageDone: event.damageDone,
                        crushingBlowHits: event.isCrushingBlow,
                        hits: 1,
                        dps: 0
                    };

                    this.abilityBreakdown.push(ability);
                }
            }
        });

        // Sort the ability breakdown by damage done (higher is closer to top)
        this.abilityBreakdown.sort((x, y) => (x.damageDone > y.damageDone ? -1 : 1));

        // Update this sources DPS
        this.dps = this.damageDone / ((endTime - startTime) / 1000);

        // Update all the ability breakdown's dps
        this.abilityBreakdown.forEach((abilityBreakdown) => {
           abilityBreakdown.dps =  abilityBreakdown.damageDone / ((endTime - startTime) / 1000);
        });
    }
}

export default Source;