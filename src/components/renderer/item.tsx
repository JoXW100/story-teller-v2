import { useMemo } from 'react';
import Elements from 'data/elements';
import ItemData from 'data/structures/item';
import Logger from 'utils/logger';
import { useParser } from 'utils/parser';
import { RendererObject } from 'types/database/editor';
import ICreatureStats from 'types/database/files/iCreatureStats';
import ItemFile, { IItemMetadata } from 'types/database/files/item';
import { FileMetadataQueryResult } from 'types/database/responses';

type ItemRendererProps = React.PropsWithRef<{
    metadata: IItemMetadata
    stats: ICreatureStats
    variablesKey?: string
}>

type ItemFileRendererProps = React.PropsWithRef<{
    file: ItemFile
    stats?: ICreatureStats
}>

type ItemLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IItemMetadata>
    stats?: ICreatureStats
}>

const Item = ({ metadata, stats, variablesKey }: ItemRendererProps): JSX.Element => {
    const item = useMemo(() => new ItemData(metadata, stats), [metadata, stats])
    const description = useParser(item.description, item, variablesKey)
    Logger.log("Item", item)
    
    return <>
        <Elements.Header1 options={{ underline: 'true' }}> 
            {item.name} 
        </Elements.Header1>
        {`${item.armorTypeName}, ${item.rarityName}${item.requiresAttunement ? " (Requires Attunement)" : ''}`}
        <Elements.Line/>
        {description}
    </>
}

const ItemFileRenderer = ({ file, stats = {} }: ItemFileRendererProps): JSX.Element => {
    return <Item metadata={file.metadata} stats={stats}/>
}

const ItemLinkRenderer = ({ file, stats = {} }: ItemLinkRendererProps): JSX.Element => {
    return <Item metadata={file.metadata} stats={stats} variablesKey={`$${file.id}.description`}/>
}

const ItemRenderer: RendererObject<ItemFile> = {
    fileRenderer: ItemFileRenderer,
    linkRenderer: ItemLinkRenderer
}

export default ItemRenderer;