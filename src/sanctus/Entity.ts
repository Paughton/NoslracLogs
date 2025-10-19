import { Source } from "./Source";
import { CombatEvent } from "./CombatEvent.ts";

export class Entity {
    private readonly sources: Source[] = [];
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

    public getSources(): Source[] {
        return this.sources;
    }

    public getDamageDone(): number {
        return this.damageDone;
    }

    public getDamagePerSecond(): number {
        return this.damagePerSecond;
    }

    public updateDamagePerSecond(startTime: number, endTime: number) {
        let damageDone: number = 0;

        this.sources.forEach((source: Source) => {
            source.updateDamagePerSecond(startTime, endTime);
            damageDone += source.getDamageDone();
        });

        this.damagePerSecond = Math.ceil(damageDone / ((endTime - startTime) / 1000));
        this.damageDone = damageDone;
    }

    // Setters
    public pushCombatEvent(combatEvent: CombatEvent): void {
        if (combatEvent.getProperty("source") !== undefined) {
            let source: Source|undefined = this.sources.find((source: Source) => source.getName() == combatEvent.getProperty("source"));

            if (source === undefined) {
                source = new Source(String(combatEvent.getProperty("source")));
                this.sources.push(source);
            }

            source.pushCombatEvent(combatEvent);
            return;
        }

        this.combatEvents.push(combatEvent);
    }
}