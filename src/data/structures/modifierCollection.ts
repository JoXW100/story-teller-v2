import CombinedModifierCollection from "./combinedModifierCollection";
import { ObjectId } from "types/database";
import { AdvantageBinding, ArmorClassBase, ArmorType, Attribute, Language, MovementType, ProficiencyLevel, ProficiencyType, Sense, Skill, Tool, WeaponType } from "types/database/dnd"
import { FileType } from "types/database/files";
import { ICharacterStorage } from "types/database/files/character";
import { IModifier, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, SelectType, ModifierSetTypeProperty, ModifierType } from "types/database/files/modifier";
import { IModifierCollection, ChoiceData, EnumChoiceData, AnyFileChoiceData, FileChoiceData, ChoiceChoiceData, TextChoiceData } from "types/database/files/modifierCollection";
import { getMaxProficiencyLevel } from "utils/calculations";

const splitAdvantagesExpr = / *[\.\;] */

interface ModifierResultData {
    bonuses?: Partial<Record<ModifierBonusTypeProperty, number>>
    movementBonuses?: Partial<Record<MovementType, number>>
    attributeBonuses?: Partial<Record<Attribute, number>>

    abilities?: ObjectId[]
    spells?: ObjectId[]
    proficienciesArmor?: ArmorType[]
    proficienciesLanguage?: Language[]
    proficienciesSave?: Attribute[]
    proficienciesSkill?: Partial<Record<Skill, ProficiencyLevel>>
    proficienciesTool?: Partial<Record<Tool, ProficiencyLevel>>
    proficienciesWeapon?: WeaponType[]

    advantages?: Partial<Record<AdvantageBinding, string[]>>
    disadvantages?: Partial<Record<AdvantageBinding, string[]>>

    resistances?: string[]
    vulnerabilities?: string[]
    dmgImmunities?: string[]
    conImmunities?: string[]

    critRange?: number
    senses?: Partial<Record<Sense, number>>
    acBase?: {
        type: ArmorClassBase
        value?: number
        attribute?: Attribute
    }[]
    maxDEXBonus?: number
    spellAttribute?: Attribute
    multiAttack?: number

    choices?: Record<string, ChoiceData>
}

class ModifierCollection implements IModifierCollection {
    protected readonly modifiers: IModifier[]
    protected readonly storage: ICharacterStorage
    protected readonly addData: ModifierResultData
    protected readonly removeData: ModifierResultData

    constructor(modifiers: IModifier[], storage: ICharacterStorage) {
        this.modifiers = modifiers.reduce<IModifier[]>((prev, mod) => {
            if (mod.type === ModifierType.Choice && storage?.classData?.[mod.id]) {
                let data: string[] =  storage.classData[mod.id]
                let value = mod.choices.find(choice => data.includes(choice.id))
                return [...prev, mod, ...value?.modifiers ?? []]
            }
            return [...prev, mod]
        }, []);

        this.storage = storage ?? {}
        this.addData = {}
        this.removeData = {}

        for (const modifier of this.modifiers) {
            switch (modifier.type) {
                case ModifierType.Add:
                    this.applyAddRemoveModifier(this.addData, modifier);
                    break;
                case ModifierType.Remove:
                    this.applyAddRemoveModifier(this.removeData, modifier);
                    break;
                case ModifierType.Bonus:
                    this.applyBonusModifier(this.addData, modifier);
                    break;
                case ModifierType.Set:
                    this.applySetModifier(this.addData, modifier)
                    break;
                case ModifierType.Choice:
                    this.applyChoiceModifier(this.addData, modifier)
                    break;
                default: break;
            }
        }
    }

    public equals(other: IModifierCollection): boolean {
        if (other instanceof ModifierCollection) {
            return this.modifiers.length === other.modifiers.length
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

    public length(): number {
        return this.modifiers.length
    }

    private applyAddRemoveModifier(result: ModifierResultData, mod: IModifier): void {
        switch (mod.addRemoveProperty) {
            case ModifierAddRemoveTypeProperty.Ability:
                if (mod.select === SelectType.Value) {
                    result.abilities = [...result.abilities ?? [], mod.file]
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        result.abilities = [...result.abilities ?? [], ...this.storage.classData[mod.id] ]
                    }
                    if (mod.allowAny) {
                        result.choices = {...result.choices, [mod.id]: { type: "file", label: mod.label, allowAny: true, options: [FileType.Ability], num: mod.numChoices } satisfies AnyFileChoiceData }
                    } else {
                        result.choices = {...result.choices, [mod.id]: { type: "file", label: mod.label, allowAny: false, options: mod.files, num: mod.numChoices } satisfies FileChoiceData }
                    }
                }
                break;
            case ModifierAddRemoveTypeProperty.Spell:
                if (mod.select === SelectType.Value) {
                    result.spells = [...result.spells ?? [], mod.file]
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        result.spells = [...result.spells ?? [], ...this.storage.classData[mod.id]]
                    }
                    if (mod.allowAny) {
                        result.choices = {...result.choices, [mod.id]: { type: "file", label: mod.label, allowAny: true, options: [FileType.Spell], num: mod.numChoices } satisfies AnyFileChoiceData }
                    } else {
                        result.choices = {...result.choices, [mod.id]: { type: "file", label: mod.label, allowAny: false, options: mod.files, num: mod.numChoices } satisfies FileChoiceData }
                    }
                }
                break;
            case ModifierAddRemoveTypeProperty.Proficiency:
                switch (mod.proficiency) {
                    case ProficiencyType.Armor:
                        if (mod.select === SelectType.Value) {
                            result.proficienciesArmor = [...result.proficienciesArmor ?? [], mod.armor]
                        } else {
                            if (Array.isArray(this.storage.classData?.[mod.id])) {
                                result.proficienciesArmor = [...result.proficienciesArmor ?? [], ...this.storage.classData[mod.id]]
                            }
                            result.choices = {...result.choices, [mod.id]: { type: "enum", label: mod.label, enum: mod.proficiency, options: mod.armors ?? [], num: mod.numChoices } satisfies ChoiceData }
                        }
                        break;
                    case ProficiencyType.Language:
                        if (mod.select === SelectType.Value) {
                            result.proficienciesLanguage = [...result.proficienciesLanguage ?? [], mod.language]
                        } else {
                            if (Array.isArray(this.storage.classData?.[mod.id])) {
                                result.proficienciesLanguage = [...result.proficienciesLanguage ?? [], ...this.storage.classData[mod.id]]
                            }
                            result.choices = {...result.choices, [mod.id]: { type: "enum", label: mod.label, enum: mod.proficiency, options: mod.languages ?? [], num: mod.numChoices } satisfies ChoiceData }
                        }
                        break;
                    case ProficiencyType.Save:
                        if (mod.select === SelectType.Value) {
                            result.proficienciesSave = [...result.proficienciesSave ?? [], mod.save]
                        } else {
                            if (Array.isArray(this.storage.classData?.[mod.id])) {
                                result.proficienciesSave = [...result.proficienciesSave ?? [], ...this.storage.classData[mod.id]]
                            }
                            result.choices = {...result.choices, [mod.id]: { type: "enum", label: mod.label, enum: mod.proficiency, options: mod.saves ?? [], num: mod.numChoices } satisfies ChoiceData }
                        }
                        break;
                    case ProficiencyType.Skill:
                        if (mod.select === SelectType.Value) {
                            result.proficienciesSkill = { ...result.proficienciesSkill, [mod.skill]: getMaxProficiencyLevel(mod.proficiencyLevel, result.proficienciesSkill?.[mod.skill]) }
                        } else {
                            if (Array.isArray(this.storage.classData?.[mod.id])) {
                                for (const skill of this.storage.classData[mod.id] as Skill[]) {
                                    result.proficienciesSkill = { ...result.proficienciesSkill, [skill]: getMaxProficiencyLevel(mod.proficiencyLevel, result.proficienciesSkill?.[mod.skill]) }
                                }
                            }
                            result.choices = {...result.choices, [mod.id]: { type: "enum", label: mod.label, enum: mod.proficiency, options: mod.skills ?? [], num: mod.numChoices } satisfies ChoiceData }
                        }
                        break;
                    case ProficiencyType.Tool:
                        if (mod.select === SelectType.Value) {
                            result.proficienciesTool = { ...result.proficienciesTool, [mod.tool]: getMaxProficiencyLevel(mod.proficiencyLevel, result.proficienciesTool?.[mod.tool]) }
                        } else {
                            if (Array.isArray(this.storage.classData?.[mod.id])) {
                                for (const tool of this.storage.classData[mod.id] as Tool[]) {
                                    result.proficienciesTool = {...result.proficienciesTool, [tool]: getMaxProficiencyLevel(mod.proficiencyLevel, result.proficienciesTool?.[mod.tool])}
                                }
                            }
                            result.choices = {...result.choices, [mod.id]: { type: "enum", label: mod.label, enum: mod.proficiency, options: mod.tools ?? [], num: mod.numChoices } satisfies ChoiceData }
                        }
                        break;
                    case ProficiencyType.Weapon:
                        if (mod.select === SelectType.Value) {
                            result.proficienciesWeapon = [...result.proficienciesWeapon ?? [], mod.weapon]
                        } else {
                            if (Array.isArray(this.storage.classData?.[mod.id])) {
                                result.proficienciesWeapon = [...result.proficienciesWeapon ?? [], ...this.storage.classData[mod.id]]
                            }
                            result.choices = {...result.choices, [mod.id]: { type: "enum", label: mod.label, enum: mod.proficiency, options: mod.weapons ?? [], num: mod.numChoices } satisfies ChoiceData }
                        }
                        break;
                    default: break;
                }
                break;
            case ModifierAddRemoveTypeProperty.Advantage:
                if (mod.select === SelectType.Value) {
                    result.advantages = { ...result.advantages, [mod.binding]: [...result.advantages?.[mod.binding] ?? [], mod.text] }
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        result.advantages = { ...result.advantages, [mod.binding]: [...result.advantages?.[mod.binding] ?? [], ...this.storage.classData[mod.id]] }
                    }
                    result.choices = {...result.choices, [mod.id]: { type: "text", label: mod.label, text: mod.text, options: mod.texts, num: mod.numChoices } satisfies TextChoiceData }
                }
                break
            case ModifierAddRemoveTypeProperty.Disadvantage:
                if (mod.select === SelectType.Value) {
                    result.disadvantages = { ...result.disadvantages, [mod.binding]: [...result.disadvantages?.[mod.binding] ?? [], mod.text] }
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        result.disadvantages = { ...result.disadvantages, [mod.binding]: [...result.disadvantages?.[mod.binding] ?? [], ...this.storage.classData[mod.id]] }
                    }
                    result.choices = {...result.choices, [mod.id]: { type: "text", label: mod.label, text: mod.text, options: mod.texts, num: mod.numChoices } satisfies TextChoiceData }
                }
                break
            case ModifierAddRemoveTypeProperty.CONImmunity:
                if (mod.select === SelectType.Value) {
                    result.conImmunities = [...result.conImmunities ?? [], mod.text]
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        result.conImmunities = [...result.conImmunities ?? [], ...this.storage.classData[mod.id]]
                    }
                    result.choices = {...result.choices, [mod.id]: { type: "text", label: mod.label, text: mod.text, options: mod.texts, num: mod.numChoices } satisfies TextChoiceData }
                }
                break
            case ModifierAddRemoveTypeProperty.DMGImmunity:
                if (mod.select === SelectType.Value) {
                    result.dmgImmunities = [...result.dmgImmunities ?? [], mod.text]
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        result.dmgImmunities = [...result.dmgImmunities ?? [], ...this.storage.classData[mod.id]]
                    }
                    result.choices = {...result.choices, [mod.id]: { type: "text", label: mod.label, text: mod.text, options: mod.texts, num: mod.numChoices } satisfies TextChoiceData }
                }
                break
            case ModifierAddRemoveTypeProperty.Resistance:
                if (mod.select === SelectType.Value) {
                    result.resistances = [...result.resistances ?? [], mod.text]
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        result.resistances = [...result.resistances ?? [], ...this.storage.classData[mod.id]]
                    }
                    result.choices = {...result.choices, [mod.id]: { type: "text", label: mod.label, text: mod.text, options: mod.texts, num: mod.numChoices } satisfies TextChoiceData }
                }
                break
            case ModifierAddRemoveTypeProperty.Vulnerability:
                if (mod.select === SelectType.Value) {
                    result.resistances = { ...result.resistances, [mod.binding]: [...result.resistances?.[mod.binding] ?? [], mod.text] }
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        result.resistances = { ...result.resistances, [mod.binding]: [...result.resistances?.[mod.binding] ?? [], ...this.storage.classData[mod.id]] }
                    }
                    result.choices = {...result.choices, [mod.id]: { type: "text", label: mod.label, text: mod.text, options: mod.texts, num: mod.numChoices } satisfies TextChoiceData }
                }
                break
            default: break;
        }
    }

    private applyBonusModifier(result: ModifierResultData, mod: IModifier): void {
        switch (mod.bonusProperty) {
            case ModifierBonusTypeProperty.Attribute:
                if (mod.select === SelectType.Value) {
                    result.attributeBonuses = { ...result.attributeBonuses, [mod.attribute]: (result.attributeBonuses?.[mod.attribute] ?? 0) + mod.value }
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        for (let attr of this.storage.classData[mod.id] as Attribute[]) {
                            result.attributeBonuses = { ...result.attributeBonuses, [attr]: (result.attributeBonuses?.[attr] ?? 0) + mod.value }
                        }
                    }
                    result.choices = {...result.choices, [mod.id]: { type: "enum", label: mod.label, enum: "attr", options: mod.attributes , num: mod.numChoices} satisfies EnumChoiceData }
                }
                break;
            case ModifierBonusTypeProperty.Movement:
                if (mod.select === SelectType.Value) {
                    result.movementBonuses = { ...result.movementBonuses, [mod.movement]: (result.movementBonuses?.[mod.movement] ?? 0) + mod.value }
                } else {
                    if (Array.isArray(this.storage.classData?.[mod.id])) {
                        for (let movement of this.storage.classData[mod.id] as MovementType[]) {
                            result.movementBonuses = { ...result.movementBonuses, [movement]: (result.movementBonuses?.[movement] ?? 0) + mod.value }
                        }
                    }
                    result.choices = {...result.choices, [mod.id]: { type: "enum", label: mod.label, enum: "movement", options: mod.attributes , num: mod.numChoices} satisfies EnumChoiceData }
                }
                break;
            default:
                result.bonuses = { ...result.bonuses, [mod.bonusProperty]: (result.bonuses?.[mod.bonusProperty] ?? 0) + mod.value }
                break;
        }
    }

    private applySetModifier(result: ModifierResultData, mod: IModifier): void {
        switch (mod.setProperty) {
            case ModifierSetTypeProperty.CritRange:
                result.critRange = mod.value
                break;
            case ModifierSetTypeProperty.MaxDexBonus:
                result.maxDEXBonus = mod.value
                break;
            case ModifierSetTypeProperty.MultiAttack:
                result.multiAttack = mod.value
                break;
            case ModifierSetTypeProperty.Sense:
                result.senses = { ...result.senses, [mod.sense]: mod.value }
                break;
            case ModifierSetTypeProperty.SpellAttribute:
                result.spellAttribute = mod.attribute
                break;
            case ModifierSetTypeProperty.ACBase:
                result.acBase = [...result.acBase ?? [], { type: mod.acBase, attribute: mod.attribute, value: mod.value }]
            default: break;
        }
    }

    private applyChoiceModifier(result: ModifierResultData, mod: IModifier): void {
        result.choices = { ...result.choices, [mod.id]: { type: "choice", label: mod.label, options: mod.choices, num: mod.numChoices } as ChoiceChoiceData }
    }

    public getChoices(): Record<string, ChoiceData> {
        return this.addData.choices ?? {}
    }

    public getBonus(type: ModifierBonusTypeProperty): number {
        return this.addData.bonuses?.[type] ?? 0
    }
    public getMovementBonus(type: MovementType): number {
        return this.addData.movementBonuses?.[type] ?? 0
    }
    public getAttributeBonus(type: Attribute): number {
        return this.addData.attributeBonuses?.[type] ?? 0
    }

    public get critRange(): number {
        return this.addData.critRange ?? null
    }
    public get maxDEXBonus(): number {
        return this.addData.maxDEXBonus ?? null
    }
    public get spellAttribute(): Attribute {
        return this.addData.spellAttribute ?? null
    }
    public get multiAttack(): number {
        return this.addData.multiAttack ?? null
    }
    public getSenseRange(sense: Sense): number {
        return this.addData.senses?.[sense] ?? 0
    }
    public getACBase(values: Record<Attribute, number>): number {
        return this.addData.acBase?.reduce((prev, base) => {
            switch (base.type) {
                case ArmorClassBase.DEX:
                    return Math.max(10 + values[Attribute.DEX], prev)
                case ArmorClassBase.DEXAndAttribute:
                    return Math.max(10 + values[Attribute.DEX] + values[base.attribute], prev)
                case ArmorClassBase.DEXAndFixed:
                    return Math.max(10 + values[Attribute.DEX] + base.value, prev)
                default: return prev;
            } 
        }, 0) ?? 0
    }

    public modifyProficienciesArmor(proficiencies: ArmorType[], onlyRemove: boolean = false): ArmorType[] {
        let existing = new Set<ArmorType>(this.removeData.proficienciesArmor)
        if (onlyRemove) {
            return proficiencies.filter((x) => !existing.has(x))
        } else {
            return [...proficiencies ?? [], ...this.addData.proficienciesArmor ?? []].reduce<ArmorType[]>((prev, value) => {
                if (existing.has(value)) {
                    return prev
                } else {
                    existing.add(value)
                    return [...prev, value]
                }
            }, [])
        }
    }
    public modifyProficienciesWeapon(proficiencies: WeaponType[], onlyRemove: boolean = false): WeaponType[] {
        let existing = new Set<WeaponType>(this.removeData.proficienciesWeapon)
        if (onlyRemove) {
            return proficiencies.filter((x) => !existing.has(x))
        } else {
            return [...proficiencies ?? [], ...this.addData.proficienciesWeapon ?? []].reduce<WeaponType[]>((prev, value) => {
                if (existing.has(value)) {
                    return prev
                } else {
                    existing.add(value)
                    return [...prev, value]
                }
            }, [])
        }
    }
    public modifyProficienciesLanguage(proficiencies: Language[], onlyRemove: boolean = false): Language[] {
        let existing = new Set<Language>(this.removeData.proficienciesLanguage)
        if (onlyRemove) {
            return proficiencies.filter((x) => !existing.has(x))
        } else {
            return [...proficiencies ?? [], ...this.addData.proficienciesLanguage ?? []].reduce<Language[]>((prev, value) => {
                if (existing.has(value)) {
                    return prev
                } else {
                    existing.add(value)
                    return [...prev, value]
                }
            }, [])
        }
    }
    public modifyProficienciesSave(proficiencies: Attribute[], onlyRemove: boolean = false): Attribute[] {
        let existing = new Set<Attribute>(this.removeData.proficienciesSave)
        if (onlyRemove) {
            return proficiencies.filter((x) => !existing.has(x))
        } else {
            return [...proficiencies ?? [], ...this.addData.proficienciesSave ?? []].reduce<Attribute[]>((prev, value) => {
                if (existing.has(value)) {
                    return prev
                } else {
                    existing.add(value)
                    return [...prev, value]
                }
            }, [])
        }
    }

    public modifyProficienciesTool(proficiencies: Partial<Record<Tool, ProficiencyLevel>>, onlyRemove: boolean = false): Partial<Record<Tool, ProficiencyLevel>> {
        let result: Partial<Record<Tool, ProficiencyLevel>> = {}
        if (onlyRemove) {
            for (const tool in proficiencies) {
                let max = getMaxProficiencyLevel(proficiencies[tool], this.removeData.proficienciesTool?.[tool])
                if (max !== this.removeData.proficienciesTool?.[tool]) {
                    result[tool] = proficiencies[tool]
                }
            }
        } else {
            for (const tool of Object.values(Tool)) {
                let max = getMaxProficiencyLevel(proficiencies[tool], this.addData.proficienciesTool?.[tool], this.removeData.proficienciesTool?.[tool])
                if (max && max !== this.removeData.proficienciesTool?.[tool]) {
                    result[tool] = max
                }
            }
        }
        return result
    }
    public modifyProficienciesSkill(proficiencies: Partial<Record<Skill, ProficiencyLevel>>, onlyRemove: boolean = false): Partial<Record<Skill, ProficiencyLevel>> {
        let result: Partial<Record<Skill, ProficiencyLevel>> = {}
        if (onlyRemove) {
            for (const skill in proficiencies) {
                let max = getMaxProficiencyLevel(proficiencies[skill], this.removeData.proficienciesSkill?.[skill])
                if (max !== this.removeData.proficienciesSkill?.[skill]) {
                    result[skill] = proficiencies[skill]
                }
            }
        } else {
            for (const skill of Object.values(Skill)) {
                let max = getMaxProficiencyLevel(proficiencies[skill], this.addData.proficienciesSkill?.[skill], this.removeData.proficienciesSkill?.[skill])
                if (max && max !== this.removeData.proficienciesSkill?.[skill]) {
                    result[skill] = max
                }
            }
        }
        return result
    }

    public modifyResistances(resistances: string[], onlyRemove: boolean = false): string[] {
        let existing = new Set<string>(this.removeData.resistances)
        if (onlyRemove) {
            return resistances.filter(resistance => !existing.has(resistance))
        } else {
            return [...resistances, ...this.addData.resistances ?? []].filter(resistance => {
                if (resistance && !existing.has(resistance)) {
                    existing.add(resistance)
                    return true
                }
                return false
            })
        }
    }
    public modifyVulnerabilities(vulnerabilities: string[], onlyRemove: boolean = false): string[] {
        let existing = new Set<string>(this.removeData.vulnerabilities)
        if (onlyRemove) {
            return vulnerabilities.filter(vulnerability => !existing.has(vulnerability))
        } else {
            return [...vulnerabilities, ...this.addData.vulnerabilities ?? []].filter(vulnerability => {
                if (!existing.has(vulnerability)) {
                    existing.add(vulnerability)
                    return true
                }
                return false
            })
        }
    }
    public modifyAdvantages(advantages: Partial<Record<AdvantageBinding, string>>, onlyRemove: boolean = false): Partial<Record<AdvantageBinding, string>> {
        if (onlyRemove) {
            return Object.keys(advantages).reduce((prev, key: AdvantageBinding) => {
                let exclude = new Set<string>(this.removeData.advantages?.[key])
                return (
                    { ...prev, [key]: advantages[key].split(splitAdvantagesExpr).filter(advantage => !exclude.has(advantage)).join('; ') }
                )
            }, {})
        } else {
            return Object.values(AdvantageBinding).reduce((prev, key: AdvantageBinding) => {
                if (advantages?.[key] || this.addData.advantages?.[key]) {
                    let existing = new Set<string>(this.removeData.advantages?.[key])
                    return (
                        { ...prev, [key]: [...advantages[key]?.split(splitAdvantagesExpr) ?? [], ...this.addData.advantages?.[key] ?? []].filter(advantage => {
                            if (!existing.has(advantage)) {
                                existing.add(advantage)
                                return true
                            }
                        }).join('; ')}
                    )
                } else {
                    return prev
                }
            }, {})
        }
    }
    public modifyDisadvantages(disadvantages: Partial<Record<AdvantageBinding, string>>, onlyRemove: boolean = false): Partial<Record<AdvantageBinding, string>> {
        if (onlyRemove) {
            return Object.keys(disadvantages).reduce((prev, key: AdvantageBinding) => {
                let exclude = new Set<string>(this.removeData.disadvantages?.[key])
                return (
                    { ...prev, [key]: disadvantages[key].split(splitAdvantagesExpr).filter(disadvantage => !exclude.has(disadvantage)).join('; ') }
                )
            }, {})
        } else {
            return Object.values(AdvantageBinding).reduce((prev, key: AdvantageBinding) => {
                if (disadvantages?.[key] || this.addData.disadvantages?.[key]) {
                    let existing = new Set<string>(this.removeData.disadvantages?.[key])
                    return (
                        { ...prev, [key]: [...disadvantages[key].split(splitAdvantagesExpr), ...this.addData.disadvantages?.[key]].filter(disadvantage => {
                            if (!existing.has(disadvantage)) {
                                existing.add(disadvantage)
                                return true
                            }
                        }).join('; ')}
                    )
                } else {
                    return prev
                }
            }, {})
        }
    }
    public modifyDMGImmunities(immunities: string[], onlyRemove: boolean = false): string[] {
        let existing = new Set<string>(this.removeData.dmgImmunities)
        if (onlyRemove) {
            return immunities.filter(immunity => !existing.has(immunity))
        } else {
            return [...immunities, ...this.addData.dmgImmunities ?? []].filter(immunity => {
                if (!existing.has(immunity)) {
                    existing.add(immunity)
                    return true
                }
                return false
            })
        }
    }
    public modifyCONImmunities(immunities: string[], onlyRemove: boolean = false): string[] {
        let existing = new Set<string>(this.removeData.conImmunities)
        if (onlyRemove) {
            return immunities.filter(immunity => !existing.has(immunity))
        }  else {
            return [...immunities, ...this.addData.conImmunities ?? []].filter(immunity => {
                if (!existing.has(immunity)) {
                    existing.add(immunity)
                    return true
                }
                return false
            })
        }
    }

    public modifyAbilities(abilities: ObjectId[], onlyRemove?: boolean): ObjectId[] {
        let existing = new Set<ObjectId>(this.removeData.abilities)
        if (onlyRemove) {
            return abilities.filter(ability => !existing.has(ability))
        }  else {
            return  [...abilities ?? [], ...this.addData.abilities ?? []].filter(ability => {
                if (!existing.has(ability)) {
                    existing.add(ability)
                    return true
                }
                return false
            })
        }
    }
    public modifySpells(spells: ObjectId[], onlyRemove?: boolean): ObjectId[] {
        let existing = new Set<ObjectId>(this.removeData.spells)
        if (onlyRemove) {
            return spells.filter(spell => !existing.has(spell))
        }  else {
            return  [...spells ?? [], ...this.addData.spells ?? []].filter(spell => {
                if (!existing.has(spell)) {
                    existing.add(spell)
                    return true
                }
                return false
            })
        }
    }
}

export default ModifierCollection