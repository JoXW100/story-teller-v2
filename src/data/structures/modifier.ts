import { getOptionType } from "data/optionData"
import { ArmorType, Attribute, Language, ProficiencyType, Skill, Tool, WeaponType } from "types/database/dnd"
import { IModifier, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, SelectType, ModifierSetTypeProperty, ModifierType } from "types/database/files/modifier";
import { ObjectId } from "types/database";

class ModifierData implements Required<IModifier>  {
    private readonly metadata: IModifier;
    private readonly id?: string

    public constructor(metadata: IModifier, id?: string) {
        this.metadata = metadata ?? { $name: "" }
        this.id = id;
    }

    public get $name(): string {
        return this.id ? `${this.id}-${this.metadata.$name}` : this.metadata.$name
    }

    public get label(): string {
        return this.metadata.label
    }

    public get allowAny(): boolean {
        return this.metadata.allowAny ?? false
    }

    public get type(): ModifierType {
        return this.metadata.type ?? getOptionType('modifierType').default
    }

    public get select(): SelectType {
        return this.metadata.select ?? getOptionType('modifierSelect').default
    }

    public get bonusProperty(): ModifierBonusTypeProperty {
        return this.metadata.bonusProperty ?? getOptionType('modifierBonusTypeProperty').default
    }

    public get addRemoveProperty(): ModifierAddRemoveTypeProperty {
        return this.metadata.addRemoveProperty ?? getOptionType('modifierAddRemoveTypeProperty').default
    }

    public get setProperty(): ModifierSetTypeProperty {
        return this.metadata.setProperty ?? getOptionType('modifierSetTypeProperty').default
    }

    public get proficiency(): ProficiencyType {
        return this.metadata.proficiency ?? getOptionType('proficiencyType').default
    }

    // Values

    public get value(): number {
        return this.metadata.value ?? 0
    }
    
    public get file(): ObjectId {
        return this.metadata.file ?? null
    }

    public get files(): ObjectId[] {
        return this.metadata.files ?? []
    }
    
    public get attribute(): Attribute {
        return this.metadata.attribute ?? getOptionType('attr').default
    }

    public get attributes(): Attribute[] {
        return this.metadata.attributes ?? []
    }

    public get armor(): ArmorType {
        return this.metadata.armor ?? getOptionType('armor').default
    }

    public get armors(): ArmorType[] {
        return this.metadata.armors ?? []
    }

    public get weapon(): WeaponType {
        return this.metadata.weapon ?? getOptionType('weapon').default
    }

    public get weapons(): WeaponType[] {
        return this.metadata.weapons ?? []
    }

    public get tool(): Tool {
        return this.metadata.tool ?? getOptionType('tool').default
    }

    public get tools(): Tool[] {
        return this.metadata.tools ?? []
    }

    public get language(): Language {
        return this.metadata.language ?? getOptionType('language').default
    }

    public get languages(): Language[] {
        return this.metadata.languages ?? []
    }

    public get save(): Attribute {
        return this.metadata.save ?? getOptionType('attr').default
    }

    public get saves(): Attribute[] {
        return this.metadata.saves ?? []
    }

    public get skill(): Skill {
        return this.metadata.skill ?? getOptionType('skill').default
    }

    public get skills(): Skill[] {
        return this.metadata.skills ?? []
    }
}

export default ModifierData