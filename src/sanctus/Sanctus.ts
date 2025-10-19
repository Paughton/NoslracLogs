import {Entity} from "./Entity.ts";
import {CombatEvent} from "./CombatEvent.ts";

export class Sanctus {
    private readonly entities: Entity[] = [];
    private readonly events: CombatEvent[] = [];
    private startTime: number = 0;
    private endTime: number = 0;

    processLine(line: string): void {
        // Process line
        const timestamp: number = Number(line.split("  ")[0]);
        const type: string = line.split("  ")[1].split(",")[0];
        const properties: string[] = line.split("  ")[1].split(",").slice(1);

        // Create the event
        const combatEvent: CombatEvent = new CombatEvent(timestamp, type, properties);

        if (combatEvent.getProperty("entity") !== undefined) {
            let entity: Entity|undefined = this.entities.find((entity: Entity) => entity.getName() == combatEvent.getProperty("entity"));

            if (!entity) {
                entity = new Entity(String(combatEvent.getProperty("entity")));
                this.entities.push(entity);
            }

            entity.pushCombatEvent(combatEvent);
        } else {
            this.events.push(combatEvent);
        }

        // Timestamps
        // TEMP
        if (this.startTime === 0 || combatEvent.getTimestamp() < this.startTime) this.startTime = combatEvent.getTimestamp();
        if (combatEvent.getTimestamp() > this.endTime) this.endTime = combatEvent.getTimestamp();
    }

    processLog(file: File): Promise<string> {
        return new Promise((resolve) => {
            // Create the file reader
            const fileReader: FileReader = new FileReader();

            // Process the file
            fileReader.onload = (event: ProgressEvent<FileReader>) => {
                if (!event.target || !event.target.result) return;
                const lines = (event.target.result as string).split("\n");

                lines.forEach((line: string) => {
                    if (line === "") return;
                    this.processLine(line.replace(/(\r\n|\n|\r)/gm, ""));
                });

                this.entities.forEach((entity: Entity) => {
                    entity.updateDamagePerSecond(this.startTime, this.endTime);
                });

                resolve(fileReader.result as string);
            }

            // Load the file
            fileReader.readAsText(file);
        })
    }

    // Getters
    public getEntities(): Array<Entity> {
        return this.entities;
    }

    public getDuration(): number {
        return (this.endTime - this.startTime) / 1000;
    }

    // Setters
}