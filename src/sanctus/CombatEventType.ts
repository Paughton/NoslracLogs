export type CombatEventTypePart = {
    name: string;
    type: string;
}

type CombatEventTypeMap = {
    [kay: string]: CombatEventTypePart[];
}

export const CombatEventTypes: CombatEventTypeMap ={
    ATTACK: [
        {
            name: "entity",
            type: "string"
        },
        {
            name: "source",
            type: "string"
        },
        {
            name: "damage",
            type: "number"
        },
        {
            name: "isCrushing",
            type: "boolean"
        },
        {
            name: "castBySkill",
            type: "boolean"
        }
    ],

    ABILITY_CAST: [
        {
            name: "entity",
            type: "string"
        },
        {
            name: "source",
            type: "string"
        },
        {
            name: "castBySkill",
            type: "boolean"
        }
    ]
};