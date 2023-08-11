import Elements from 'data/elements';
import { RendererObject } from 'types/database/editor';
import { FileData, IFileMetadataQueryResult } from 'types/database/files';
import { ClassContent, ClassMetadata } from 'types/database/files/class';

type ClassFileRendererProps = React.PropsWithRef<{
    file: FileData<ClassContent,ClassMetadata,undefined>
}>

type ClassLinkRendererProps = React.PropsWithRef<{
    file: IFileMetadataQueryResult<ClassMetadata>
}>

const ClassFileRenderer = ({ file }: ClassFileRendererProps): JSX.Element => {
    return <>
        <Elements.Header1 options={{ underline: 'true' }}> 
            {file.metadata?.name} 
        </Elements.Header1>
        { file.metadata?.description }
    </>
}

const ClassLinkRenderer = ({ file }: ClassLinkRendererProps): JSX.Element => {
    return <>
        <Elements.Header3> {file.metadata?.name} </Elements.Header3>
        { file.metadata?.description }
    </>
}

const CharacterRenderer: RendererObject<ClassContent,ClassMetadata> = {
    fileRenderer: ClassFileRenderer,
    linkRenderer: ClassLinkRenderer
}

export default CharacterRenderer;