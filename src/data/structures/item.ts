import { getOptionType } from "data/optionData";
import FileData from "./file";
import ModifierData from "./modifier";
import CreatureStats from "./creatureStats";
import { getScalingValue } from "utils/calculations";
import { ArmorType, DiceType, ItemType, Rarity, RestType, ScalingType } from "types/database/dnd";
import ICreatureStats from "types/database/files/iCreatureStats";
import IEffect from "types/database/files/iEffect";
import { IItemMetadata } from "types/database/files/item";
import { CalculationMode, IOptionType, OptionTypeAuto } from "types/database/editor";

class ItemData extends FileData<IItemMetadata> implements Required<IItemMetadata> {
    private readonly id?: string;
    private readonly stats: CreatureStats
    constructor(metadata: IItemMetadata, stats?: ICreatureStats, id?: string) {
        super(metadata)
        this.stats = new CreatureStats(stats)
        this.id = id;
    }

    public get type(): ItemType {
        return this.metadata.type ?? getOptionType('itemType').default
    }

    public get typeName(): string {
        return getOptionType('itemType').options[this.type] ?? String(this.type)
    }

    public get rarity(): Rarity {
        return this.metadata.rarity ?? getOptionType('rarity').default
    }

    public get rarityName(): string {
        return getOptionType('rarity').options[this.rarity] ?? String(this.rarity)
    }

    public get requiresAttunement(): boolean {
        return this.metadata.requiresAttunement ?? false
    }

    // Armor

    public get armorType(): ArmorType {
        return this.metadata.armorType ?? getOptionType('armor').default
    }

    public get armorTypeName(): string {
        return getOptionType('armor').options[this.armorType] ?? String(this.armorType)
    }

    public get ac(): number {
        return this.metadata.ac ?? 0
    }

    public get limitsDex(): boolean {
        return this.metadata.limitsDex ?? false
    }

    public get maxDex(): number {
        return this.metadata.maxDex ?? 0
    }

    // Hit condition roll scaling

    public get conditionScaling(): ScalingType {
        return this.metadata.conditionScaling ?? getOptionType("scaling").default
    }

    public get conditionProficiency(): boolean {
        return this.metadata.conditionProficiency ?? false
    }

    public get conditionModifier(): IOptionType<number> {
        return this.metadata.conditionModifier ?? OptionTypeAuto
    }

    public get conditionModifierValue(): number {
        let mod = this.conditionModifier.value ?? 0;
        let useProf = this.conditionProficiency;
        let prof = useProf ? this.stats.proficiency ?? 0 : 0;
        switch (this.conditionModifier.type) {
            case CalculationMode.Modify:
                return getScalingValue(this.conditionScaling, this.stats) + mod + prof
            case CalculationMode.Override:
                return mod + prof
            case CalculationMode.Auto:
            default:
                return getScalingValue(this.conditionScaling, this.stats) + prof
        }
    }

    public get conditionSaveValue(): number {
        return this.conditionModifierValue + 8
    }

    // Hit effect roll scaling

    public get effects(): IEffect[] {
        return this.metadata.effects ?? []
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

    // Modifiers

    public get modifiers(): ModifierData[] {
        return (this.metadata.modifiers ?? []).map((modifier) => new ModifierData(modifier, this.id))
    }
    
    public get charges(): number {
        return this.metadata.charges ?? 0
    }
    
    public get chargesDice(): DiceType {
        return this.metadata.chargesDice ?? getOptionType("dice").default
    }
    
    public get chargesDiceNum(): number {
        return this.metadata.chargesDiceNum ?? 1
    }
    
    public get chargesModifier(): number {
        return this.metadata.chargesDiceNum ?? 0
    }
    
    public get chargesReset(): RestType {
        return this.metadata.chargesReset ?? getOptionType("restType").default
    }
}

export default ItemData