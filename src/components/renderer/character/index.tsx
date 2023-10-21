import { useParser } from 'utils/parser';
import Elements from 'data/elements';
import SimpleCharacterRenderer from './simple';
import DetailedCharacterRenderer from './detailed';
import { CharacterFile, ICharacterMetadata } from 'types/database/files/character';
import { FileMetadataQueryResult } from 'types/database/responses';
import { RendererObject } from 'types/database/editor';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: CharacterFile
}>

type CharacterLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<ICharacterMetadata>
}>


const CharacterFileRenderer = (props: CharacterFileRendererProps): JSX.Element => {
    const Renderer = props.file?.metadata?.simple ?? false
        ? SimpleCharacterRenderer
        : DetailedCharacterRenderer

    return <Renderer {...props}/>
}

const CharacterLinkRenderer = ({ file }: CharacterLinkRendererProps): JSX.Element => {
    const description = useParser(file.metadata?.description, file.metadata, `$${file.id}.description`)
    return (
        <Elements.Align>
            <Elements.Image options={{ width: '120px', href: file.metadata?.portrait }}/>
            <Elements.Line/>
            <Elements.Block>
                <Elements.Header3>
                    { file.metadata?.name }
                </Elements.Header3>
                { description }
            </Elements.Block>
        </Elements.Align>
    )
}

const CharacterRenderer: RendererObject<CharacterFile> = {
    fileRenderer: CharacterFileRenderer,
    linkRenderer: CharacterLinkRenderer
}

export default CharacterRenderer;