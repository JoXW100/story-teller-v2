import { useMemo } from 'react';
import Elements from 'data/elements';
import ItemData from 'data/structures/item';
import Logger from 'utils/logger';
import { useParser } from 'utils/parser';
import { RendererObject } from 'types/database/editor';
import { ItemFile, IItemMetadata } from 'types/database/files/item';
import { FileMetadataQueryResult } from 'types/database/responses';
import styles from 'styles/renderer.module.scss';

type ItemRendererProps = React.PropsWithRef<{
    metadata: IItemMetadata
    variablesKey?: string
}>

type ItemFileRendererProps = React.PropsWithRef<{
    file: ItemFile
}>

type ItemLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IItemMetadata>
}>

const Item = ({ metadata, variablesKey }: ItemRendererProps): JSX.Element => {
    const item = useMemo(() => new ItemData(metadata), [metadata])
    const description = useParser(item.description, item, variablesKey)
    Logger.log("Item", item)
    
    return <>
        <Elements.Header2 options={{ underline: 'true' }}> 
            <span className={styles.rarityLabel} data={item.rarity}>{item.name}</span>
        </Elements.Header2>
        {`${item.subTypeName}, ${item.rarityName}`}
        {item.requiresAttunement && 
            " (Requires Attunement)"
        }
        <Elements.Line/>
        {description}
    </>
}

const ItemFileRenderer = ({ file }: ItemFileRendererProps): JSX.Element => {
    return (
        <div className={styles.rendererBox}>
            <Item metadata={file.metadata}/>
        </div>
    )
}

const ItemLinkRenderer = ({ file }: ItemLinkRendererProps): JSX.Element => {
    return <Item metadata={file.metadata} variablesKey={`$${file.id}.description`}/>
}

const ItemRenderer: RendererObject<ItemFile> = {
    fileRenderer: ItemFileRenderer,
    linkRenderer: ItemLinkRenderer
}

export default ItemRenderer;