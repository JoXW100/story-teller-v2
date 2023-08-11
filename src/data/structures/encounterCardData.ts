
import { IEncounterCardData } from "types/database/files/encounter"

type EncounterCardDispatch = React.Dispatch<React.SetStateAction<IEncounterCardData>>

class EncounterCardData implements Required<IEncounterCardData>
{
    public readonly data: IEncounterCardData;
    private readonly dispatch: EncounterCardDispatch;
    public constructor(data: IEncounterCardData, dispatch: EncounterCardDispatch) {
        if (!data) {
            throw new Error("Missing IEncounterCardData argument")
        }
        this.data = data
        this.dispatch = dispatch
    }

    public get initiative(): number {
        return this.data.initiative ?? 0
    }

    public set initiative(value: number) {
        this.dispatch((card) => ({ ...card, initiative: value }))
    }

    public get maxHealth(): number {
        return this.data.maxHealth ?? 0
    }

    public set maxHealth(value: number) {
        this.dispatch((card) => ({ ...card, maxHealth: value }))
    }

    public get health(): number {
        return this.data.health ?? 0
    }

    public set health(value: number) {
        this.dispatch((card) => ({ ...card, health: value }))
    }

    public get notes(): string {
        return this.data.notes ?? ""
    }

    public set notes(value: string) {
        this.dispatch((card) => ({ ...card, notes: value }))
    }
    
}

export default EncounterCardData