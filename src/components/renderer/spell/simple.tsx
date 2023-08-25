import { useMemo } from 'react';
import { getComponents, getSpellRange } from 'utils/calculations';
import Localization from 'utils/localization';
import Logger from 'utils/logger';
import SpellData from 'data/structures/spell';
import Elements from 'data/elements';
import { TargetType } from 'types/database/dnd';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { ISpellMetadata } from 'types/database/files/spell';
import styles from 'styles/renderer.module.scss';

type SpellProps = React.PropsWithRef<{
    metadata: ISpellMetadata
    stats?: ICreatureStats
    variablesKey: string
}>

const SimpleSpell = ({ metadata, stats }: SpellProps) => {
    const spell = useMemo(() => new SpellData(metadata, stats), [metadata, stats])
    const range = getSpellRange(spell)
    const components = getComponents(spell)
    
    Logger.log("Spell", "CollapsedSpell")

    return <Elements.Align>
        <Elements.Block options={{ weight: "1.5" }}>
            <div className={styles.iconRow}>
                <Elements.Bold>{spell.name}</Elements.Bold>
                {spell.concentration &&
                    <Elements.Icon options={{
                        icon: 'concentration',
                        tooltips: Localization.toText('spell-concentration')  
                    }}/>
                }
                {spell.ritual && 
                    <Elements.Icon options={{
                        icon: 'ritual',
                        tooltips: Localization.toText('spell-ritual')  
                    }}/>
                }
            </div>
        </Elements.Block>
        <Elements.Block options={{ weight: "0.8" }}>
            {spell.timeText}
        </Elements.Block>
        <Elements.Block options={{ weight: "0.8" }}>
            {spell.durationText}
        </Elements.Block>
        <Elements.Block options={{ weight: "0.8" }}>
            <div className={styles.iconRow}>
                {spell.target != TargetType.None ? range : '-'}
                {spell.target != TargetType.None &&
                    <Elements.Icon options={{ 
                        icon: spell.area, tooltips: spell.areaName 
                    }}/>
                }
            </div>
        </Elements.Block>
        <Elements.Block options={{ weight: "0.6" }}>
            {components.map((x, i) => (
                <span key={i}
                    className={styles.spellComponent} 
                    tooltips={Localization.toText(`spell-component-${x}`)}>
                    {x}
                </span>
            ))}
        </Elements.Block>
    </Elements.Align>
}

export default SimpleSpell;