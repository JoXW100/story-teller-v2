import { IAbilityMetadata } from "types/database/files/ability"
import { ProcessFunction, useFiles } from "./files"
import { toAbility } from "utils/importers/stringFormatAbilityImporter"
import { FileType } from "types/database/files"
import { FileGetMetadataResult } from "types/database/responses"

const parseText = async (value: string): Promise<FileGetMetadataResult> => {
    let res = await toAbility(value)
    if (res) {
        return {
            id: value as any,
            type: FileType.Ability,
            metadata: res
        } satisfies FileGetMetadataResult
    }
    return null
}

const processFunction: ProcessFunction<IAbilityMetadata> = async (ids) => {
    return (await Promise.all(ids.map((id) => parseText(String(id)))))
    .reduce((prev, ability, index) => (
        ability ? { ...prev, results: [...prev.results, ability] }
                : { ...prev, rest: [...prev.rest, ids[index] ] }
    ), { results: [], rest: [] })
}

const useAbilitiesHandler: typeof useFiles<IAbilityMetadata> = (abilityIds, allowedTypes) => {
    return useFiles(abilityIds, allowedTypes, processFunction)
}

export default useAbilitiesHandler