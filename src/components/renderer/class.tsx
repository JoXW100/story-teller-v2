import Elements from 'data/elements';
import { RendererObject } from 'types/database/editor';
import ClassFile, { IClassMetadata } from 'types/database/files/class';
import { FileMetadataQueryResult } from 'types/database/responses';

type ClassFileRendererProps = React.PropsWithRef<{
    file: ClassFile
}>

type ClassLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IClassMetadata>
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

const CharacterRenderer: RendererObject<ClassFile> = {
    fileRenderer: ClassFileRenderer,
    linkRenderer: ClassLinkRenderer
}

export default CharacterRenderer;