import React, { useEffect, useState } from 'react';
import Elements from 'elements';
import Parser, { ParseError } from 'utils/parser';
import { FileData, DocumentContent, DocumentMetadata } from '@types/database';
import styles from 'styles/renderer.module.scss';

export const BuildDocument = (metadata, content) => (
    <>
        <Elements.Header3> {metadata.title} </Elements.Header3>
        { content }
    </>
) 

/**
 * 
 * @param {{ file: FileData<DocumentContent, DocumentMetadata>}} 
 * @returns {JSX.Element}
 */
export const DocumentRenderer = ({ file = {} }) => {
    const [content, setContent] = useState(null)
    
    useEffect(() => {
        Parser.parse(file.content?.text, file.metadata)
        .then((res) => setContent(res))
        .catch((error) => {
            if (error.type === ParseError.type) {
                setContent(
                    <div className={styles.error}> 
                        {error.message} 
                    </div>
                );
            }
            else {
                setContent(null);
                throw error;
            }
        })
    }, [file])

    return <>
        <Elements.Header1 options={{ underline: 'true' }}> 
            {file.metadata?.title} 
        </Elements.Header1>
        { content }
    </>
}

export default DocumentRenderer