import { useContext, useEffect, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import CreatureRenderer from './creature';
import AbilityRenderer from './ability';
import Parser, { ParseError } from 'utils/parser';
import { RendererCommand } from '@enums/data';
import styles from 'styles/storyPage/renderer.module.scss';

/** 
 * @param {EditorTemplate<any>} template
 * @param {Object<string, any>} metadata
 * @param {number?} keys
 * @returns {Promise<JSX.Element>}
 */
const BuildRenderer = async (template, metadata = {}) => {
    switch (template.type) {
        case RendererCommand.Creature:
            return <CreatureRenderer metadata={metadata}/>
            
        case RendererCommand.Ability:
            return <AbilityRenderer metadata={metadata}/>

        case RendererCommand.Document:
            return Parser.parse(metadata[template.params.key], metadata)
        
        default:
            return null;
    }
}

/**
 * @param {{ template: RendererTemplate<any> }} 
 * @returns {JSX.Element}
 */
const Renderer = ({ template }) => {
    const [context] = useContext(Context);
    const [state, setState] = useState({ content: null })

    useEffect(() => {
        if (!context.file || !template)
            return;

        BuildRenderer(template, { ...context.file?.metadata, $text: context.file.content.text })
        .then((value) => setState((state) => ({ ...state, content: value })))
        .catch((error) => {
            if (error.type === ParseError.type) {
                setState((state) => ({ 
                    ...state, 
                    content: (
                        <div className={styles.error}> 
                            {error.message} 
                        </div>
                    )
                }));
            }
            else {
                setState(null);
                throw error;
            }
        })
        
    }, [context.file, template])

    return (
        <div className={styles.main}>
            <div className={styles.innerPage}>
                { state.content }
            </div>
        </div>
    )
}

export default Renderer;