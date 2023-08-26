import CombinedModifierCollection from "./combinedModifierCollection";
import { ObjectId } from "types/database";
import { ArmorType, Attribute, Language, ProficiencyType, Skill, Tool, WeaponType } from "types/database/dnd"
import { FileType } from "types/database/files";
import { ICharacterStorage } from "types/database/files/character";
import { IModifier, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, SelectType, ModifierSetTypeProperty, ModifierType } from "types/database/files/modifier";
import { IModifierCollection, ChoiceData, EnumChoiceData, AnyFileChoiceData, FileChoiceData, ChoiceChoiceData, TextChoiceData } from "types/database/files/modifierCollection";

type AddRemoveGroup<T> = { add: T[], remove: T[] }

const ModifierMap = {
    [ProficiencyType.Armor]: "armor",
    [ProficiencyType.Weapon]: "weapon",
    [ProficiencyType.Tool]: "tool",
    [ProficiencyType.Language]: "language",
    [ProficiencyType.Skill]: "skill",
    [ProficiencyType.Save]: "save",
} satisfies Record<ProficiencyType, keyof IModifier>

const ModifierCollectionMap = {
    [ProficiencyType.Armor]: "armors",
    [ProficiencyType.Weapon]: "weapons",
    [ProficiencyType.Tool]: "tools",
    [ProficiencyType.Language]: "languages",
    [ProficiencyType.Skill]: "skills",
    [ProficiencyType.Save]: "saves",
} satisfies Record<ProficiencyType, keyof IModifier>

class ModifierCollection implements IModifierCollection {
    protected readonly modifiers: IModifier[]
    protected readonly storage: ICharacterStorage
    
    constructor(modifiers: IModifier[], storage: ICharacterStorage) {
        this.modifiers = modifiers.reduce<IModifier[]>((prev, mod) => {
            if (mod.type === ModifierType.Choice 
             && storage?.classData 
             && storage.classData[mod.id]) {
                let value = mod.choices.find(choice => choice.id === storage.classData[mod.id])
                return [...prev, mod, ...(value?.modifiers ?? [])]
            }
            return [...prev, mod]
        }, []);
        this.storage = storage;
    }

    public equals(other: IModifierCollection): boolean {
        if (other instanceof ModifierCollection) {
            return this.modifiers.length === other.modifiers.length 
                && this.modifiers.every(mod => other.modifiers.some(x => mod.id === x.id))
        }
        return false
    }

    public join(other: IModifierCollection): IModifierCollection {
        return other ? new CombinedModifierCollection(this, other, this.storage) : this;
    }

    public getChoices(): Record<string, ChoiceData> {
        return this.modifiers.reduce<Record<string, ChoiceData>>((prev, mod) => {
            if (mod.type === ModifierType.Choice) {
                return {  ...prev,  [mod.id]: { type: "choice", label: mod.label, options: mod.choices } satisfies ChoiceChoiceData}
            } else if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency 
                && mod.select === SelectType.Choice ) {
                return {  ...prev,  [mod.id]: { type: "enum", label: mod.label, enum: mod.proficiency,  options: mod[ModifierCollectionMap[mod.proficiency]] ?? [] } satisfies ChoiceData}
            } else if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Ability 
                && mod.select === SelectType.Choice
                && mod.allowAny) {
                return {  ...prev,  [mod.id]: { type: "file", label: mod.label, allowAny: true, options: [FileType.Ability] } satisfies AnyFileChoiceData}
            } else if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Spell 
                && mod.select === SelectType.Choice
                && mod.allowAny) {
                return {  ...prev,  [mod.id]: { type: "file", label: mod.label, allowAny: true, options: [FileType.Spell] } satisfies AnyFileChoiceData}
            } else if (mod.type === ModifierType.Add 
                && [ModifierAddRemoveTypeProperty.Ability, ModifierAddRemoveTypeProperty.Spell].includes(mod.addRemoveProperty)
                && mod.select === SelectType.Choice
                && !mod.allowAny) {
                return {  ...prev,  [mod.id]: { type: "file", label: mod.label, allowAny: false, options: mod.files } satisfies FileChoiceData}
            } else if (mod.type === ModifierType.Add 
                && [ModifierAddRemoveTypeProperty.Advantage, ModifierAddRemoveTypeProperty.Disadvantage, ModifierAddRemoveTypeProperty.CONImmunity, ModifierAddRemoveTypeProperty.DMGImmunity, ModifierAddRemoveTypeProperty.Resistance, ModifierAddRemoveTypeProperty.Vulnerability].includes(mod.addRemoveProperty)
                && mod.select === SelectType.Choice) {
                return {  ...prev,  [mod.id]: { type: "text", label: mod.label, text: mod.text, options: mod.texts } satisfies TextChoiceData}
            } else if (mod.type === ModifierType.Bonus 
                && mod.bonusProperty === ModifierBonusTypeProperty.Attribute 
                && mod.select === SelectType.Choice) {
                return {  ...prev,  [mod.id]: { type: "enum", label: mod.label, enum: "attr", options: mod.attributes } satisfies EnumChoiceData}
            }
            return prev
        }, {})
    }

    public get bonusAC(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty === ModifierBonusTypeProperty.AC 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusNumHealthDice(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty === ModifierBonusTypeProperty.NumHitDice 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusHealth(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type === ModifierType.Bonus && modifier.bonusProperty === ModifierBonusTypeProperty.Health 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusProficiency(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type === ModifierType.Bonus && modifier.bonusProperty === ModifierBonusTypeProperty.Proficiency 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusInitiative(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type === ModifierType.Bonus && modifier.bonusProperty === ModifierBonusTypeProperty.Initiative
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get critRange(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type === ModifierType.Set && modifier.setProperty === ModifierSetTypeProperty.CritRange && modifier.value !== null
                ? modifier.value 
                : prev
        , null)
    }

    public get spellAttribute(): Attribute {
        return this.modifiers.reduce<Attribute>((prev, modifier) => 
            modifier.type === ModifierType.Set && modifier.setProperty === ModifierSetTypeProperty.SpellAttribute && modifier.attribute !== null
                ? modifier.attribute 
                : prev
        , null)
    }

    public getAttributeBonus(attribute: Attribute): number {
        return this.modifiers.reduce<number>((prev, mod) => {
            if (mod.type === ModifierType.Bonus 
             && mod.bonusProperty === ModifierBonusTypeProperty.Attribute 
             && mod.select === SelectType.Value
             && mod.attribute === attribute) {
                return prev + mod.value
            } else if (mod.type === ModifierType.Bonus 
             && mod.bonusProperty === ModifierBonusTypeProperty.Attribute 
             && mod.select === SelectType.Choice
             && this.storage?.classData
             && this.storage.classData[mod.id] === attribute) {
                return prev + mod.value
            } else {
                return prev
            }
        }, 0)
    }

    private modifyCollection<T>(values: T[], key: string, onlyRemove: boolean, filter: (mod: IModifier) => boolean): T[] {
        let exclude: Set<T>
        if (onlyRemove) {
            let remove = this.modifiers.reduce<T[]>((prev, mod) => (
                mod.type === ModifierType.Remove && filter(mod) ? [...prev, mod[key] as T]  : prev
            ), [])
            exclude = new Set(remove);
        } else {
            let groups = this.modifiers.reduce<AddRemoveGroup<T>>((prev, mod) => {
                if (mod.type === ModifierType.Add 
                    && filter(mod)
                    && mod.select === SelectType.Value) {
                    return { ...prev, add: [...prev.add, mod[key] ]}
                } else if (mod.type === ModifierType.Add 
                    && filter(mod)
                    && mod.select === SelectType.Choice
                    && this.storage?.classData
                    && this.storage.classData[mod.id]) {
                        return { ...prev, add: [...prev.add, this.storage.classData[mod.id] ] }
                } else if (mod.type === ModifierType.Remove && filter(mod)) {
                    return { ...prev, remove: [...prev.remove, mod[key] as T]}
                }
                return prev
            }, { add: [], remove: [] })
            
            values = groups.add.reduce<T[]>((prev, armor) => (
                prev.includes(armor) ? prev : [...prev, armor]
            ), values)

            exclude = new Set(groups.remove);
        }
        return values.filter(x => !exclude.has(x))
    }

    public modifyProficienciesArmor(proficiencies: ArmorType[], onlyRemove: boolean = false): ArmorType[] {
        const type = ProficiencyType.Armor
        const key = ModifierMap[type];
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency && mod.proficiency === type
        return this.modifyCollection(proficiencies, key, onlyRemove, filter)
    }
    public modifyProficienciesWeapon(proficiencies: WeaponType[], onlyRemove: boolean = false): WeaponType[] {
        const type = ProficiencyType.Weapon
        const key = ModifierMap[type];
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency && mod.proficiency === type
        return this.modifyCollection(proficiencies, key, onlyRemove, filter)
    }
    public modifyProficienciesTool(proficiencies: Tool[], onlyRemove: boolean = false): Tool[] {
        const type = ProficiencyType.Tool
        const key = ModifierMap[type];
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency && mod.proficiency === type
        return this.modifyCollection(proficiencies, key, onlyRemove, filter)
    }
    public modifyProficienciesLanguage(proficiencies: Language[], onlyRemove: boolean = false): Language[] {
        const type = ProficiencyType.Language
        const key = ModifierMap[type];
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency && mod.proficiency === type
        return this.modifyCollection(proficiencies, key, onlyRemove, filter)
    }
    public modifyProficienciesSave(proficiencies: Attribute[], onlyRemove: boolean = false): Attribute[] {
        const type = ProficiencyType.Save
        const key = ModifierMap[type];
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency && mod.proficiency === type
        return this.modifyCollection(proficiencies, key, onlyRemove, filter)
    }
    public modifyProficienciesSkill(proficiencies: Skill[], onlyRemove: boolean = false): Skill[]{
        const type = ProficiencyType.Skill
        const key = ModifierMap[type];
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency && mod.proficiency === type
        return this.modifyCollection(proficiencies, key, onlyRemove, filter)
    }

    public modifyResistances(resistances: string[], onlyRemove: boolean = false): string[] {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Resistance
        return this.modifyCollection(resistances, "text", onlyRemove, filter)
    }
    public modifyVulnerabilities(vulnerabilities: string[], onlyRemove: boolean = false): string[] {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Vulnerability
        return this.modifyCollection(vulnerabilities, "text", onlyRemove, filter)
    }
    public modifyAdvantages(advantages: string[], onlyRemove: boolean = false): string[] {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Advantage
        return this.modifyCollection(advantages, "text", onlyRemove, filter)
    }
    public modifyDisadvantages(disadvantages: string[], onlyRemove: boolean = false): string[] {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Disadvantage
        return this.modifyCollection(disadvantages, "text", onlyRemove, filter)
    }
    public modifyDMGImmunities(immunities: string[], onlyRemove: boolean = false): string[] {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.DMGImmunity
        return this.modifyCollection(immunities, "text", onlyRemove, filter)
    }
    public modifyCONImmunities(immunities: string[], onlyRemove: boolean = false): string[] {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.CONImmunity
        return this.modifyCollection(immunities, "text", onlyRemove, filter)
    }

    public modifyAbilities(abilities: ObjectId[]): ObjectId[] {
        return this.modifiers.reduce<ObjectId[]>((prev, mod) => {
            if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Ability 
                && mod.select === SelectType.Value) {
                return [...prev, mod.file]
            } else if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Ability 
                && mod.select === SelectType.Choice
                && this.storage?.classData
                && this.storage.classData[mod.id]) {
                return [...prev, this.storage.classData[mod.id]]
            }
            return prev
        }, abilities)
    }
    public modifySpells(spells: ObjectId[]): ObjectId[] {
        return this.modifiers.reduce<ObjectId[]>((prev, mod) => {
            if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Spell 
                && mod.select === SelectType.Value) {
                return [...prev, mod.file]
            } else if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Spell 
                && mod.select === SelectType.Choice
                && this.storage?.classData
                && this.storage.classData[mod.id]) {
                return [...prev, this.storage.classData[mod.id]]
            }
            return prev
        }, spells)
    }
}

export default ModifierCollection