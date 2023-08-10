import { getOptionType } from "data/optionData"
import FileData from "./file"
import { ModifierAddTypeProperty, ModifierBonusTypeProperty, ModifierType, Proficiency } from "types/database/dnd"
import { Modifier } from "types/database/files"

class ModifierData extends FileData<Modifier> implements Required<Modifier> 
{
    public get type(): ModifierType {
        return this.metadata.type ?? getOptionType('modifierType').default
    }

    public get bonusProperty(): ModifierBonusTypeProperty {
        return this.metadata.bonusProperty ?? getOptionType('modifierBonusTypeProperty').default
    }

    public get addProperty(): ModifierAddTypeProperty {
        return this.metadata.addProperty ?? getOptionType('modifierAddTypeProperty').default
    }

    public get value(): number {
        return this.metadata.value ?? 0
    }

    public get proficiency(): Proficiency {
        return this.proficiency ?? getOptionType('proficiency').default
    }
}

export default ModifierData