import { IEncounterCardData } from "types/database/files/encounter"

class EncounterCardData implements IEncounterCardData
{
    public readonly data: IEncounterCardData
    public constructor(data: IEncounterCardData = {}) {
        this.data = data ?? {}
    }

    public get initiative(): number {
        return this.data.initiative ?? 0
    }

    public set initiative(value: number) {
        this.data.initiative = value
    }

    public get maxHealth(): number {
        return this.data.maxHealth ?? 0
    }

    public set maxHealth(value: number) {
        this.data.maxHealth = value
    }

    public get health(): number {
        return this.data.health ?? 0
    }

    public set health(value: number) {
        this.data.health = value
    }

    public get notes(): string {
        return this.data.notes ?? ""
    }

    public set notes(value: string) {
        this.data.notes = value
    }
}

export default EncounterCardData