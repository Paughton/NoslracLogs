import { type CombatEventTypePart, CombatEventTypes } from "./CombatEventType";

export class CombatEvent {
    private readonly timestamp: number;
    private readonly type: string;
    private properties: { [key: string]: number|boolean|string } = {};

    constructor(timestamp: number, type: string, properties: string[]) {
        this.timestamp = timestamp;
        this.type = type.toUpperCase();

        const eventType: CombatEventTypePart[] = CombatEventTypes[this.type];
        for (let i: number = 0; i < eventType.length; i++) {
            this.properties[eventType[i].name] = properties[i];

            if (eventType[i].type == "number" || eventType[i].type == "boolean") {
                this.properties[eventType[i].name] = Number(this.properties[eventType[i].name]);
            } else {
                this.properties[eventType[i].name] = String(this.properties[eventType[i].name]);
            }
        }
    }

    public getProperty(propertyName: string): string|number|boolean {
        return this.properties[propertyName];
    }

    public getType(): string {
        return this.type;
    }

    public getTimestamp(): number {
        return this.timestamp;
    }
}