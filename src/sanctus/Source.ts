import type {CombatEvent} from "./CombatEvent.ts";

export class Source {
    private readonly combatEvents: CombatEvent[] = [];
    private readonly name: string;
    private damagePerSecond: number = 0;
    private damageDone: number = 0;

    constructor(name: string) {
        this.name = name;
    }

    // Getters
    public getName(): string {
        return this.name;
    }

    public getDamagePerSecond(): number {
        return this.damagePerSecond;
    }

    public getDamageDone(): number {
        return this.damageDone;
    }

    public getCombatEventsWithType(type: string): CombatEvent[] {
        const combatEvents: CombatEvent[] = [];

        this.combatEvents.forEach((combatEvent: CombatEvent) => {
            if (combatEvent.getType() == type) combatEvents.push(combatEvent);
        })

        return combatEvents;
    }

    // Setters
    public updateDamagePerSecond(startTime: number, endTime: number): void {
        let damageDone: number = 0;

        this.combatEvents.forEach((combatEvent: CombatEvent) => {
            if (combatEvent.getType() === "ATTACK" && (combatEvent.getTimestamp() >= startTime && combatEvent.getTimestamp() <= endTime)) {
                damageDone += Number(combatEvent.getProperty("damage"));
            }
        });

        this.damagePerSecond = Math.ceil(damageDone / ((endTime - startTime) / 1000));
        this.damageDone = damageDone;
    }

    public pushCombatEvent(combatEvent: CombatEvent): void {
        this.combatEvents.push(combatEvent);
    }
}