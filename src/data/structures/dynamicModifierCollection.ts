import CombinedModifierCollection from "./combinedModifierCollection";
import { ObjectId } from "types/database";
import { AdvantageBinding, ArmorClassBase, ArmorType, Attribute, Language, MovementType, ProficiencyLevel, ProficiencyType, Sense, Skill, Tool, WeaponType } from "types/database/dnd"
import { FileType } from "types/database/files";
import { ICharacterStorage } from "types/database/files/character";
import { CreatureValue } from "types/database/files/creature";
import { IModifier, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, SelectType, ModifierSetTypeProperty, ModifierType } from "types/database/files/modifier";
import { IModifierCollection, ChoiceData, EnumChoiceData, AnyFileChoiceData, FileChoiceData, ChoiceChoiceData, TextChoiceData } from "types/database/files/modifierCollection";
import { getMaxProficiencyLevel } from "utils/calculations";

type AddRemoveGroup<T> = { add: T, remove: T }

type ProficiencyRecord<T extends string> = Partial<Record<T, ProficiencyLevel>>
type AdvantageRecord = Partial<Record<AdvantageBinding, string[]>>

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

const splitAdvantagesExpr = / *[\.\;] */

class DynamicModifierCollection implements IModifierCollection {
    protected readonly modifiers: IModifier[]
    protected readonly storage: ICharacterStorage
    
    constructor(modifiers: IModifier[], storage: ICharacterStorage) {
        this.modifiers = modifiers.reduce<IModifier[]>((prev, mod) => {
            if (mod.type === ModifierType.Choice && storage?.classData?.[mod.id]) {
                let data: string[] =  storage.classData[mod.id]
                let value = mod.choices.find(choice => data.includes(choice.id))
                return [...prev, mod, ...value?.modifiers ?? []]
            }
            return [...prev, mod]
        }, []);
        this.storage = storage ?? {};
    }

    public equals(other: IModifierCollection): boolean {
        if (other instanceof DynamicModifierCollection) {
            return this.modifiers.length === other.modifiers.length 
                && this.modifiers.every(mod => other.modifiers.some(x => mod.id === x.id))
                && Object.keys(this.storage?.classData ?? {}).every(key => key in other.storage?.classData && this.storage.classData[key] === other.storage.classData[key])
        }
        return false
    }

    public join(other: IModifierCollection): IModifierCollection {
        if (this.length() > 0 && other && other.length() > 0) {
            return new CombinedModifierCollection(this, other, this.storage)
        }
        if (other && other.length() > 0) {
            return other
        }
        return this
    }

    public getChoices(): Record<string, ChoiceData> {
        return this.modifiers.reduce<Record<string, ChoiceData>>((prev, mod) => {
            if (mod.type === ModifierType.Choice) {
                return {  ...prev,  [mod.id]: { type: "choice", label: mod.label, options: mod.choices, num: mod.numChoices } satisfies ChoiceChoiceData}
            } else if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency 
                && mod.select === SelectType.Choice ) {
                return {  ...prev,  [mod.id]: { type: "enum", label: mod.label, enum: mod.proficiency,  options: mod[ModifierCollectionMap[mod.proficiency]] ?? [], num: mod.numChoices } satisfies ChoiceData}
            } else if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Ability 
                && mod.select === SelectType.Choice
                && mod.allowAny) {
                return {  ...prev,  [mod.id]: { type: "file", label: mod.label, allowAny: true, options: [FileType.Ability], num: mod.numChoices } satisfies AnyFileChoiceData}
            } else if (mod.type === ModifierType.Add 
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Spell 
                && mod.select === SelectType.Choice
                && mod.allowAny) {
                return {  ...prev,  [mod.id]: { type: "file", label: mod.label, allowAny: true, options: [FileType.Spell], num: mod.numChoices } satisfies AnyFileChoiceData}
            } else if (mod.type === ModifierType.Add 
                && [ModifierAddRemoveTypeProperty.Ability, ModifierAddRemoveTypeProperty.Spell].includes(mod.addRemoveProperty)
                && mod.select === SelectType.Choice
                && !mod.allowAny) {
                return {  ...prev,  [mod.id]: { type: "file", label: mod.label, allowAny: false, options: mod.files, num: mod.numChoices } satisfies FileChoiceData}
            } else if (mod.type === ModifierType.Add 
                && [ModifierAddRemoveTypeProperty.Advantage, ModifierAddRemoveTypeProperty.Disadvantage, ModifierAddRemoveTypeProperty.CONImmunity, ModifierAddRemoveTypeProperty.DMGImmunity, ModifierAddRemoveTypeProperty.Resistance, ModifierAddRemoveTypeProperty.Vulnerability].includes(mod.addRemoveProperty)
                && mod.select === SelectType.Choice) {
                return {  ...prev,  [mod.id]: { type: "text", label: mod.label, text: mod.text, options: mod.texts, num: mod.numChoices } satisfies TextChoiceData}
            } else if (mod.type === ModifierType.Bonus 
                && mod.bonusProperty === ModifierBonusTypeProperty.Attribute 
                && mod.select === SelectType.Choice) {
                return {  ...prev,  [mod.id]: { type: "enum", label: mod.label, enum: "attr", options: mod.attributes , num: mod.numChoices} satisfies EnumChoiceData}
            }
            return prev
        }, {})
    }

    public length(): number {
        return this.modifiers.length
    }

    public getBonus(type: ModifierBonusTypeProperty): number {
        return this.modifiers.reduce<number>((prev, mod) => (
            mod.type == ModifierType.Bonus && mod.bonusProperty === type
                ? prev + mod.value
                : prev
        ), 0)
    }

    public getMovementBonus(movement: MovementType): number {
        return this.modifiers.reduce<number>((prev, mod) => (
            mod.type == ModifierType.Bonus && mod.bonusProperty === ModifierBonusTypeProperty.Movement && mod.movement === movement 
                ? prev + mod.value
                : prev
        ), 0)
    }

    public getAttributeBonus(attribute: Attribute): number {
        return this.modifiers.reduce<number>((prev, mod) => {
            if (mod.type === ModifierType.Bonus 
             && mod.bonusProperty === ModifierBonusTypeProperty.Attribute 
             && mod.select === SelectType.Value) {
                return prev + mod.value
            } else if (mod.type === ModifierType.Bonus 
             && mod.bonusProperty === ModifierBonusTypeProperty.Attribute 
             && mod.select === SelectType.Choice) {
                let choices: Attribute[] = this.storage.classData?.[mod.id]
                if (typeof choices !== typeof []) {
                    choices = []
                }
                return choices.reduce((prev, value) => value === attribute ? prev + mod.value : prev, prev) ?? prev
            } else {
                return prev
            }
        }, 0)
    }

    public get critRange(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type === ModifierType.Set && modifier.setProperty === ModifierSetTypeProperty.CritRange && modifier.value !== null
                ? modifier.value 
                : prev
        , null)
    }

    public get maxDEXBonus(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type === ModifierType.Set && modifier.setProperty === ModifierSetTypeProperty.MaxDexBonus && modifier.value !== null
                ? (prev === null ? modifier.value : Math.min(prev, modifier.value)) 
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

    public get multiAttack(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type === ModifierType.Set && modifier.setProperty === ModifierSetTypeProperty.MultiAttack
                ? (prev === null ? modifier.value : Math.max(prev, modifier.value))
                : prev
        , null)
    }

    public getSenseRange(sense: Sense): number {
        return this.modifiers.reduce<number>((prev, modifier) => (
            modifier.type === ModifierType.Set && modifier.setProperty === ModifierSetTypeProperty.Sense && modifier.sense === sense
                ? Math.max(modifier.value, prev)
                : prev
        ), 0)
    }

    public getACBase(values: Record<Attribute, number>): number {
        return this.modifiers.reduce<number>((prev, modifier) => {
            if (modifier.type === ModifierType.Set && modifier.setProperty === ModifierSetTypeProperty.ACBase) {
                switch (modifier.acBase) {
                    case ArmorClassBase.DEX:
                        return Math.max(10 + values[Attribute.DEX], prev)
                    case ArmorClassBase.DEXAndAttribute:
                        return Math.max(10 + values[Attribute.DEX] + values[modifier.attribute], prev)
                    case ArmorClassBase.DEXAndFixed:
                        return Math.max(10 + values[Attribute.DEX] + modifier.value, prev)
                    default: return prev;
                }
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
            let groups = this.modifiers.reduce<AddRemoveGroup<T[]>>((prev, mod) => {
                if (mod.type === ModifierType.Add 
                    && filter(mod)
                    && mod.select === SelectType.Value) {
                    return { ...prev, add: [...prev.add, mod[key] ]}
                } else if (mod.type === ModifierType.Add 
                    && filter(mod)
                    && mod.select === SelectType.Choice
                    && this.storage.classData?.[mod.id]) {
                        return { ...prev, add: [...prev.add, ...this.storage.classData[mod.id] ] }
                } else if (mod.type === ModifierType.Remove && filter(mod)) {
                    return { ...prev, remove: [...prev.remove, mod[key] as T]}
                }
                return prev
            }, { add: [], remove: [] })
            
            values = groups.add.reduce<T[]>((prev, value) => (
                prev.includes(value) ? prev : [...prev, value]
            ), values)

            exclude = new Set(groups.remove);
        }
        return values.filter(x => !exclude.has(x))
    }

    private modifyProficiencyRecord<T extends string>(values: ProficiencyRecord<T>, key: string, onlyRemove: boolean, filter: (mod: IModifier) => boolean): ProficiencyRecord<T> {
        let exclude: ProficiencyRecord<T>
        if (onlyRemove) {
            exclude = this.modifiers.reduce((prev, mod) => (
                mod.type === ModifierType.Remove && filter(mod) 
                    ? {...prev, [mod[key]]: getMaxProficiencyLevel(mod.proficiencyLevel, prev[mod[key]]) }  
                    : prev
            ), {})
        } else {
            let groups = this.modifiers.reduce<AddRemoveGroup<ProficiencyRecord<T>>>((prev, mod) => {
                if (mod.type === ModifierType.Add 
                    && filter(mod)
                    && mod.select === SelectType.Value) {
                    return { ...prev, add: {...prev.add, [mod[key]]: getMaxProficiencyLevel(mod.proficiencyLevel, prev.add[mod[key]]) }}
                } else if (mod.type === ModifierType.Add 
                    && filter(mod)
                    && mod.select === SelectType.Choice
                    && this.storage.classData?.[mod.id]) {
                    let add = {...prev.add }
                    for (let proficiency of this.storage.classData[mod.id] as ProficiencyType[]) {
                        add[proficiency] = getMaxProficiencyLevel(mod.proficiencyLevel, add[proficiency])
                    }
                    return { ...prev, add: add }
                } else if (mod.type === ModifierType.Remove && filter(mod)) {
                    return { ...prev, remove: {...prev.remove, [mod[key]]: getMaxProficiencyLevel(mod.proficiencyLevel, prev.remove[mod[key]]) }}
                }
                return prev
            }, { add: values, remove: {} })

            exclude = groups.remove
            values = groups.add
        }
        
        return Object.keys(values).reduce<ProficiencyRecord<T>>((prev, proficiency) => (
            getMaxProficiencyLevel(values[proficiency], exclude[proficiency]) === exclude[proficiency] 
                ? prev
                : { ...prev, [proficiency]: values[proficiency] }
        ), {})
    }

    private modifyAdvantageRecord(values: AdvantageRecord, onlyRemove: boolean, filter: (mod: IModifier) => boolean): AdvantageRecord {
        let exclude: AdvantageRecord
        if (onlyRemove) {
            exclude = this.modifiers.reduce((prev, mod) => (
                mod.type === ModifierType.Remove && filter(mod) 
                    ? { ...prev, remove: {...prev, [mod.binding]: [...prev[mod.binding] ?? [], ...mod.text.split(splitAdvantagesExpr)] }}  
                    : prev
            ), {})
        } else {
            let groups = this.modifiers.reduce<AddRemoveGroup<AdvantageRecord>>((prev, mod) => {
                if (mod.type === ModifierType.Add 
                    && filter(mod)
                    && mod.select === SelectType.Value) {
                    return { ...prev, add: {...prev.add, [mod.binding]: [...prev.add[mod.binding] ?? [], ...mod.text.split(splitAdvantagesExpr)] }}
                } else if (mod.type === ModifierType.Add 
                    && filter(mod)
                    && mod.select === SelectType.Choice
                    && this.storage.classData?.[mod.id]) {
                    return { ...prev, add: {...prev.add, [mod.binding]: [...prev.add[mod.binding] ?? [], ...this.storage.classData[mod.id] ?? []] }}
                } else if (mod.type === ModifierType.Remove && filter(mod)) {
                    return { ...prev, remove: {...prev.remove, [mod.binding]: [...prev.remove[mod.binding] ?? [], ...mod.text.split(splitAdvantagesExpr)] }}
                }
                return prev
            }, { add: values, remove: {} })

            exclude = groups.remove
            values = groups.add
        }
        
        return Object.keys(values).reduce<AdvantageRecord>((prev, binding: AdvantageBinding) => (
            { ...prev, [binding]: values[binding].filter(x => !exclude[binding]?.includes(x)) }
        ), {})
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
    public modifyProficienciesTool(proficiencies: Partial<Record<Tool, ProficiencyLevel>>, onlyRemove: boolean = false): Partial<Record<Tool, ProficiencyLevel>> {
        const type = ProficiencyType.Tool
        const key = ModifierMap[type];
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency && mod.proficiency === type
        return this.modifyProficiencyRecord(proficiencies, key, onlyRemove, filter)
    }
    public modifyProficienciesSkill(proficiencies: Partial<Record<Skill, ProficiencyLevel>>, onlyRemove: boolean = false): Partial<Record<Skill, ProficiencyLevel>> {
        const type = ProficiencyType.Skill
        const key = ModifierMap[type];
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency && mod.proficiency === type
        return this.modifyProficiencyRecord(proficiencies, key, onlyRemove, filter)
    }

    public modifyResistances(resistances: string[], onlyRemove: boolean = false): string[] {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Resistance
        return this.modifyCollection(resistances, "text", onlyRemove, filter)
    }
    public modifyVulnerabilities(vulnerabilities: string[], onlyRemove: boolean = false): string[] {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Vulnerability
        return this.modifyCollection(vulnerabilities, "text", onlyRemove, filter)
    }
    public modifyAdvantages(advantages: Partial<Record<AdvantageBinding, string>>, onlyRemove: boolean = false): Partial<Record<AdvantageBinding, string>> {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Advantage
        const value = Object.keys(advantages).reduce<AdvantageRecord>((prev, key: AdvantageBinding) => (
            { ...prev, [key]: advantages[key]?.split(splitAdvantagesExpr) ?? [] }
        ), {})
        const result = this.modifyAdvantageRecord(value, onlyRemove, filter)
        return Object.keys(result).reduce<Partial<Record<AdvantageBinding, string>>>((prev, key: AdvantageBinding) => (
            { ...prev, [key]: result[key].join('; ') }
        ), {})
    }
    public modifyDisadvantages(disadvantages: Partial<Record<AdvantageBinding, string>>, onlyRemove: boolean = false): Partial<Record<AdvantageBinding, string>> {
        const filter = (mod: IModifier) => mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Disadvantage
        const value = Object.keys(disadvantages).reduce<AdvantageRecord>((prev, key: AdvantageBinding) => (
            { ...prev, [key]: disadvantages[key]?.split(splitAdvantagesExpr) ?? [] }
        ), {})
        const result = this.modifyAdvantageRecord(value, onlyRemove, filter)
        return Object.keys(result).reduce<Partial<Record<AdvantageBinding, string>>>((prev, key: AdvantageBinding) => (
            { ...prev, [key]: result[key].join('; ') }
        ), {})
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
                && this.storage.classData?.[mod.id]) {
                return [...prev, ...this.storage.classData[mod.id]]
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
                && this.storage.classData?.[mod.id]) {
                return [...prev, ...this.storage.classData[mod.id]]
            }
            return prev
        }, spells)
    }
}

export default DynamicModifierCollection