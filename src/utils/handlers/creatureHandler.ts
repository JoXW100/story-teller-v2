import { useState, useEffect } from "react"
import CreatureData from "data/structures/creature"
import type ItemData from "data/structures/item"
import { getCreatureData } from "./creaturesHandler"
import Logger from "utils/logger"
import { FileType, IFileQueryData } from "types/database/files"
import type { IAbilityMetadata } from "types/database/files/ability"
import type { CreatureFile } from "types/database/files/creature"

type CreatureTypeCollection = [creatures: CreatureData, abilities: Record<string, IAbilityMetadata>, items: Record<string, ItemData>]

const useCreatureHandler = (data: IFileQueryData<CreatureFile>): CreatureTypeCollection => {
    const [state, setState] = useState<CreatureTypeCollection>([new CreatureData(data?.metadata), {}, {}])
    useEffect(() => {
        getCreatureData({ ...data, id: null, type: FileType.Creature })
        .then((res) => setState(res as CreatureTypeCollection))
        .catch((e) => {
            Logger.throw("useCreatureHandler.error", e)
            setState([new CreatureData(data?.metadata), {}, {}])
        })
    }, [data])
    return state
}

export default useCreatureHandler