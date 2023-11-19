import FileData from "./file";
import { getOptionType } from "data/optionData";
import ModifierCollection from "./modifierCollection";
import { AdvantageBinding, CreatureType, Language, MovementType, Sense, SizeType } from "types/database/dnd";
import { IModifier } from "types/database/files/modifier";
import { IModifierCollection } from "types/database/files/modifierCollection";
import { IRaceMetadata } from "types/database/files/race";
import { isEnum } from "utils/helpers";
import { ICharacterStorage } from "types/database/files/character";
import ModifierData from "./modifier";

export class RaceData extends FileData<IRaceMetadata> implements Required<IRaceMetadata> {
    private readonly id: string
    public readonly storage: ICharacterStorage
    public constructor(metadata: Partial<IRaceMetadata> = {}, storage: ICharacterStorage = {}, id: string = "") {
        super(metadata);
        this.id = id;
        this.storage = storage;
    }

    public get type(): CreatureType {
        return this.metadata.type ?? getOptionType("creatureType").default;
    }

    public get size(): SizeType {
        return this.metadata.size ?? getOptionType("size").default;
    }

    // Characteristics
    public get resistances(): string {
        return this.metadata.resistances ?? "";
    }

    public get advantages(): Partial<Record<AdvantageBinding, string>> {
        return this.metadata.advantages ?? {};
    }

    public get disadvantages(): Partial<Record<AdvantageBinding, string>> {
        return this.metadata.disadvantages ?? {};
    }

    public get vulnerabilities(): string {
        return this.metadata.vulnerabilities ?? ""
    }

    public get dmgImmunities(): string {
        return this.metadata.dmgImmunities ?? ""
    }

    public get conImmunities(): string {
        return this.metadata.conImmunities ?? ""
    }

    public get speed(): Partial<Record<MovementType, number>> {
        let map: Partial<Record<MovementType, number>> = {}
        for (const type of Object.keys(this.metadata.speed ?? {})) {
            if (isEnum(type, MovementType)) {
                map[type] = this.metadata.speed?.[type] ?? 0
            }
        }
        return map
    }

    public get senses(): Partial<Record<Sense, number>> {
        let map: Partial<Record<Sense, number>> = {}
        for (const type of Object.keys(this.metadata.senses ?? {})) {
            if (isEnum(type, Sense)) {
                map[type] = this.metadata.senses?.[type] ?? 0
            }
        }
        return map
    }

    public get proficienciesLanguage(): Language[] {
        return this.metadata.proficienciesLanguage ?? [];
    }

    public get modifiers(): IModifier[] {
        return this.metadata.modifiers ?? []
    }

    public getModifiers(): IModifierCollection {
        return new ModifierCollection(this.modifiers.map((mod, index) => (
            new ModifierData(mod, `${this.id}-${index}`))
        ), this.storage);
    }
}

export default RaceData;