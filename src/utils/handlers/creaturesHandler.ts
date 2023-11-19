
import { useState, useEffect } from "react"
import AbilityData from "data/structures/ability"
import ClassData from "data/structures/class"
import ItemData from "data/structures/item"
import RaceData from "data/structures/race"
import ModifierCollection from "data/structures/modifierCollection"
import CharacterData from "data/structures/character"
import CreatureData from "data/structures/creature"
import { processTextAbilities } from "./abilitiesHandler"
import Communication from "utils/communication"
import Logger from "utils/logger"
import { IModifier } from "types/database/files/modifier"
import { ObjectId, ObjectIdText } from "types/database"
import { CreatureFile } from "types/database/files/creature"
import { FileType, IFileStorage } from "types/database/files"
import { IAbilityMetadata } from "types/database/files/ability"
import { IModifierCollection } from "types/database/files/modifierCollection"
import { CharacterFile, ICharacterStorage } from "types/database/files/character"
import { FileDataQueryResult } from "types/database/responses"

type CreatureTypeCollection = [creatures: CreatureData[], abilities: Record<string, IAbilityMetadata>, items: Record<string, ItemData>]

const getCreatureModifiers = async (ids: ObjectIdText[], storage: IFileStorage, abilities: Record<string, IAbilityMetadata> = {}): Promise<[IModifierCollection, Record<string, IAbilityMetadata>]> => {
    let modifierCollection: IModifierCollection = null
    let prevLength = 0
    
    while (ids.length > prevLength) {
        const { results, rest } = await processTextAbilities(ids)
        let modifiers: IModifier[] = []

        for (const result of results) {
            abilities[String(result.id)] = result.metadata
            for (const modifier of AbilityData.modifiers(result.metadata, String(result.id))) {
                modifiers.push(modifier)
            }
        }

        const response = await Communication.getManyMetadata(rest, [FileType.Ability])
        if (response.success) {
            for (const result of response.result) {
                if (result) {
                    abilities[String(result.id)] = result.metadata
                    for (const modifier of AbilityData.modifiers(result.metadata, String(result.id))) {
                        modifiers.push(modifier)
                    }
                }
            }
        } else {
            Logger.warn("getCreatureModifiers.failure", response.result)
            break
        }

        modifierCollection = new ModifierCollection(modifiers, storage)
        prevLength = ids.length
        ids = CreatureData.abilities(null, modifierCollection)
    }

    return [modifierCollection ?? new ModifierCollection([], storage), abilities]
}

const getRaceData = async (id: ObjectId, storage: ICharacterStorage): Promise<RaceData> => {
    if (id) {
        const response = await Communication.getMetadata(id, [FileType.Race])
        if (response.success) {
            return new RaceData(response.result.metadata, storage, String(id))
        } else {
            Logger.warn("getClassData.failure", response.result)
        }
    }
    return null
}

const getClassData = async (id: ObjectId, storage: ICharacterStorage): Promise<ClassData> => {
    if (id) {
        const response = await Communication.getMetadata(id, [FileType.Class])
        if (response.success) {
            return new ClassData(response.result.metadata, storage, String(id))
        } else {
            Logger.warn("getClassData.failure", response.result)
        }
    }
    return null
}

const getItemsData = async (storage: ICharacterStorage): Promise<Record<string, ItemData>> => {
    const ids = Object.keys(storage.inventory ?? {}) as any as ObjectId[]
    const itemsCollection = {}
    const response = await Communication.getManyMetadata(ids, [FileType.Item])
    const attunedItems = new Set(storage?.attunement ?? [])
    if (response.success) {
        for (const item of response.result) {
            if (item) {
                const data = storage.inventory?.[String(item.id)]
                itemsCollection[String(item.id)] = new ItemData(item.metadata, data, item.id, attunedItems.has(item.id)) 
            }
        }
    } else {
        Logger.warn("getItemsData.failure", response.result)
    }
    return itemsCollection
}

export const getCreatureData = async (data: FileDataQueryResult): Promise<[CreatureData | CharacterData, Record<string, IAbilityMetadata>, Record<string, ItemData>]> => {
    if (data.type === FileType.Character) {
        const cData = data as FileDataQueryResult<CharacterFile>

        let race = await getRaceData(cData.metadata?.raceFile, cData.storage)
        let c = await getClassData(cData.metadata?.classFile, cData.storage)
        let sc: ClassData = null
        if (c?.subclasses?.includes(cData.storage?.classData?.$subclass)) {
            sc = await getClassData(cData.storage?.classData?.$subclass, cData.storage)
        }

        let items = await getItemsData(cData.storage)
        let itemModifierCollection = new ModifierCollection(Object.values(items).flatMap((item) => item.modifiers), cData.storage)

        const cha = new CharacterData(cData.metadata, cData.storage, itemModifierCollection, race, c, sc)
        const [modifierCollection, abilities] = await getCreatureModifiers(cha.abilities, cData.storage)
        const collection = modifierCollection.join(itemModifierCollection)
        return [new CharacterData(cData.metadata, cData.storage, collection, race, c, sc), abilities, items]
    } else {
        const cData = data as FileDataQueryResult<CreatureFile>
        const cre = new CreatureData(cData.metadata)
        const [collection, abilities] = await getCreatureModifiers(cre.abilities, cData.storage)
        return [new CreatureData(cData.metadata, collection), abilities, {}]
    }
}

const useCreaturesHandler = (data: FileDataQueryResult[]): CreatureTypeCollection => {
    const [state, setState] = useState<CreatureTypeCollection>([[], {}, {}])
    useEffect(() => {
        Promise.all(data.map(x => getCreatureData(x)))
        .then((res) => {
            let newState = res.reduce<CreatureTypeCollection>((prev, [creature, abilities, items]) => (
                [[...prev[0], creature], {...prev[1], ...abilities}, {...prev[2], ...items}]
            ), [[], {}, {}])
            setState(newState)
        })
        .catch((e) => {
            Logger.throw("useCreaturesHandler", e)
            setState([[], {}, {}])
        })
    }, [data])

    return state
}

export default useCreaturesHandler