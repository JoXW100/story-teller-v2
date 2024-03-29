import React, { useMemo, useState } from 'react';
import Elements from 'data/elements';
import AbilityData from 'data/structures/ability';
import EffectRenderer from '../effect';
import ChargesRenderer from '../chargeToggle';
import { useParser } from 'utils/parser';
import Logger from 'utils/logger';
import { AbilityFile, IAbilityMetadata } from 'types/database/files/ability';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { RendererObject } from 'types/database/editor';
import { IParserMetadata, RollMode } from 'types/elements';
import { FileMetadataQueryResult } from 'types/database/responses';
import { AbilityType, Attribute, EffectCondition } from 'types/database/dnd';
import { RollType } from 'types/dice';
import styles from 'styles/renderer.module.scss';


type AbilityFileRendererProps = React.PropsWithRef<{
    file: AbilityFile
    stats?: ICreatureStats
}>

type AbilityLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IAbilityMetadata>
    stats?: ICreatureStats
}>

type AbilityToggleRendererProps = React.PropsWithRef<{
    metadata: IAbilityMetadata & IParserMetadata
    stats?: ICreatureStats
    expendedCharges?: number
    setExpendedCharges?: (value: number) => void
    open?: boolean
}>

type AbilityProps = React.PropsWithRef<{ 
    metadata: IAbilityMetadata, 
    stats: ICreatureStats
    expendedCharges: number
    setExpendedCharges: (value: number) => void
    open: boolean
    variablesKey: string
}>

const Ability = ({ metadata, stats, open, variablesKey, expendedCharges, setExpendedCharges }: AbilityProps): JSX.Element => {
    const ability = useMemo(() => new AbilityData(metadata, stats), [metadata, stats])
    const description = useParser(ability.description, ability, variablesKey)
    const charges = ability.charges.slice(0, Math.max(stats.level ?? 1, 1)).findLast(c => c != 0) ?? 0
    Logger.log("Ability", ability)

    switch(ability.type) {
        case AbilityType.Feature:
        default:
            return <>
                <Elements.Align options={{ direction: "hc" }}>
                    <Elements.Header3>{ ability.name }</Elements.Header3>
                    <Elements.Fill/>
                    <ChargesRenderer 
                        charges={charges}
                        expended={expendedCharges} 
                        setExpended={setExpendedCharges}/>
                </Elements.Align>
                { open && description }
            </>
        case AbilityType.RangedAttack:
        case AbilityType.RangedWeapon:
        case AbilityType.MeleeAttack:
        case AbilityType.MeleeWeapon:
        case AbilityType.ThrownWeapon:
            return <>
                <Elements.Align>
                    <div style={{ width: '50%'}}>
                        <Elements.Bold>{ability.name}</Elements.Bold><br/>
                        {ability.typeName}<br/>
                        <Elements.Align>
                            <ChargesRenderer 
                                charges={charges} 
                                expended={expendedCharges} 
                                setExpended={setExpendedCharges}/>
                        </Elements.Align>
                    </div>
                    <Elements.Line/>
                    <div>
                        { ability.type == AbilityType.RangedAttack 
                          || ability.type == AbilityType.RangedWeapon ?
                            <div> 
                                <Elements.Bold>Range </Elements.Bold> 
                                {`${ability.range} (${ability.rangeLong}) ft`}
                            </div>
                            :
                            <div> 
                                <Elements.Bold>Reach </Elements.Bold> 
                                {`${ability.range} ft`}
                            </div>
                        }{ ability.type == AbilityType.ThrownWeapon &&
                            <div className={styles.iconRow}> 
                                <Elements.Bold>Range </Elements.Bold> 
                                {`${ability.rangeThrown} (${ability.rangeLong}) ft`}
                            </div>
                        }{ ability.condition == EffectCondition.Hit &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Roll 
                                    options={{ 
                                        mode: RollMode.Mod,
                                        mod: String(ability.conditionModifierValue),
                                        type: RollType.Attack, 
                                        desc: `${ability.name} Attack`,
                                        tooltips: `Roll ${ability.name} Attack`,
                                        critRange: String(ability.stats.critRange)
                                    }}
                                />
                            </div>
                        }{ ability.condition == EffectCondition.Save &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Save
                                    options={{
                                        attr: ability.saveAttr ?? Attribute.STR,
                                        value: String(ability.conditionSaveValue)
                                    }}
                                />
                            </div>
                        }
                        { ability.effects.map((effect) => (
                            <EffectRenderer 
                                key={effect.id} 
                                data={effect}
                                stats={stats}
                                desc={`${ability.name} ${effect.label ?? "Effect"}`}
                                tooltips={`Roll ${ability.name} ${effect.label ?? "Effect"}`}/>
                        ))}{ ability.notes.length > 0 && 
                            <div> 
                                <Elements.Bold>Notes </Elements.Bold> 
                                {ability.notes} 
                            </div>
                        }
                    </div>
                </Elements.Align>
                { open && description && <>
                    <Elements.Line/>
                    { description }
                </>}
            </>
    }
}

const AbilityFileRenderer = ({ file, stats = {} }: AbilityFileRendererProps): JSX.Element => {
    const [expended, setExpended] = useState<number>(0)
    return (
        <AbilityToggleRenderer 
            metadata={file.metadata} 
            stats={stats} 
            expendedCharges={expended}
            setExpendedCharges={setExpended}
            open={true}/>
    )
}

export const AbilityToggleRenderer = ({ metadata, stats = {}, expendedCharges = 0, setExpendedCharges = null, open = false }: AbilityToggleRendererProps): JSX.Element => {
    const [isOpen, setOpen] = useState(open);
    const data = (metadata?.description?.length ?? 0) > 0
        ? isOpen ? "open" : "closed"
        : "none"

    const handleClick = () => {
        setOpen(!isOpen)
    }

    return (
        <div 
            className={styles.rendererBox} 
            data={data} 
            onClick={handleClick}>
            <Ability 
                metadata={metadata} 
                stats={stats} 
                open={isOpen} 
                variablesKey='description'
                expendedCharges={expendedCharges}
                setExpendedCharges={setExpendedCharges}/>
        </div>
    )
}

const AbilityLinkRenderer = ({ file, stats = {} }: AbilityLinkRendererProps): JSX.Element => {
    const [expended, setExpended] = useState<number>(0)
    return (
        <Ability 
            metadata={file.metadata} 
            stats={stats} 
            open={true} 
            variablesKey={`$${file.id}.description`}
            expendedCharges={expended}
            setExpendedCharges={setExpended}/>
    )
}

const AbilityRenderer: RendererObject<AbilityFile> = {
    fileRenderer: AbilityFileRenderer,
    linkRenderer: AbilityLinkRenderer
}

export default AbilityRenderer;