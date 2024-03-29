import { getOptionType } from "data/optionData"
import { AdvantageBinding, ArmorClassBase, ArmorType, Attribute, Language, MovementType, ProficiencyLevel, ProficiencyType, Sense, SizeType, Skill, Tool, WeaponType } from "types/database/dnd"
import { IModifier, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, SelectType, ModifierSetTypeProperty, ModifierType, ModifierCondition } from "types/database/files/modifier";
import { ObjectId } from "types/database";
import ChoiceData from "./choice";

class ModifierData implements Required<IModifier>  {
    private readonly metadata: IModifier;
    private readonly _id?: string

    public constructor(metadata: IModifier, id?: string) {
        this.metadata = metadata ?? { id: "" }
        this._id = id;
    }

    public get id(): string {
        return this._id ? `${this._id}-${this.metadata.id}` : this.metadata.id
    }

    public get condition(): ModifierCondition {
        return this.metadata.condition ?? getOptionType('modifierCondition').default
    }

    public get label(): string {
        return this.metadata.label ?? ""
    }

    public get allowAny(): boolean {
        return this.metadata.allowAny ?? false
    }

    public get numChoices(): number {
        return this.metadata.numChoices ?? 1
    }

    public get type(): ModifierType {
        return this.metadata.type ?? getOptionType('modifierType').default
    }
    
    public get binding(): AdvantageBinding {
        return this.metadata.binding ?? getOptionType('advantageBinding').default
    }

    public get acBase(): ArmorClassBase {
        return this.metadata.acBase ?? getOptionType('acBase').default
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

    public get proficiencyLevel(): ProficiencyLevel {
        return this.metadata.proficiencyLevel ?? getOptionType('proficiencyLevel').default
    }

    // Values

    public get value(): number {
        return this.metadata.value ?? 0
    }

    public get text(): string {
        return this.metadata.text ?? ""
    }

    public get texts(): string[] {
        return this.metadata.texts ?? []
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

    public get movement(): MovementType {
        return this.metadata.movement ?? getOptionType('movement').default
    }

    public get armor(): ArmorType {
        return this.metadata.armor ?? getOptionType('armor').default
    }

    public get armors(): ArmorType[] {
        return this.metadata.armors ?? []
    }

    public get weapon(): WeaponType {
        return this.metadata.weapon ?? getOptionType('weaponProficiency').default
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

    public get sense(): Sense {
        return this.metadata.sense ?? getOptionType('sense').default
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

    public get size(): SizeType {
        return this.metadata.size ?? getOptionType('size').default
    }

    // Choices

    public get choices(): ChoiceData[] {
        return this.metadata.choices?.map((choice) => new ChoiceData(choice, this.id)) ?? []
    }
}

export default ModifierData