import { useState, useMemo, useEffect } from "react"
import AbilityData from "data/structures/ability"
import ClassData from "data/structures/class"
import ItemData from "data/structures/item"
import ModifierCollection from "data/structures/modifierCollection"
import CharacterData from "data/structures/character"
import { useFile, useFiles } from "./files"
import useAbilitiesHandler from "./abilitiesHandler"
import { FileType, IFileQueryData } from "types/database/files"
import { IAbilityMetadata } from "types/database/files/ability"
import { IClassMetadata } from "types/database/files/class"
import { IItemMetadata } from "types/database/files/item"
import { IModifierCollection } from "types/database/files/modifierCollection"
import { FileGetManyMetadataResult } from "types/database/responses"
import CharacterFile from "types/database/files/character"

const useCharacterHandler = (data: IFileQueryData<CharacterFile>): [character: CharacterData, abilities: FileGetManyMetadataResult<IAbilityMetadata>, items: FileGetManyMetadataResult<IItemMetadata>] => {
    const [modifiers, setModifiers] = useState<IModifierCollection>(null)
    const [classFile] = useFile<IClassMetadata>(data.metadata?.classFile, [FileType.Class])
    const [subclassFile] = useFile<IClassMetadata>(data.storage?.classData?.$subclass, [FileType.Class]);
    const itemIds = useMemo(() => Object.keys(data.storage?.inventory ?? {}), [data.storage?.inventory])
    const [items] = useFiles<IItemMetadata>(itemIds, [FileType.Item]);

    const classData = useMemo(() => new ClassData(classFile?.metadata, data.storage, classFile?.id ? String(classFile?.id) : undefined), [classFile, data.storage])
    const subclassData = useMemo(() => classData.subclasses.includes(subclassFile?.id) ? new ClassData(subclassFile?.metadata, data.storage, subclassFile?.id ? String(subclassFile?.id) : undefined)  : null, [subclassFile, classData])
    const character =  useMemo(() => new CharacterData(data.metadata, data.storage, modifiers, classData, subclassData), [data.metadata, data.storage, modifiers, classData, subclassData])
    const abilityIds = useMemo(() => character.abilities, [character])
    const [abilities] = useAbilitiesHandler(abilityIds, [FileType.Ability])

    useEffect(() => {
        if (abilities) {
            let itemModifiers = items.flatMap((item) => item ? new ItemData(item.metadata, data.storage.inventory?.[String(item.id)], item.id, data.storage.attunement?.some(x => String(x) === String(item.id))).modifiers : [])
            let abilityModifiers = abilities.flatMap((ability) => ability ? new AbilityData(ability.metadata, null, String(ability.id)).modifiers : []);
            let collection = new ModifierCollection([...abilityModifiers, ...itemModifiers], data.storage)
            if (!collection.equals(modifiers)) {
                setModifiers(collection);
            }
        }
    }, [abilities])

    return [character, abilities, items]
}

export default useCharacterHandler