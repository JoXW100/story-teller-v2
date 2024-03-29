import { ObjectIdText } from "types/database";
import { AdvantageBinding, ArmorType, Attribute, Language, MovementType, ProficiencyLevel, Sense, SizeType, Skill, Tool, WeaponType } from "types/database/dnd"
import { ICharacterStorage } from "types/database/files/character";
import { ModifierBonusTypeProperty } from "types/database/files/modifier";
import { IModifierCollection, ChoiceData } from "types/database/files/modifierCollection";

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
        return other && other.length() > 0 
            ? new CombinedModifierCollection(this, other, this.storage)
            : this;
    }

    public length(): number {
        return this.c1.length() + this.c2.length()
    }

    public getChoices(): Record<string, ChoiceData> {
        let choices1 = this.c1.getChoices();
        let choices2 = this.c2.getChoices();
        return {...choices1, ...choices2}
    }

    public getBonus(type: ModifierBonusTypeProperty): number {
        return this.c1.getBonus(type) + this.c2.getBonus(type)
    }

    public getAttributeBonus(attribute: Attribute): number {
        return this.c1.getAttributeBonus(attribute) + this.c2.getAttributeBonus(attribute)
    }

    public getMovementBonus(movement: MovementType): number {
        return this.c1.getMovementBonus(movement) + this.c2.getMovementBonus(movement)
    }

    public get critRange(): number {
        return this.c1.critRange ?? this.c2.critRange 
    }

    public get maxDEXBonus(): number {
        if (this.c1.maxDEXBonus === null) {
            return this.c2.maxDEXBonus
        }
        if (this.c2.maxDEXBonus === null) {
            return this.c1.maxDEXBonus
        }
        return Math.min(this.c1.maxDEXBonus, this.c2.maxDEXBonus )
    }

    public get spellAttribute(): Attribute {
        return this.c1.spellAttribute ?? this.c2.spellAttribute 
    }

    public get size(): SizeType {
        return this.c1.size ?? this.c2.size 
    }

    public get multiAttack(): number {
        if (this.c1.multiAttack === null) {
            return this.c2.multiAttack
        }
        if (this.c2.multiAttack === null) {
            return this.c1.multiAttack
        }
        return Math.max(this.c1.multiAttack, this.c2.multiAttack )
    }
    
    public getSenseRange(sense: Sense): number {
        return Math.max(this.c1.getSenseRange(sense), this.c2.getSenseRange(sense))
    }
    
    public getACBase(values: Record<Attribute, number>): number {
        return Math.max(this.c1.getACBase(values), this.c2.getACBase(values))
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
    public modifyProficienciesTool(proficiencies: Partial<Record<Tool, ProficiencyLevel>>, onlyRemove: boolean = false): Partial<Record<Tool, ProficiencyLevel>> {
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
    public modifyProficienciesSkill(proficiencies: Partial<Record<Skill, ProficiencyLevel>>, onlyRemove: boolean = false): Partial<Record<Skill, ProficiencyLevel>> {
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
    public modifyAdvantages(advantages: Partial<Record<AdvantageBinding, string>>, onlyRemove?: boolean): Partial<Record<AdvantageBinding, string>> {
        if (!onlyRemove) { advantages = this.c1.modifyAdvantages(advantages) }
        advantages = this.c2.modifyAdvantages(advantages, onlyRemove)
        return this.c1.modifyAdvantages(advantages, true) // Remove those added by c2
    }
    public modifyDisadvantages(disadvantages: Partial<Record<AdvantageBinding, string>>, onlyRemove?: boolean): Partial<Record<AdvantageBinding, string>> {
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

export default CombinedModifierCollection