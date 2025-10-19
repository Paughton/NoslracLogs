import type { Sanctus } from "../sanctus/Sanctus";
import type { Entity } from "../sanctus/Entity";
import type { JSX } from "react";
import type { Source } from "../sanctus/Source";

function DamageTableRow({ entity, source }: { entity: Entity, source: Source }): JSX.Element {
    return (
        <tr>
            <td data-border="true" style={{ overflow: "hidden", whiteSpace: "nowrap" }}>{source.getName()}</td>
            <td className="centerText" data-border="true">{source.getDamageDone().toLocaleString()}</td>
            <td data-border="true">
                <div className="progressBarContainer" data-theme="dark">
                    <div className="progressBar" style={{width: `${source.getDamagePerSecond() / entity.getDamagePerSecond() * 100}%`, backgroundColor: "#bd1a2d"}}>&nbsp;</div>
                    <div className="textContainer textShadowDark">{ source.getDamagePerSecond().toLocaleString() } ({Math.round(source.getDamagePerSecond() / entity.getDamagePerSecond() * 100)}%)</div>
                </div>
            </td>
            <td className="centerText" data-border="true">{source.getCombatEventsWithType("ABILITY_CAST").filter((event: Event) => !event.getProperty("castBySkill")).length}</td>
            <td className="centerText" data-border="true">{source.getCombatEventsWithType("ATTACK").length}</td>
            <td className="centerText" data-border="true">{source.getCombatEventsWithType("ATTACK").filter((event: Event) => event.getProperty("isCrushing")).length}</td>
        </tr>
    );
}

function Profile({entity}: { entity: Entity }) {
    return (
        <div>
            <h1>{entity.getName()}</h1>
            <br />
            <p>DPS: {entity.getDamagePerSecond().toLocaleString()}</p>
            <p>Total Damage Done: {entity.getDamageDone().toLocaleString()}</p>
            <table data-theme="dark" data-length="full" className="fontVerdana">
                <thead>
                <tr>
                    <th scope="col" data-border="true" data-length="medium">Ability Name</th>
                    <th scope="col" data-border="true" data-length="small">Damage</th>
                    <th scope="col" data-border="true">DPS</th>
                    <th scope="col" data-border="true" data-length="tiny">Casts</th>
                    <th scope="col" data-border="true" data-length="tiny">Hits</th>
                    <th scope="col" data-border="true" data-length="tiny">Crush</th>
                </tr>
                </thead>
                <tbody id="combatLogContent">
                    {entity.getSources().sort((a: Source, b: Source) => b.getDamageDone() - a.getDamageDone()).map((source: Source, index: number) => {
                       if(source.getDamageDone() > 0) return (<DamageTableRow key={index} entity={entity} source={source} />);
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function Log({combatLogReader}: { combatLogReader: Sanctus }): JSX.Element {
    return (
        <div className="fontVerdana">
            <h1>Combat Log</h1>
            <br />
            <p>Duration: {combatLogReader.getDuration()} seconds</p>
            <p>No. of entries: {combatLogReader.getEntities().length}</p>
            <hr/>
            <div>
                {combatLogReader.getEntities().sort((a: Entity, b: Entity) => b.getDamageDone() - a.getDamageDone()).map((entity: Entity, index: number) => {
                    if (entity.getDamageDone() > 0) return (<Profile key={index} entity={entity} />);
                })}
            </div>
        </div>
    );
}