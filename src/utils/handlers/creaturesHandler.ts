
import { useState, useMemo, useEffect } from "react"
import AbilityData from "data/structures/ability"
import ClassData from "data/structures/class"
import ItemData from "data/structures/item"
import ModifierCollection from "data/structures/modifierCollection"
import CharacterData from "data/structures/character"
import CreatureData from "data/structures/creature"
import { useFiles } from "./files"
import useAbilitiesHandler from "./abilitiesHandler"
import { isObjectId } from "utils/helpers"
import { FileType } from "types/database/files"
import { IAbilityMetadata } from "types/database/files/ability"
import { IItemMetadata } from "types/database/files/item"
import { IModifierCollection } from "types/database/files/modifierCollection"
import { CharacterFile, ICharacterStorage } from "types/database/files/character"
import { CreatureFile } from "types/database/files/creature"
import { FileDataQueryResult } from "types/database/responses"

const useCreaturesHandler = (data: FileDataQueryResult[]): [creatures: CreatureData[], abilities: Record<string, IAbilityMetadata>, items: Record<string, IItemMetadata>] => {
    const [modifiers, setModifiers] = useState<IModifierCollection[]>([]) 
    const [creatures, characters] = useMemo<[FileDataQueryResult<CreatureFile>[], FileDataQueryResult<CharacterFile>[]]>(() => data.reduce((prev, x) => x.type === FileType.Character 
        ? [prev[0], [...prev[1], x]] 
        : [[...prev[0], x], prev[1]]
    , [[], []]), [data])
    const classFileIds = useMemo(() => characters.map(x => x.metadata.classFile), [characters])
    const subclassFileIds = useMemo(() => characters.map(x => x.storage?.classData?.$subclass), [characters])
    const itemIds = useMemo(() => characters.flatMap(x => Object.keys(x.storage?.inventory ?? {})), [characters])
    const [classFiles] = useFiles(classFileIds, [FileType.Class])
    const [subclassFiles] = useFiles(subclassFileIds, [FileType.Class])
    const [itemFiles] = useFiles(itemIds, [FileType.Item])

    const creatureFiles = useMemo<CreatureData[]>(() => {
        let z = 0
        return [...creatures, ...characters].map((x, i) => {
            let modifier = modifiers[i]
            if (x?.type === FileType.Character) {
                let storage: ICharacterStorage = x?.storage as ICharacterStorage
                let classData = new ClassData(classFiles[z]?.metadata, storage, String(classFiles[z]?.id))
                let subclassData = classData.subclasses.includes(subclassFiles[z]?.id) 
                    ? new ClassData(subclassFiles[z]?.metadata, storage, String(subclassFiles[z]?.id))
                    : null
                z++;
                return new CharacterData(x?.metadata, storage, modifier, classData, subclassData)
            } else {    
                return new CreatureData(x?.metadata, modifier)
            }
        })
    }, [creatures, characters, classFiles, subclassFiles, modifiers])

    const abilityIds = useMemo(() => creatureFiles.flatMap(x => x.abilities ?? []), [creatureFiles])
    const [abilities] = useAbilitiesHandler(abilityIds)

    const abilitiesRecord = useMemo(() => abilities?.reduce<Record<string, IAbilityMetadata>>((prev, ability) => (
        {...prev, [String(ability.id)]: ability.metadata ?? prev[String(ability.id)] }
    ), {}) ?? {}, [abilities])
    const itemsRecord = useMemo(() => itemFiles?.reduce<Record<string, IItemMetadata>>((prev, item) => (
        {...prev, [String(item.id)]: item.metadata ?? prev[String(item.id)] }
    ), {}) ?? {}, [itemFiles])
   
    useEffect(() => {
        if (Object.keys(abilitiesRecord).length > 0) {
            let newModifiers: IModifierCollection[] = []

            for (let i = 0; i < creatureFiles.length; i++) {
                const creature = creatureFiles[i]
                let abilityModifiers = creature.abilities.flatMap((id) => new AbilityData(abilitiesRecord[String(id)], null, String(id)).modifiers);
                let abilityModifierCollection = new ModifierCollection(abilityModifiers, null)
                if (creature && creature instanceof CharacterData) {
                    let itemModifiers = Object.keys(creature?.storage?.inventory ?? {}).flatMap((key) => isObjectId(key) ? new ItemData(itemsRecord[key], creature.storage.inventory[key], key, creature.storage.attunement?.some(x => String(x) === String(key))).modifiers : [])
                    let itemModifierCollection = new ModifierCollection(itemModifiers, creature.storage)
                    newModifiers[i] = abilityModifierCollection.join(itemModifierCollection)
                } else {
                    newModifiers[i] = abilityModifierCollection
                }
            }
            
            if (modifiers.length !== newModifiers.length || modifiers.some((mod,i) => !mod.equals(newModifiers[i]))) {
                setModifiers(newModifiers);
            }
        }
    }, [creatureFiles, abilitiesRecord, creatures, characters, itemsRecord, modifiers])

    return [creatureFiles, abilitiesRecord, itemsRecord]
}

export default useCreaturesHandler