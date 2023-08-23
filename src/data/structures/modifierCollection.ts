import { ObjectId, ObjectIdText } from "types/database";
import { ArmorType, Attribute, Language, ProficiencyType, Skill, Tool, WeaponType } from "types/database/dnd"
import { FileType } from "types/database/files";
import { ICharacterStorage } from "types/database/files/character";
import { IModifier, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, SelectType, ModifierSetTypeProperty, ModifierType } from "types/database/files/modifier";
import { IModifierCollection, ChoiceData, EnumChoiceData, AnyFileChoiceData, FileChoiceData, ChoiceChoiceData } from "types/database/files/modifierCollection";

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
                return [...prev, mod, ...(value?.modifiers ?? [])]
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
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Ability 
                && mod.select === SelectType.Choice
                && !mod.allowAny) {
                return {  ...prev,  [mod.id]: { type: "file", label: mod.label, allowAny: false, options: mod.files } satisfies FileChoiceData}
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

    private modifyProficiencies<T extends string>(proficiencies: T[], type: ProficiencyType, onlyRemove: boolean): T[] {
        let exclude: Set<T>
        let proficiency: keyof IModifier = ModifierMap[type];
        if (onlyRemove) {
            let remove = this.modifiers.reduce<T[]>((prev, mod) => (
                mod.type === ModifierType.Remove  
                && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency 
                && mod.proficiency === type 
                ? [...prev, mod[proficiency] as T]  : prev
            ), [])
            exclude = new Set(remove);
        } else {
            let groups = this.modifiers.reduce<AddRemoveGroup<T>>((prev, mod) => {
                if (mod.type === ModifierType.Add 
                    && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency 
                    && mod.proficiency === type
                    && mod.select === SelectType.Value) {
                    return { ...prev, add: [...prev.add, mod[proficiency] ]}
                } else if (mod.type === ModifierType.Add 
                    && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency 
                    && mod.proficiency === type
                    && mod.select === SelectType.Choice
                    && this.storage?.classData
                    && this.storage.classData[mod.id]) {
                        return { ...prev, add: [...prev.add, this.storage.classData[mod.id] ] }
                } else if (mod.type === ModifierType.Remove 
                    && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency 
                    && mod.proficiency === type) {
                    return { ...prev, remove: [...prev.remove, mod[proficiency] as T]}
                }
                return prev
            }, { add: [], remove: [] })
            
            proficiencies = groups.add.reduce<T[]>((prev, armor) => (
                prev.includes(armor) ? prev : [...prev, armor]
            ), proficiencies)

            exclude = new Set(groups.remove);
        }
        return proficiencies.filter(x => !exclude.has(x))
    }

    public modifyProficienciesArmor(proficiencies: ArmorType[], onlyRemove: boolean = false): ArmorType[] {
        return this.modifyProficiencies<ArmorType>(proficiencies, ProficiencyType.Armor, onlyRemove)
    }
    public modifyProficienciesWeapon(proficiencies: WeaponType[], onlyRemove?: boolean): WeaponType[] {
        return this.modifyProficiencies<WeaponType>(proficiencies, ProficiencyType.Weapon, onlyRemove)
    }
    public modifyProficienciesTool(proficiencies: Tool[], onlyRemove?: boolean): Tool[] {
        return this.modifyProficiencies<Tool>(proficiencies, ProficiencyType.Tool, onlyRemove)
    }
    public modifyProficienciesLanguage(proficiencies: Language[], onlyRemove?: boolean): Language[] {
        return this.modifyProficiencies<Language>(proficiencies, ProficiencyType.Language, onlyRemove)
    }
    public modifyProficienciesSave(proficiencies: Attribute[], onlyRemove?: boolean): Attribute[] {
        return this.modifyProficiencies<Attribute>(proficiencies, ProficiencyType.Save, onlyRemove)
    }
    public modifyProficienciesSkill(proficiencies: Skill[], onlyRemove?: boolean): Skill[]{
        return this.modifyProficiencies<Skill>(proficiencies, ProficiencyType.Skill, onlyRemove)
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

    public getAttributeBonus(attribute: Attribute): number {
        return this.c1.getAttributeBonus(attribute) + this.c2.getAttributeBonus(attribute)
    }
    
    public modifyProficienciesArmor(proficiencies: ArmorType[], onlyRemove?: boolean): ArmorType[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesArmor(proficiencies) }
        proficiencies = this.c2.modifyProficienciesArmor(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesArmor(proficiencies, true) // Remove those added by c2
    }
    public modifyProficienciesWeapon(proficiencies: WeaponType[], onlyRemove?: boolean): WeaponType[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesWeapon(proficiencies) }
        proficiencies = this.c2.modifyProficienciesWeapon(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesWeapon(proficiencies, true) // Remove those added by c2
    }
    public modifyProficienciesTool(proficiencies: Tool[], onlyRemove?: boolean): Tool[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesTool(proficiencies) }
        proficiencies = this.c2.modifyProficienciesTool(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesTool(proficiencies, true) // Remove those added by c2
    }
    public modifyProficienciesLanguage(proficiencies: Language[], onlyRemove?: boolean): Language[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesLanguage(proficiencies) }
        proficiencies = this.c2.modifyProficienciesLanguage(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesLanguage(proficiencies, true) // Remove those added by c2
    }
    public modifyProficienciesSave(proficiencies: Attribute[], onlyRemove?: boolean): Attribute[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesSave(proficiencies) }
        proficiencies = this.c2.modifyProficienciesSave(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesSave(proficiencies, true) // Remove those added by c2

    }
    public modifyProficienciesSkill(proficiencies: Skill[], onlyRemove?: boolean): Skill[] {
        if (!onlyRemove) { proficiencies = this.c1.modifyProficienciesSkill(proficiencies) }
        proficiencies = this.c2.modifyProficienciesSkill(proficiencies, onlyRemove)
        return this.c1.modifyProficienciesSkill(proficiencies, true) // Remove those added by c2
    }

    public modifyAbilities(abilities: ObjectIdText[]): ObjectIdText[] {
        abilities = this.c1.modifyAbilities(abilities)
        return this.c2.modifyAbilities(abilities)
    }
}

export default ModifierCollectionData