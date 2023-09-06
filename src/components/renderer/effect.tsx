import { useMemo } from 'react';
import Elements from 'data/elements';
import Effect from 'data/structures/effect';
import { DamageType, DiceType } from 'types/database/dnd';
import { RollMode } from 'types/elements';
import { RollType } from 'types/dice';
import IEffect from 'types/database/files/iEffect';
import ICreatureStats from 'types/database/files/iCreatureStats';
import styles from 'styles/renderer.module.scss';

type EffectProps = React.PropsWithRef<{
    data: IEffect
    stats: ICreatureStats
    desc: string
    tooltips: string
    id: string
}>

const EffectRenderer = ({ data, stats, desc, tooltips, id }: EffectProps): JSX.Element => {
    const effect = useMemo(() => new Effect(data, stats, id), [data, stats, id])
    return (
        <div className={styles.iconRow}>
            <Elements.Bold>{effect.label} </Elements.Bold>
            { effect.damageType == DamageType.None ?
                effect.text
                :
                <Elements.Roll 
                    options={{ 
                        dice: String(effect.dice), 
                        num: String(effect.diceNum), 
                        mod: String(effect.modifierValue),
                        desc: desc,
                        tooltips: tooltips,
                        details: `${effect.damageTypeName} Damage`,
                        mode: effect.dice == DiceType.None ? RollMode.Mod : RollMode.Dice,
                        type: RollType.Damage
                    }}>
                    <Elements.Icon 
                        options={{ 
                            icon: effect.damageType,
                            tooltips: effect.damageTypeName
                        }}/>
                </Elements.Roll>
            }
        </div>
    )
}

export default EffectRenderer