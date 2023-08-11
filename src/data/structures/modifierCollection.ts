import { ExtractOptionType } from "data/optionData";
import { ArmorType, Attribute, Language, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, ProficiencyType, Skill, Tool, WeaponType } from "types/database/dnd"
import { ModifierSelectType, ModifierType } from "types/database/editor";
import { ChoiceData, Modifier, ModifierCollection } from "types/database/files";
import { CharacterStorage } from "types/database/files/character";

type AddRemoveGroup<T> = { add: T[], remove: T[] }

const ModifierMap = {
    [ProficiencyType.Armor]: "armor",
    [ProficiencyType.Weapon]: "weapon",
    [ProficiencyType.Tool]: "tool",
    [ProficiencyType.Language]: "language",
    [ProficiencyType.Skill]: "skill",
    [ProficiencyType.Save]: "save",
} satisfies Record<ProficiencyType, keyof Modifier>

const ModifierCollectionMap = {
    [ProficiencyType.Armor]: "armors",
    [ProficiencyType.Weapon]: "weapons",
    [ProficiencyType.Tool]: "tools",
    [ProficiencyType.Language]: "languages",
    [ProficiencyType.Skill]: "skills",
    [ProficiencyType.Save]: "saves",
} satisfies Record<ProficiencyType, keyof Modifier>

class ModifierCollectionData implements ModifierCollection
{
    private readonly modifiers: Required<Modifier>[]
    private readonly storage: CharacterStorage
    
    constructor(modifiers: Required<Modifier>[], storage: CharacterStorage) {
        this.modifiers = modifiers;
        this.storage = storage;
    }

    public join(other: Required<ModifierCollection>): ModifierCollection {
        return other ? new CombinedModifierCollection(this, other, this.storage) : this;
    }

    public getChoices(): Record<string, ChoiceData> {
        return this.modifiers.reduce<Record<string, ChoiceData>>((prev, mod) => (
            mod.type === ModifierType.Add 
            && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency 
            && mod.select === ModifierSelectType.Choice 
            ? { ...prev, [mod.$name]: { 
                type: mod.proficiency, 
                label: mod.label,
                options: mod[ModifierCollectionMap[mod.proficiency]] ?? [] } }
            : prev
        ), {})
    }

    public modifyProficiencies<T extends string>(proficiencies: T[], type: ProficiencyType, onlyRemove: boolean): T[] {
        let exclude: Set<T>
        let proficiency: keyof Modifier = ModifierMap[type];
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
                    && mod.select === ModifierSelectType.Value) {
                    return { ...prev, add: [...prev.add, mod[proficiency] ]}
                } else if (mod.type === ModifierType.Add 
                    && mod.addRemoveProperty === ModifierAddRemoveTypeProperty.Proficiency 
                    && mod.proficiency === type
                    && mod.select === ModifierSelectType.Choice
                    && this.storage?.classData
                    && this.storage.classData[mod.$name]) {
                        return { ...prev, add: [...prev.add, this.storage.classData[mod.$name] ] }
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

    public get bonusAC(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.AC 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusNumHealthDice(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.NumHitDice 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusHealth(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.Health 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusProficiency(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.Proficiency 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusInitiative(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.Initiative 
                ? prev + modifier.value 
                : prev
        , 0)
    }
}

class CombinedModifierCollection implements ModifierCollection {
    private readonly c1: ModifierCollection
    private readonly c2: ModifierCollection
    private readonly storage: CharacterStorage

    public constructor(c1: ModifierCollection, c2: ModifierCollection, storage: CharacterStorage) {
        this.c1 = c1;
        this.c2 = c2;
        this.storage = storage;
    }

    public join(other: ModifierCollection): ModifierCollection {
        return other ? new CombinedModifierCollection(this, other, this.storage) : this;
    }

    public getChoices(): Record<string, ChoiceData> {
        let choices1 = this.c1.getChoices();
        let choices2 = this.c2.getChoices();
        return {...choices1, ...choices2}
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
}

export default ModifierCollectionData