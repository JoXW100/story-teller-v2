import { ObjectId, ObjectIdText } from "types/database";
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

class ModifierCollectionData implements IModifierCollection {
    protected readonly modifiers: IModifier[]
    protected readonly storage: ICharacterStorage
    
    constructor(modifiers: IModifier[], storage: ICharacterStorage) {
        this.modifiers = modifiers.reduce<IModifier[]>((prev, mod) => {
            if (mod.type === ModifierType.Choice 
             && storage?.classData 
             && storage.classData[mod.id]) {
                let value = mod.choices.find(choice => choice.id === storage.classData[mod.id])
                return [...prev, mod, ...value?.modifiers ?? []]
            }
            return [...prev, mod]
        }, []);
        this.storage = storage;
    }

    public equals(other: IModifierCollection): boolean {
        if (other instanceof ModifierCollectionData) {
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

class CombinedModifierCollection implements IModifierCollection {
    private readonly c1: IModifierCollection
    private readonly c2: IModifierCollection
    private readonly storage: ICharacterStorage

    public constructor(c1: IModifierCollection, c2: IModifierCollection, storage: ICharacterStorage) {
        this.c1 = c1;
        this.c2 = c2;
        this.storage = storage;
    }

    public equals(other: IModifierCollection): boolean {
        if (other instanceof CombinedModifierCollection) {
            return this.c1.equals(other.c1) && this.c2.equals(other.c2)
        }
        return false
    }

    public join(other: IModifierCollection): CombinedModifierCollection {
        return other ? new CombinedModifierCollection(this, other, this.storage) : this;
    }

    public getChoices(): Record<string, ChoiceData> {
        let choices1 = this.c1.getChoices();
        let choices2 = this.c2.getChoices();
        return {...choices1, ...choices2}
    }

    public get bonusAC(): number {
        return this.c1.bonusAC + this.c2.bonusAC
    }

    public get bonusNumHealthDice(): number {
        return this.c1.bonusNumHealthDice + this.c2.bonusNumHealthDice
    }

    public get bonusHealth(): number {
        return this.c1.bonusHealth + this.c2.bonusHealth
    }

    public get bonusProficiency(): number {
        return this.c1.bonusProficiency + this.c2.bonusProficiency
    }

    public get bonusInitiative(): number {
        return this.c1.bonusInitiative + this.c2.bonusInitiative
    }

    public get critRange(): number {
        return this.c1.critRange ?? this.c2.critRange 
    }

    public get spellAttribute(): Attribute {
        return this.c1.spellAttribute ?? this.c2.spellAttribute 
    }

    public getAttributeBonus(attribute: Attribute): number {
        return this.c1.getAttributeBonus(attribute) + this.c2.getAttributeBonus(attribute)
    }
    
    public modifyProficienciesArmor(proficiencies: ArmorType[], onlyRemove: boolean = false): ArmorType[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesArmor(proficiencies) }
        proficiencies = this.c2.modifyProficienciesArmor(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesArmor(proficiencies, true) // Remove those added by c2
    }
    public modifyProficienciesWeapon(proficiencies: WeaponType[], onlyRemove: boolean = false): WeaponType[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesWeapon(proficiencies) }
        proficiencies = this.c2.modifyProficienciesWeapon(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesWeapon(proficiencies, true) // Remove those added by c2
    }
    public modifyProficienciesTool(proficiencies: Tool[], onlyRemove: boolean = false): Tool[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesTool(proficiencies) }
        proficiencies = this.c2.modifyProficienciesTool(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesTool(proficiencies, true) // Remove those added by c2
    }
    public modifyProficienciesLanguage(proficiencies: Language[], onlyRemove: boolean = false): Language[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesLanguage(proficiencies) }
        proficiencies = this.c2.modifyProficienciesLanguage(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesLanguage(proficiencies, true) // Remove those added by c2
    }
    public modifyProficienciesSave(proficiencies: Attribute[], onlyRemove: boolean = false): Attribute[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesSave(proficiencies) }
        proficiencies = this.c2.modifyProficienciesSave(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesSave(proficiencies, true) // Remove those added by c2

    }
    public modifyProficienciesSkill(proficiencies: Skill[], onlyRemove: boolean = false): Skill[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesSkill(proficiencies) }
        proficiencies = this.c2.modifyProficienciesSkill(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesSkill(proficiencies, true) // Remove those added by c2
    }

    public modifyResistances(resistances: string[], onlyRemove?: boolean): string[] {
        if (!onlyRemove) { resistances = this.c1.modifyResistances(resistances) }
        resistances = this.c2.modifyResistances(resistances, onlyRemove)
        return this.c1.modifyResistances(resistances, true) // Remove those added by c2
    }
    public modifyVulnerabilities(vulnerabilities: string[], onlyRemove?: boolean): string[] {
        if (!onlyRemove) { vulnerabilities = this.c1.modifyVulnerabilities(vulnerabilities) }
        vulnerabilities = this.c2.modifyVulnerabilities(vulnerabilities, onlyRemove)
        return this.c1.modifyVulnerabilities(vulnerabilities, true) // Remove those added by c2
    }
    public modifyAdvantages(advantages: string[], onlyRemove?: boolean): string[] {
        if (!onlyRemove) { advantages = this.c1.modifyAdvantages(advantages) }
        advantages = this.c2.modifyAdvantages(advantages, onlyRemove)
        return this.c1.modifyAdvantages(advantages, true) // Remove those added by c2
    }
    public modifyDisadvantages(disadvantages: string[], onlyRemove?: boolean): string[] {
        if (!onlyRemove) { disadvantages = this.c1.modifyDisadvantages(disadvantages) }
        disadvantages = this.c2.modifyDisadvantages(disadvantages, onlyRemove)
        return this.c1.modifyDisadvantages(disadvantages, true) // Remove those added by c2
    }
    public modifyDMGImmunities(dmgImmunities: string[], onlyRemove?: boolean): string[] {
        if (!onlyRemove) { dmgImmunities = this.c1.modifyDMGImmunities(dmgImmunities) }
        dmgImmunities = this.c2.modifyDMGImmunities(dmgImmunities, onlyRemove)
        return this.c1.modifyDMGImmunities(dmgImmunities, true) // Remove those added by c2
    }
    public modifyCONImmunities(conImmunities: string[], onlyRemove?: boolean): string[] {
        if (!onlyRemove) { conImmunities = this.c1.modifyCONImmunities(conImmunities) }
        conImmunities = this.c2.modifyCONImmunities(conImmunities, onlyRemove)
        return this.c1.modifyCONImmunities(conImmunities, true) // Remove those added by c2
    }

    public modifyAbilities(abilities: ObjectIdText[]): ObjectIdText[] {
        abilities = this.c1.modifyAbilities(abilities)
        return this.c2.modifyAbilities(abilities)
    }

    public modifySpells(abilities: ObjectIdText[]): ObjectIdText[] {
        abilities = this.c1.modifySpells(abilities)
        return this.c2.modifySpells(abilities)
    }
}

export default ModifierCollectionData