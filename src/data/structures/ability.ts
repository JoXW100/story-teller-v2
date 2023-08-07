import { getOptionType } from "data/optionData";
import CreatureActionData from "./creatureActionData";
import { AbilityType, ActionType, DiceType } from "types/database/dnd";
import { AbilityMetadata } from "types/database/files/ability";

class AbilityData extends CreatureActionData<AbilityMetadata> implements Required<AbilityMetadata>
{
    public get type(): AbilityType {
        return this.metadata.type ?? getOptionType('abilityType').default
    }

    public get typeName(): string {
        return getOptionType('abilityType').options[this.type] ?? String(this.type)
    }

    public get versatile(): boolean {
        return this.metadata.versatile ?? false
    }

    public get action(): ActionType {
        return this.metadata.action ?? getOptionType("action").default
    }

    // Range

    public get range(): number {
        return this.metadata.range ?? 0
    }
    
    public get rangeLong(): number {
        return this.metadata.rangeLong ?? 0
    }

    public get rangeThrown(): number {
        return this.metadata.rangeThrown ?? 0
    }

    // Hit effect roll scaling

    public get effectVersatileDice(): DiceType {
        return this.metadata.effectVersatileDice ?? getOptionType("dice").default
    }
}

export default AbilityData