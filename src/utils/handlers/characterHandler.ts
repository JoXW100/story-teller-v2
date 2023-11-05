import { useState, useEffect } from "react"
import CharacterData from "data/structures/character"
import type ItemData from "data/structures/item"
import { getCreatureData } from "./creaturesHandler"
import Logger from "utils/logger"
import { FileType, IFileQueryData } from "types/database/files"
import type { IAbilityMetadata } from "types/database/files/ability"
import type { CharacterFile } from "types/database/files/character"

type CharacterTypeCollection = [creatures: CharacterData, abilities: Record<string, IAbilityMetadata>, items: Record<string, ItemData>]

const useCharacterHandler = (data: IFileQueryData<CharacterFile>): CharacterTypeCollection => {
    const [state, setState] = useState<CharacterTypeCollection>([new CharacterData(data?.metadata, data?.storage), {}, {}])
    useEffect(() => {
        getCreatureData({ ...data, id: null, type: FileType.Character })
        .then((res) => setState(res as CharacterTypeCollection))
        .catch((e) => {
            Logger.throw("useCharacterHandler.error", e)
            setState([new CharacterData(data?.metadata, data?.storage), {}, {}])
        })
    }, [data])
    return state
}

export default useCharacterHandler