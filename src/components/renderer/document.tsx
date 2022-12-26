import React from 'react';
import Elements from 'elements';
import { useParser } from 'utils/parser';
import { DocumentContent, DocumentMetadata } from 'types/database/files/document';
import { FileData, FileMetadataQueryResult } from 'types/database/files';
import { CharacterStats } from 'types/database/files/character';
import { RendererObject } from 'types/database/editor';

type DocumentFileRendererProps = React.PropsWithRef<{
    file: FileData<DocumentContent,DocumentMetadata>
    stats?: CharacterStats
}>

type DocumentLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<DocumentMetadata>
    stats?: CharacterStats
}>

const DocumentFileRenderer = ({ file }: DocumentFileRendererProps): JSX.Element => {
    const content = useParser(file.content.text, file.metadata)
    return <>
        <Elements.Header1 options={{ underline: 'true' }}> 
            {file.metadata?.title} 
        </Elements.Header1>
        { content }
    </>
}

const DocumentLinkRenderer = ({ file }: DocumentLinkRendererProps): JSX.Element => {
    return <>
        <Elements.Header3> {file.metadata?.title} </Elements.Header3>
        { file.metadata?.content }
    </>
}

const DocumentRenderer: RendererObject<DocumentContent,DocumentMetadata> = {
    fileRenderer: DocumentFileRenderer,
    linkRenderer: DocumentLinkRenderer
}

export default DocumentRenderer