import { useMemo } from 'react';
import { useParser } from 'utils/parser';
import { getComponents, getSpellRange } from 'utils/calculations';
import Localization from 'utils/localization';
import Logger from 'utils/logger';
import SpellData from 'data/structures/spell';
import Elements from 'data/elements';
import EffectRenderer from '../effect';
import { Attribute, EffectCondition, TargetType } from 'types/database/dnd';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { ISpellMetadata } from 'types/database/files/spell';
import styles from 'styles/renderer.module.scss';

type SpellProps = React.PropsWithRef<{
    metadata: ISpellMetadata
    stats?: ICreatureStats
    variablesKey: string
}>

const DetailedSpell = ({ metadata, stats, variablesKey }: SpellProps) => {
    let spell = useMemo(() => new SpellData(metadata, stats), [metadata, stats])
    let description = useParser(spell.description, spell, variablesKey)
    let range = getSpellRange(spell)
    let components = getComponents(spell)

    Logger.log("Spell", "Spell")

    return <>
        <Elements.Align>
            <Elements.Align options={{ direction: "v", weight: "1.5" }}>
                <Elements.Bold>{spell.name}</Elements.Bold>
                { spell.level > 0 
                    ? Localization.toText('spell-level-school', spell.level, spell.schoolName)
                    : `Cantrip, ${spell.schoolName}`
                }
            </Elements.Align>
            <Elements.Align options={{ direction: "v" }}>
                <div><Elements.Bold>Casting</Elements.Bold>
                    {components.map((x, i) => (
                        <span key={i}
                            className={styles.spellComponent} 
                            tooltips={Localization.toText(`spell-component-${x}`)}>
                            {x}
                        </span>
                    ))}
                </div>
                <div className={styles.iconRow}>
                    {spell.timeText} 
                    {spell.ritual && 
                        <Elements.Icon options={{
                            icon: 'ritual',
                            tooltips: Localization.toText('spell-ritual')  
                        }}/>
                    }
                </div>
                <Elements.Bold> Duration </Elements.Bold>
                <div className={styles.iconRow}>
                    {spell.durationText} 
                    {spell.concentration &&
                        <Elements.Icon options={{
                            icon: 'concentration',
                            tooltips: Localization.toText('spell-concentration')  
                        }}/>
                    }
                </div>
            </Elements.Align>
            <Elements.Align options={{ direction: "v" }}>
                <div className={styles.iconRow}>
                    <Elements.Bold>Range/Area</Elements.Bold>
                    {spell.target != TargetType.None &&
                        <Elements.Icon options={{ 
                            icon: spell.area, tooltips: spell.areaName 
                        }}/>
                    }
                </div>
                {spell.target != TargetType.None ? range : '-'}
                <Elements.Bold> Notes </Elements.Bold>
                <div className={styles.iconRow}>
                    {spell.notes.length > 0 ? spell.notes : '-'}
                </div>
            </Elements.Align>
            <Elements.Align options={{ direction: "v", weight: "1.2" }}>
                <div className={styles.iconRow}>
                    <Elements.Bold>HIT/DC </Elements.Bold>
                    {spell.condition == EffectCondition.Hit && 
                        <Elements.Roll 
                            options={{ 
                                mod: spell.conditionModifierValue as any, 
                                desc: `${spell.name} Attack` 
                            }}
                        />
                    }{spell.condition == EffectCondition.Save &&
                        <Elements.Save
                            options={{
                                attr: spell.saveAttr ?? Attribute.STR,
                                dc: String(8 + spell.conditionModifierValue)
                            }}
                        />
                    }{spell.condition == EffectCondition.None && '-'}
                </div>
                {spell.effects.map((effect) => (
                    <EffectRenderer key={effect.id} data={effect} stats={stats} id={variablesKey}/>
                ))}
            </Elements.Align>
        </Elements.Align>
        { (description || components) && <>
            <Elements.Line/>
            { components.length > 0 && spell.componentMaterial && <> 
                <b>Materials: </b> {spell.materials}<br/><Elements.Line/>
            </>}
            { description }
        </>}
    </>
}

export default DetailedSpell;