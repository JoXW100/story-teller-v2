import React, { useEffect, useMemo, useState } from 'react';
import Elements from 'elements';
import Parser, { ParseError } from 'utils/parser';
import styles from 'styles/storyPage/renderer.module.scss';

export const BuildDocument = (metadata, content) => (
    <>
        <Elements.Header3> {metadata.title} </Elements.Header3>
        { content }
    </>
) 

export const DocumentRenderer = ({ metadata = {} }) => {
    const [content, setContent] = useState(null)
    
    useEffect(() => {
        Parser.parse(metadata.$text, metadata)
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
    }, [metadata])

    return <>
        <Elements.Header1 options={{ underline: 'true' }}> 
            {metadata.title} 
        </Elements.Header1>
        { content }
    </>
}

export default DocumentRenderer