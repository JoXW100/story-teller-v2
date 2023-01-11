import { OptionTypes } from "data/optionData";
import { AreaType, CastingTime, Duration, MagicSchool } from "types/database/dnd";
import { SpellMetadata } from "types/database/files/spell";
import CreatureActionData from "./creatureActionData";

class SpellData extends CreatureActionData<SpellMetadata> 
{
    public get level(): number {
        return this.metadata.level ?? 0
    }

    public get school(): MagicSchool {
        return this.metadata.school ?? OptionTypes["magicSchool"].default
    }

    public get schoolName(): string {
        return OptionTypes["magicSchool"].options[this.school] ?? String(this.school)
    }

    public get time(): CastingTime {
        return this.metadata.school ?? OptionTypes["castingTime"].default
    }

    public get timeName(): string {
        return OptionTypes["castingTime"].options[this.time] ?? String(this.time)
    }

    public get timeCustom(): string {
        return this.metadata.timeCustom ?? ""
    }

    public get timeValue(): number {
        return this.metadata.timeValue ?? 0
    }

    public get timeText(): string {
        if (this.time === CastingTime.Custom)
            return this.timeCustom
        return this.timeValue > 1 
            ? `${this.timeValue} ${this.timeName}s`
            : `${this.timeValue} ${this.timeName}`
    }

    public get duration(): Duration {
        return this.metadata.duration ?? OptionTypes["duration"].default
    }

    public get durationName(): string {
        return OptionTypes["duration"].options[this.duration] ?? String(this.duration)
    }

    public get durationValue(): number {
        return this.metadata.durationValue ?? 0
    }

    public get durationText(): string {
        if (this.duration === Duration.Instantaneous)
            return this.durationName;
        return this.durationValue > 1 
            ? `${this.durationValue} ${this.durationName}s`
            : `${this.durationValue} ${this.durationName}`
    }

    public get ritual(): boolean {
        return this.metadata.ritual ?? false
    }

    public get concentration(): boolean {
        return this.metadata.concentration ?? false
    }

    public get componentVerbal(): boolean {
        return this.metadata.componentVerbal ?? false
    }

    public get componentSomatic(): boolean {
        return this.metadata.componentSomatic ?? false
    }

    public get componentMaterial(): boolean {
        return this.metadata.componentMaterial ?? false
    }

    public get materials(): string {
        return this.metadata.materials ?? ""
    }

    // Range

    public get range(): number {
        return this.metadata.range ?? 0
    }
    
    public get area(): AreaType {
        return this.metadata.rangeLong ?? OptionTypes["area"].default
    }
    
    public get areaName(): string {
        return OptionTypes["area"].options[this.area] ?? String(this.area)
    }
    
    public get areaSize(): number {
        return this.metadata.areaSize ?? 0
    }
    
    public get areaHeight(): number {
        return this.metadata.areaHeight ?? 0
    }
}

export default SpellData