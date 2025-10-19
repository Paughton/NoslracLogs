import { type JSX } from "react";
import { LineChart, Line, Tooltip, XAxis, YAxis, Label, type TooltipContentProps } from "recharts";
import type { Source } from "../sanctus/Source";
import type { CombatEvent } from "../sanctus/CombatEvent";
import "../styles/main.css";

type DamageData = {
    time: number,
    damage: number
}

function DamageDoneTooltip({ active, payload, label }: TooltipContentProps<string | number, string>): JSX.Element {
    const isVisible = active && payload && payload.length;
    return (
        <div className="damageGraphTooltip" style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
            {isVisible && (
                <>
                    <p className="label">{label}s</p>
                    <p className="desc">Damage Done: <b>{payload[0].value.toLocaleString()}</b></p>
                </>
            )}
        </div>
    );
}

export function DamageProfile({ sources }: { sources: Source[] }): JSX.Element {
    const data: DamageData[] = [];

    sources.forEach((source: Source) => {
        for (let timestamp: number = source.getStartTime(); timestamp < source.getEndTime(); timestamp += 1000) {
            const time: number = Math.round((timestamp - source.getStartTime()) / 1000)
            const combatEvents: CombatEvent[] = source.getCombatEventsWithinTimestamp(timestamp, timestamp + 999, "ATTACK");
            const dataFound: DamageData|undefined = data.find((data) => data.time === time);

            if (combatEvents.length > 0) {
                const damage: number = combatEvents.reduce((accumulator: number, combatEvent: CombatEvent) => {
                    return accumulator + Number(combatEvent.getProperty("damage"));
                }, 0);

                if (!dataFound) {
                    data.push({
                        time: time,
                        damage: damage
                    });
                } else {
                    dataFound.damage += damage;
                }
            }
        }
    });

    // sort
    data.sort((a: DamageData, b: DamageData) => a.time - b.time);

    return (
        <LineChart width={"100%"} height={300} data={data} responsive>
            <XAxis dataKey="time" type="number" height={75} domain={[0, data[data.length - 1].time]} tickCount={15}>
                <Label value="Time (seconds)" />
            </XAxis>
            <YAxis dataKey="damage" type="number" width={75}>
                <Label angle={270} position="insideLeft" style={{ textAnchor: 'middle' }}>DPS</Label>
            </YAxis>
            <Tooltip content={ DamageDoneTooltip } />
            <Line dataKey="damage" type="monotone" dot={ false } />
        </LineChart>
    )
}