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
    return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Parses the string into a number (if applicable)
 * @param {string} str
 * @returns {string|number}
 */
function customParseInt(str) {
    const parsed = +str;
    return str.trim()==="" ? str : isNaN(parsed) ? str : parsed;
}

// The main object
const combatLog = {
    // The contents of the combat log text file
    bodyText: "",

    // Data
    events: [],
    sources: [],

    // Stuff regarding the fight length
    baseStartTime: -1,
    baseEndTime: -1,
    baseDuration: 0,
    startTime: -1,
    endTime: -1,
    duration: 0,

    // Display
    selectedSource: "player",
    chartBackgroundColors: [
        "rgba(210,16,16,0.75)",
        "rgba(16,187,210,0.75)",
        "rgba(255,242,0,0.75)",
        "rgba(174,16,210,0.75)",
        "rgba(35,210,16,0.75)",
        "rgba(16,210,152,0.75)",
        "rgba(255,165,0,0.75)",
        "rgba(132,16,210,0.75)",
        "rgba(210,16,126,0.75)",
        "rgba(16,210,142,0.75)",
        "rgba(87,16,210,0.75)",
        "rgba(16,142,210,0.75)",
        "rgba(16,210,123,0.75)",
        "rgba(210,16,84,0.75)",
    ],

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
            if (timestamp < this.baseStartTime || this.baseStartTime === -1) this.baseStartTime = timestamp;
            if (timestamp > this.baseEndTime || this.baseEndTime === -1) this.baseEndTime = timestamp;

            // Create the boilerplate event
            let event = {
                "timestamp": timestamp,
                "type": data[0]
            };

            // Create the event based on the indexes provided in the event template
            Object.keys(EventTemplates[event.type]).forEach((key) => {
                // Assign the variable
                event[key] = customParseInt(data[EventTemplates[event.type][key]]);
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
        this.startTime = this.baseStartTime;
        this.endTime = this.baseEndTime;
        this.baseDuration = this.baseEndTime - this.baseStartTime;

        // Calculate
        this.calculate();
    },

    /**
     * Calculate the DPS and damage done for each source
     */
    calculate: function() {
        // Update the duration
        this.duration = this.endTime - this.startTime;

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
        content.innerHTML = ``;

        let xValues = [];
        let yValues = [];
        let datasets = [];
        let datasetsIndex = 0;

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
                    </tr>`;

                    datasets.push({
                        label: ability.name,
                        backgroundColor: this.chartBackgroundColors[datasetsIndex],
                        borderColor: "rgba(0,255,255,0.5)",
                        hidden: true,
                        data: []
                    });
                    datasetsIndex++;
                });

                // Add events to the x and y values for the graph
                source.events.forEach((event) => {
                   if (event.type === "attack" && event.timestamp >= this.startTime && event.timestamp <= this.endTime) {
                       let index = xValues.indexOf(Math.round((event.timestamp - this.startTime) / 1000));
                       let dataset = datasets.find(x => x.label === event.abilityName)

                       if (index === -1) {
                           xValues.push(Math.round((event.timestamp - this.startTime) / 1000));
                           yValues.push(event.damageDone);
                           index = xValues.length - 1;
                       } else yValues[index] += event.damageDone;

                       if (dataset.data[index] === undefined) dataset.data[index] = event.damageDone;
                       else dataset.data[index] += event.damageDone;
                   }
                });

                document.getElementById("damageDone").innerHTML = numberWithCommas(source.damageDone);
                document.getElementById("dps").innerHTML = numberWithCommas(Math.round(source.dps));
            }

            // Update the duration
            if (this.duration !== this.baseDuration) document.getElementById("duration").innerHTML = `${Math.round(this.duration / 1000).toString()} (out of ${Math.round(this.baseDuration / 1000)})`;
            else document.getElementById("duration").innerHTML = Math.round(this.duration / 1000).toString();


            // Fix the holes in the data
            datasets.forEach((dataset) => {
                for (let i = 0; i < (this.endTime - this.startTime) / 1000; i++) {
                    if (dataset.data[i] === undefined) dataset.data[i] = 0;
                }
            });

            // Add the total damage done
            datasets.push({
                label: "Total Damage Done",
                backgroundColor: this.chartBackgroundColors[datasetsIndex],
                borderColor: "rgba(0,255,255,0.5)",
                data: yValues
            });

            // Create the graph
            // Documentation: https://www.chartjs.org/docs/2.9.4/
            document.getElementById("damageBreakdownChart").remove();
            document.getElementById("chartContainer").innerHTML = `<canvas id="damageBreakdownChart"></canvas>`;
            new Chart("damageBreakdownChart", {
                type: "line",
                data: {
                    labels: xValues,
                    datasets: datasets
                },
                options: {
                    title: {
                        display: true,
                        text: "Damage Down Breakdown",
                        fontColor: "rgb(255,255,255)"
                    },
                    legend: {
                        display: true,
                        labels: {
                            fontColor: "rgb(255,255,255)"
                        }
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return numberWithCommas(tooltipItem.value);
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "Time (seconds)"
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 10,
                            }
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "Damage Dealt"
                            },
                            ticks: {
                                beginAtZero:true,
                                userCallback: function(value, index, values) {
                                    return numberWithCommas(value);
                                }
                            }
                        }]
                    }
                }
            });
        });
    }
}

// Initialize the combat log
combatLog.initialize();

// When the snippet button is pressed
document.getElementById("snippetButton").addEventListener("click", function(event) {
    // Set the start times and end times
    combatLog.startTime = parseInt(document.getElementById("startTime").value) * 1000 + combatLog.baseStartTime;
    combatLog.endTime = parseInt(document.getElementById("endTime").value) * 1000 + combatLog.baseStartTime;

    // Make sure the snippet end time does not extend past the base end time
    if (combatLog.endTime > combatLog.baseEndTime) combatLog.endTime = combatLog.baseEndTime;

    // Reset the DOM elements
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";

    // Update the combat log
    combatLog.calculate();
});

// When the reset button is pressed
document.getElementById("resetButton").addEventListener("click", function(event) {
    // Set the start times and end times
    combatLog.startTime = combatLog.baseStartTime;
    combatLog.endTime = combatLog.baseEndTime;

    // Update the combat log
    combatLog.calculate();
});