// Main.js

// Import
import Attack from "./attack.js";

/**
 * Returns a number but with commas!
 * @param {int} number
 * @returns {string}
 */
function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// The main object
const combatLog = {
    // The contents of the combat log text file
    bodyText: "",

    // Data
    attacks: [],
    sources: [],

    // Stuff regarding the fight length
    startTime: -1,
    endTime: -1,
    duration: 0,

    /**
     * Loads the combat log's body text into it's corresponding variable
     */
    initialize: function() {
        let client = new XMLHttpRequest();
        client.open("GET", "./combatlog.txt");
        client.onreadystatechange = function() {
            if (client.readyState === XMLHttpRequest.DONE && client.status === 200) {
                combatLog.bodyText = client.responseText;
                combatLog.process();
            }
        }
        client.send();
    },

    /**
     * Processes each and every line of the combat text file
     * Creates the corresponding events based on the type of event as well
     */
    process: function() {
        // Split the text file
        let lines = this.bodyText.split("\r\n");

        lines.forEach((line) => {
            // Sometimes the last line is empty so just make sure the line is not empty
            if (line === "") return;

            let temp = line.split("  ")

            // Get the timestamp and data values
            let timestamp = parseInt(temp[0]);
            let data = temp[1].split(",")

            // Set up the startTime and endTime
            if (timestamp < this.startTime || this.startTime === -1) this.startTime = timestamp;
            if (timestamp > this.endTime || this.endTime === -1) this.endTime = timestamp;

            // Do different tasks based on different events
            switch (data[0]) {
                case "attack":
                    /*
                        "attack"
                        Attack Name
                        amount
                        is crushing (0 or 1)
                    */
                    // Create the attack using the above parameters
                    let attack = new Attack(timestamp, data[1], data[2], parseInt(data[3]), Boolean(parseInt(data[4])));

                    // Add this to the combat log's attacks
                    this.attacks.push(attack);

                    // If this source is not in our database then add it
                    if (!this.sources.includes(data[1])) this.sources.push(data[1]);
                    break;
            }
        });

        // Now that we have all the names of the sources let's replace them with objects rather than strings
        let sources = [];
        this.sources.forEach((source) => {
            sources.push({
                name: source,
                damageDone: 0,
                dps: 0,
                attacks: []
            });
        })

        // Update this combat logs sources
        this.sources = sources;

        // Set this combat log's duration
        this.duration = this.endTime - this.startTime;

        // Calculate
        this.calculate();
    },

    /**
     * Calculate the DPS and damage done for each source
     */
    calculate: function() {
        this.sources.forEach((source) => {
            this.attacks.forEach((attack) => {
                 if (attack.source === source.name) {
                     source.damageDone += attack.amount;

                     let foundAttack = false;
                     source.attacks.forEach((sourceAttack) => {
                        if (sourceAttack.name === attack.name) {
                            sourceAttack.amount += attack.amount;
                            sourceAttack.casts++;
                            foundAttack = true;
                        }
                     });

                     if (!foundAttack) source.attacks.push(attack);
                 }
            });

            source.attacks = source.attacks.sort((a, b) => (a.amount > b.amount ? -1 : 1));
            source.attacks.forEach((sourceAttack) => {
               sourceAttack.dps = sourceAttack.amount / (this.duration / 1000);
            });

            source.dps = source.damageDone / (this.duration / 1000);
        });

        this.update();
    },

    /**
     * Updates the display on the HTML page
     */
    update: function() {
        let content = document.getElementById("combatLogContent");

        this.sources.forEach((source) => {
            if (source.name === "player") {
                source.attacks.forEach((attack) => {
                    content.innerHTML += `<tr>
                        <td data-border="true">${attack.name}</td>
                        <td class="centerText" data-border="true">${numberWithCommas(attack.amount)}</td>
                        <td data-border="true">
                            <div class="progressBarContainer" data-theme="dark">
                                <div class="progressBar" style="width: ${attack.dps / source.dps * 100}%; background-color: #bd1a2d;">&nbsp;</div>
                                <div class="textContainer textShadowDark">${numberWithCommas(Math.round(attack.dps))} (${Math.round(attack.dps / source.dps * 100)}%)</div>
                            </div>
                        </td>
                        <td class="centerText" data-border="true">${attack.casts}</td>
                    </tr>`
                });
            }

            document.getElementById("damageDone").innerHTML = numberWithCommas(source.damageDone);
            document.getElementById("dps").innerHTML = numberWithCommas(Math.round(source.dps));
        });
    }
}

// Initialize the combat log
combatLog.initialize();