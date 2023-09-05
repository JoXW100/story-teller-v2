import { useState, useMemo, useEffect } from "react"
import AbilityData from "data/structures/ability"
import ModifierCollection from "data/structures/modifierCollection"
import CreatureData from "data/structures/creature"
import useAbilitiesHandler from "./abilitiesHandler"
import { FileType, IFileQueryData } from "types/database/files"
import { IAbilityMetadata } from "types/database/files/ability"
import { IModifierCollection } from "types/database/files/modifierCollection"
import { FileGetManyMetadataResult } from "types/database/responses"
import CreatureFile from "types/database/files/creature"

const useCreatureHandler = (data: IFileQueryData<CreatureFile>): [creature: CreatureData, abilities: FileGetManyMetadataResult<IAbilityMetadata>] => {
    const [modifiers, setModifiers] = useState<IModifierCollection>(null)
    const creature =  useMemo(() => new CreatureData(data.metadata, modifiers), [data.metadata, data.storage, modifiers])
    const abilityIds = useMemo(() => creature.abilities, [creature])
    const [abilities] = useAbilitiesHandler(abilityIds, [FileType.Ability])

    useEffect(() => {
        if (abilities) {
            let modifiersList = abilities.flatMap((ability) => ability ? new AbilityData(ability.metadata, null, String(ability.id)).modifiers : []);
            let collection = new ModifierCollection(modifiersList, null)
            if (!collection.equals(modifiers)) {
                setModifiers(collection);
            }
        }
    }, [abilities])

    return [creature, abilities]
}

export default useCreatureHandler