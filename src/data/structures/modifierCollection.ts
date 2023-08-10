import { ModifierBonusTypeProperty, ModifierType } from "types/database/dnd"
import { Modifier, ModifierCollection } from "types/database/files";

class ModifierCollectionData implements Required<ModifierCollection> 
{
    private readonly modifiers: Modifier[]
    
    constructor(modifiers: Modifier[]) {
        this.modifiers = modifiers;
    }

    public join(other: Required<ModifierCollection>): ModifierCollection {
        return new CombinedModifierCollection(this, other);
    }

    public get bonusAC(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.AC 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusNumHealthDice(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.NumHitDice 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusHealth(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.Health 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusProficiency(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.Proficiency 
                ? prev + modifier.value 
                : prev
        , 0)
    }

    public get bonusInitiative(): number {
        return this.modifiers.reduce<number>((prev, modifier) => 
            modifier.type == ModifierType.Bonus && modifier.bonusProperty == ModifierBonusTypeProperty.Initiative 
                ? prev + modifier.value 
                : prev
        , 0)
    }
}

class CombinedModifierCollection implements ModifierCollection {
    private readonly c1: Required<ModifierCollection>
    private readonly c2: Required<ModifierCollection>

    public constructor(c1: Required<ModifierCollection>, c2: Required<ModifierCollection>) {
        this.c1 = c1;
        this.c2 = c2;
    }

    public join(other: Required<ModifierCollection>): ModifierCollection {
        return new CombinedModifierCollection(this, other);
    }

    public get bonusAC(): number {
        return this.c1.bonusAC + this.c2.bonusAC
    }

    public get bonusNumHealthDice(): number {
        return this.c1.bonusNumHealthDice + this.c2.bonusNumHealthDice
    }

    public get bonusHealth(): number {
        return this.c1.bonusHealth + this.c2.bonusHealth
    }

    public get bonusProficiency(): number {
        return this.c1.bonusProficiency + this.c2.bonusProficiency
    }

    public get bonusInitiative(): number {
        return this.c1.bonusInitiative + this.c2.bonusInitiative
    }
}

export default ModifierCollectionData