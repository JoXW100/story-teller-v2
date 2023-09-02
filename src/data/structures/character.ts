import Dice from "utils/data/dice";
import CreatureData from "./creature";
import ClassData from "./class";
import { getOptionType } from "data/optionData";
import { RollOptions } from "data/elements/roll";
import { asEnum } from "utils/helpers";
import { Attribute, DiceType, Gender, OptionalAttribute } from "types/database/dnd";
import { CalculationMode } from "types/database/editor";
import { ICharacterMetadata, ICharacterStorage } from "types/database/files/character";
import { IModifierCollection } from "types/database/files/modifierCollection";
import { ObjectId, ObjectIdText } from "types/database";
import ModifierCollection from "./modifierCollection";
import { RollType } from "types/dice";

class CharacterData extends CreatureData<ICharacterMetadata> implements Required<ICharacterMetadata> {
    private readonly storage: ICharacterStorage
    private readonly characterClass: ClassData
    private readonly characterSubClass: ClassData
    
    public constructor(metadata: ICharacterMetadata, storage: ICharacterStorage, modifiers?: IModifierCollection, characterClass?: ClassData, characterSubclass?: ClassData) {
        let mods: IModifierCollection = new ModifierCollection([], storage)
        if (characterClass) {
            mods = mods.join(characterClass.getModifiers(metadata?.level ?? 0, characterSubclass))
        }
        super(metadata, mods.join(modifiers))
        this.storage = storage ?? {}
        this.characterClass = characterClass ?? new ClassData()
        this.characterSubClass = characterSubclass ?? new ClassData()
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
                    type: RollType.Health,
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
                        type: RollType.Health,
                        desc: "Max health"
                    } as RollOptions
                } else {
                    return {
                        dice: String(this.hitDice),
                        num: String(this.numHitDice),
                        mod: String(mod * this.level + value + this.modifiers.bonusHealth),
                        type: RollType.Health,
                        desc: "Max health"
                    } as RollOptions
                }
        }
    }

    public override get spells(): ObjectIdText[] {
        let spells = this.metadata.spells ?? []
        if ((this.characterClass.spellAttribute !== OptionalAttribute.None && this.characterClass.preparationAll )
         || (this.characterSubClass.spellAttribute !== OptionalAttribute.None && this.characterSubClass.preparationAll)) {
            spells = [...spells, ...this.storage.cantrips ?? [], ...this.storage.learnedSpells ?? []]
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None || this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            spells = [...spells, ...this.storage.cantrips ?? [], ...this.storage.preparedSpells ?? []]
        }
        return this.modifiers.modifySpells(spells)
    }

    public override get spellAttribute(): OptionalAttribute {
        let attribute = asEnum(this.modifiers.spellAttribute, OptionalAttribute)
        if (attribute) {
            return attribute
        } else if (this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterSubClass.spellAttribute
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterClass.spellAttribute
        } else {
            return this.metadata.spellAttribute ?? getOptionType("optionalAttr").default
        }
    }

    public override get spellSlots(): number[] {
        if (this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterSubClass.spellSlots[this.level - 1] ?? []
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterClass.spellSlots[this.level - 1] ?? []
        } else {
            return this.metadata.spellSlots ?? []
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

    public get classFile(): ObjectId {
        return this.metadata.classFile ?? null
    }

    public get className(): string {
        if (this.characterClass.subclassLevel <= this.level && this.characterSubClass.isSubclass) {
            return `${this.characterClass.name} - ${this.characterSubClass.name}`
        }
        return this.characterClass.name
    }

    // Spells
    
    public get preparationSlots(): number {
        if (this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            let mod = this.getAttributeModifier(this.characterSubClass.preparationSlotsScaling)
            return (this.characterSubClass.preparationSlots[this.level - 1] ?? 0) + mod
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None) {
            let mod = this.getAttributeModifier(this.characterClass.preparationSlotsScaling)
            return (this.characterClass.preparationSlots[this.level - 1] ?? 0) + mod
        } else {
            return 0
        }
    }
    
    public get preparationAll(): boolean {
        if (this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterSubClass.preparationAll
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterClass.preparationAll
        } else {
            return false
        }
    }
    
    public get cantripSlots(): number {
        if (this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterSubClass.cantripSlots[this.level - 1] ?? 0
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterClass.cantripSlots[this.level - 1] ?? 0
        } else {
            return 0
        }
    }
    
    public get learnedSlots(): number {
        if (this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterSubClass.learnedSlots[this.level - 1] ?? 0
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterClass.learnedSlots[this.level - 1] ?? 0
        } else {
            return 0
        }
    }

    public get learnedAll(): boolean {
        if (this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterSubClass.learnedAll
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterClass.learnedAll
        } else {
            return false
        }
    }

    public get maxSpellLevel(): number {
        return this.spellSlots.length
    }

    public get canRitualCast(): boolean {
        if (this.characterSubClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterSubClass.canRitualCast
        } else if (this.characterClass.spellAttribute !== OptionalAttribute.None) {
            return this.characterClass.canRitualCast
        } else {
            return false
        }
    }
}

export default CharacterData