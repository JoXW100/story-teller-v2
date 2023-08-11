import { IEncounterCardData, EncounterMetadata } from "types/database/files/encounter";
import EncounterCardData from "./encounterCardData";
import FileData from "./file";


type EncounterDispatch = React.Dispatch<React.SetStateAction<IEncounterCardData[]>>

class EncounterData extends FileData<EncounterMetadata> implements Required<EncounterMetadata>
{
    protected readonly storage: IEncounterCardData[];
    protected readonly dispatch: EncounterDispatch;

    public constructor(metadata: EncounterMetadata, cards: IEncounterCardData[], dispatch: EncounterDispatch) {
        super(metadata);
        this.storage = cards ?? []
        this.dispatch = dispatch
    }

    public get name(): string {
        return this.metadata.name ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }

    public get public(): boolean {
        return this.metadata.public ?? false
    }

    public get creatures(): string[] {
        return this.metadata.creatures
    }

    public get challenge(): number {
        return this.metadata.challenge ?? 0
    }

    public get xp(): number {
        return this.metadata.xp ?? 0
    }

    public get challengeText(): string {
        let fraction: string = this.challenge > 0
            ? (this.challenge < 1
                ? `1/${Math.floor(1/this.challenge)}` 
                : String(this.challenge)) 
            : '0'
        return `${fraction} (${this.xp} XP)`
    }

    public get cards(): IEncounterCardData[] {
        return this.storage.map((card, index) => new EncounterCardData(card, (c) => {
            if (this.dispatch) {
                this.dispatch((cards) => {
                    let dupe = [...cards]
                    dupe[index] = (c as CallableFunction)(dupe[index])
                    return dupe
                })
            }
        }))
    }
}

export default EncounterData