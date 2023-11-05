import { IAbilityMetadata } from "types/database/files/ability"
import { ProcessFunction, useFiles } from "./files"
import { toAbility } from "utils/importers/stringFormatAbilityImporter"
import { FileType } from "types/database/files"
import { FileGetMetadataResult } from "types/database/responses"

const parseText = async (value: string): Promise<FileGetMetadataResult> => {
    let res = await toAbility(value)
    if (res) {
        let hash = 0
        let char = 0
        for (let i = 0; i < value.length; i++) {
            char = value.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }

        return {
            id: String(hash) as any,
            type: FileType.Ability,
            metadata: res
        } satisfies FileGetMetadataResult
    }
    return null
}

export const processTextAbilities: ProcessFunction<IAbilityMetadata> = async (ids) => {
    return (await Promise.all(ids.map((id) => parseText(String(id)))))
    .reduce((prev, ability, index) => (
        ability ? { ...prev, results: [...prev.results, ability] }
                : { ...prev, rest: [...prev.rest, ids[index] ] }
    ), { results: [], rest: [] })
}

const useAbilitiesHandler: typeof useFiles<IAbilityMetadata> = (abilityIds, allowedTypes) => {
    return useFiles(abilityIds, allowedTypes, processTextAbilities)
}

export default useAbilitiesHandler