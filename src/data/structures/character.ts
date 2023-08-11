import Dice from "utils/data/dice";
import CreatureData from "./creature";
import ClassData from "./classData";
import { getOptionType } from "data/optionData";
import { RollOptions } from "data/elements/roll";
import { CharacterMetadata } from "types/database/files/character";
import { Attribute, DiceType, Gender } from "types/database/dnd";
import { ObjectId } from "types/database";
import { ModifierCollection } from "types/database/files";
import { CreatureMetadata } from "types/database/files/creature";
import { CalculationMode } from "types/database/editor";
import { ClassMetadataProperties } from "types/database/files/class";

class CharacterData extends CreatureData implements Required<CharacterMetadata>
{
    public readonly metadata: CharacterMetadata;
    private readonly characterClass: ClassMetadataProperties 
    public constructor(metadata: CreatureMetadata, modifiers?: ModifierCollection, characterClass?: ClassMetadataProperties) {
        if (characterClass) {
            let collection = characterClass.getModifiers(metadata?.level ?? 0);
            super(metadata, collection?.join(modifiers) ?? modifiers)
        } else {
            characterClass = new ClassData({}, {})
            super(metadata, modifiers)
        }
        this.characterClass = characterClass;
    }

    // overrides

    public override get hitDice(): DiceType {
        if (this.characterClass.hitDice !== DiceType.None) {
            return this.characterClass.hitDice
        } else {
            return this.metadata.hitDice ?? getOptionType("dice").default
        }
    }
    
    public override get healthValue(): number {
        let value = this.health.value ?? 0;
        switch (this.health.type) {
            case CalculationMode.Override:
                return value + this.modifiers.bonusHealth;
            default:
            case CalculationMode.Auto:
                    value = 0;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                if (this.level > 0 && this.hitDiceValue) {
                    return Dice.average(this.hitDice, this.numHitDice - 1) + this.hitDiceValue + mod * this.level + value + this.modifiers.bonusHealth
                } else {
                    return Dice.average(this.hitDice, this.numHitDice) + mod * this.level + value + this.modifiers.bonusHealth
                }
        }
    }

    public override get healthRoll(): RollOptions {
        let value = this.health.value ?? 0;
        switch (this.health.type) {
            case CalculationMode.Override:
                return {
                    dice: "0",
                    num: "0",
                    mod: String(value + this.modifiers.bonusHealth),
                    desc: "Max health"
                } as RollOptions;
            default:
            case CalculationMode.Auto:
                value = 0;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                if (this.level > 0 && this.hitDiceValue) {
                    return {
                        dice: String(this.hitDice),
                        num: String(this.numHitDice - 1),
                        mod: String(this.hitDiceValue + mod * this.level + value + this.modifiers.bonusHealth),
                        desc: "Max health"
                    } as RollOptions
                } else {
                    return {
                        dice: String(this.hitDice),
                        num: String(this.numHitDice),
                        mod: String(mod * this.level + value + this.modifiers.bonusHealth),
                        desc: "Max health"
                    } as RollOptions
                }
        }
    }

    // Metadata

    public get simple(): boolean {
        return this.metadata.simple ?? false;
    }

    // Details

    public get gender(): Gender {
        return this.metadata.gender ?? getOptionType("gender").default
    }
    public get genderText(): string {
        return  getOptionType("gender").options[this.gender]
    }

    public get age(): string {
        return this.metadata.age ?? ""
    }

    public get height(): string {
        return this.metadata.height ?? ""
    }

    public get weight(): string {
        return this.metadata.weight ?? ""
    }

    public get raceText(): string {
        return this.metadata.raceText ?? ""
    }

    public get occupation(): string {
        return this.metadata.occupation ?? ""
    }

    // Texts

    public get appearance(): string {
        return this.metadata.appearance ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }

    public get history(): string {
        return this.metadata.history ?? ""
    }

    public get notes(): string {
        return this.metadata.notes ?? ""
    }

    // Class

    public get class(): ObjectId {
        return this.metadata.class ?? null
    }
}

export default CharacterData