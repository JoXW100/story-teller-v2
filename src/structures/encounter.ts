import { ObjectId } from "types/database";
import { IEncounterCardData, EncounterMetadata } from "types/database/files/encounter";
import EncounterCardData from "./encounterCardData";
import FileData from "./file";



class EncounterData extends FileData<EncounterMetadata>
{
    public getData(index: number): EncounterCardData {
        if (!this.data[index]) {
            this.data[index] = {}
        }
        return new EncounterCardData(this.data[index])
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

    public get data(): IEncounterCardData[] {
        if (window?.encounterData) {
            return window.encounterData
        } else if (window) {
            window.encounterData = []
        }
        return []
    }
}

export default EncounterData