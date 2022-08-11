import { useContext, useEffect, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import Parser, { ParseError } from 'utils/parser';
import styles from 'styles/storyPage/renderer.module.scss';

/**
 * 
 * @returns {JSX.Element}
 */
const Renderer = () => {
    const [context] = useContext(Context);
    const [state, setState] = useState({
        content: null
    })

    useEffect(() => {
        Parser.parse(context.file?.content.text)
        .then((value) => setState((state) => ({ ...state, content: value })))
        .catch((error) => {
            if (error.type === ParseError.type) {
                setState((state) => ({ 
                    ...state, 
                    content: <div className={styles.error}> {error.message} </div>
                }));
            }
            else {
                throw error;
            }
        })
    }, [context.file])

    return (
        <div className={styles.main}>
            <div className={styles.innerPage}>
                { state.content }
            </div>
        </div>
    )
}

export default Renderer;