import { IEncounterCardData, EncounterMetadata } from "types/database/files/encounter";
import EncounterCardData from "./encounterCardData";
import FileData from "./file";



class EncounterData extends FileData<EncounterMetadata>
{
    protected readonly cards: IEncounterCardData[];
    protected readonly setCards: React.Dispatch<React.SetStateAction<IEncounterCardData[]>>

    public constructor(metadata: EncounterMetadata, state: [IEncounterCardData[], React.Dispatch<IEncounterCardData[]>] = undefined) {
        super(metadata);
        if (state) {
            this.cards = state[0]
            this.setCards = state[1]
        }
    }

    public getCard(index: number): EncounterCardData {
        if (!this.cards[index]) {
            this.cards[index] = {}
        }
        return new EncounterCardData(this.cards[index], (card) => {
            if (this.setCards) {
                this.setCards((cards) => {
                    let dupe = [...cards]
                    dupe[index] = (card as CallableFunction)(dupe[index])
                    return dupe
                })
            }
        })
    }

    public get name(): string {
        return this.metadata.name ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }

    public get publish(): boolean {
        return this.metadata.publish ?? false
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

    public get challengeText():string {
        let fraction: string = this.challenge > 0
            ? (this.challenge < 1
                ? `1/${Math.floor(1/this.challenge)}` 
                : String(this.challenge)) 
            : '0'
        return `${fraction} (${this.xp} XP)`
    }
}

export default EncounterData