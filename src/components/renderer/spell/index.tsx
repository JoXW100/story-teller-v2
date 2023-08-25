import { useState } from 'react';
import { RendererObject } from 'types/database/editor';
import ICreatureStats from 'types/database/files/iCreatureStats';
import SpellFile, { ISpellMetadata } from 'types/database/files/spell';
import { FileMetadataQueryResult } from 'types/database/responses';
import styles from 'styles/renderer.module.scss';
import DetailedSpell from './detailed';
import SimpleSpell from './simple';

type SpellFileRendererProps = React.PropsWithRef<{
    file: SpellFile
    stats?: ICreatureStats
}>

type SpellLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<ISpellMetadata>
    stats?: ICreatureStats
}>

type SpellToggleRendererProps = React.PropsWithRef<{
    metadata: ISpellMetadata, 
    stats: ICreatureStats,
    isOpen?: boolean
}>

const SpellFileRenderer = ({ file, stats = {} }: SpellFileRendererProps): JSX.Element => (
    <SpellToggleRenderer metadata={file.metadata} stats={stats} isOpen={true}/>
)

export const SpellToggleRenderer = ({ metadata, stats, isOpen = false }: SpellToggleRendererProps): JSX.Element => {
    const [open, setOpen] = useState(isOpen);

    const handleClick = () => {
        setOpen(!open);
    }

    const SpellRenderer = open 
        ? DetailedSpell
        : SimpleSpell

    return (
        <div className={styles.spell} onClick={handleClick}>
            <SpellRenderer metadata={metadata} stats={stats} variablesKey="description"/>
        </div>
    )
}

const SpellLinkRenderer = ({ file, stats }: SpellLinkRendererProps): JSX.Element => {
    return <SimpleSpell metadata={file.metadata} stats={stats} variablesKey={`$${file.id}.description`}/>
}

const SpellRenderer: RendererObject<SpellFile> = {
    fileRenderer: SpellFileRenderer,
    linkRenderer: SpellLinkRenderer
}

export default SpellRenderer;