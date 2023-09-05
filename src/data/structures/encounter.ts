import Random from "utils/random";
import FileData from "./file";
import { IEncounterMetadata } from "types/database/files/encounter";
import { ObjectId } from "types/database";

class EncounterData extends FileData<IEncounterMetadata> implements Required<IEncounterMetadata> {
    private static random = new Random()

    public constructor(metadata: IEncounterMetadata) {
        super(metadata);
    }

    public get creatures(): ObjectId[] {
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

    public random(): number {
        return EncounterData.random.random_int()
    }
}

export default EncounterData