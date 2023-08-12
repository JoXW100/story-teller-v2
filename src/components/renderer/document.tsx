import React from 'react';
import Elements from 'data/elements';
import { useParser } from 'utils/parser';
import { RendererObject } from 'types/database/editor';
import ICreatureStats from 'types/database/files/iCreatureStats';
import DocumentFile, { IDocumentMetadata } from 'types/database/files/document';
import { FileMetadataQueryResult } from 'types/database/responses';

type DocumentFileRendererProps = React.PropsWithRef<{
    file: DocumentFile
    stats?: ICreatureStats
}>

type DocumentLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IDocumentMetadata>
    stats?: ICreatureStats
}>

const DocumentFileRenderer = ({ file }: DocumentFileRendererProps): JSX.Element => {
    const content = useParser(file.content.text, file.metadata, "$content")
    return <>
        <Elements.Header1 options={{ underline: 'true' }}> 
            {file.metadata?.name} 
        </Elements.Header1>
        { content }
    </>
}

const DocumentLinkRenderer = ({ file }: DocumentLinkRendererProps): JSX.Element => {
    return <>
        <Elements.Header3> {file.metadata?.name} </Elements.Header3>
        { file.metadata?.description }
    </>
}

const DocumentRenderer: RendererObject<DocumentFile> = {
    fileRenderer: DocumentFileRenderer,
    linkRenderer: DocumentLinkRenderer
}

export default DocumentRenderer