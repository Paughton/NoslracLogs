// Main.js

// Import
import Source from "./source.js";
import EventTemplates from "./eventtemplates.js";

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
    events: [],
    sources: [],

    // Stuff regarding the fight length
    startTime: -1,
    endTime: -1,
    duration: 0,

    // Display
    selectedSource: "player",

    /**
     * Loads the combat log's body text into it's corresponding variable
     */
    initialize: function() {
        fetch("combatlog.txt").then(function (response) {
            return response.text();
        }).then(function (data) {
            combatLog.bodyText = data;
            combatLog.process();
        }).catch(function (error) {
            console.log(error);
        });
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

            // Create the boilerplate event
            let event = {
                "timestamp": timestamp,
                "type": data[0]
            };

            // Create the event based on the indexes provided in the event template
            Object.keys(EventTemplates[event.type]).forEach((key) => {
                // Get the value of the index provided in the event template
                let value = data[EventTemplates[event.type][key]];

                // If the value only contains numbers then convert the string into an integer
                if (/^\d+$/.test(value)) value = parseInt(value);

                // Assign the variable
                event[key] = value;
            });

            // Add this event to the events array
            this.events.push(event);

            // If this event has a source then add this event to that source's event array
            if (event.source !== undefined) {
                // Find the source with the given name
                let source = this.sources.find(x => x.name === event.source);

                // If the source is not undefined (it's already in the array) then add the event
                // Otherwise create a new source and add the event and push the source into this combat log's sources
                if (source !== undefined) {
                    source.addEvent(event);
                } else {
                    let source = new Source(event.source);
                    source.addEvent(event);
                    this.sources.push(source);
                }
            }
        });

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
            // Calculate the DPS of this source for the entire fight
            source.calculateDPS(this.startTime, this.endTime);
        });

        // Update
        this.update();
    },

    /**
     * Updates the display on the HTML page
     */
    update: function() {
        let content = document.getElementById("combatLogContent");

        this.sources.forEach((source) => {
            if (source.name === this.selectedSource) {
                source.abilityBreakdown.forEach((ability) => {
                    content.innerHTML += `<tr>
                        <td data-border="true" style="overflow:hidden; white-space:nowrap;">${ability.name}</td>
                        <td class="centerText" data-border="true">${numberWithCommas(ability.damageDone)}</td>
                        <td data-border="true">
                            <div class="progressBarContainer" data-theme="dark">
                                <div class="progressBar" style="width: ${ability.dps / source.dps * 100}%; background-color: #bd1a2d;">&nbsp;</div>
                                <div class="textContainer textShadowDark">${numberWithCommas(Math.round(ability.dps))} (${Math.round(ability.dps / source.dps * 100)}%)</div>
                            </div>
                        </td>
                        <td class="centerText" data-border="true">${ability.hits}</td>
                    </tr>`
                });
            }

            document.getElementById("damageDone").innerHTML = numberWithCommas(source.damageDone);
            document.getElementById("dps").innerHTML = numberWithCommas(Math.round(source.dps));
            document.getElementById("duration").innerHTML = Math.round(this.duration / 1000).toString();
        });
    }
}

// Initialize the combat log
combatLog.initialize();