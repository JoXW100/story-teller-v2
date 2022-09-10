import { useContext, useEffect, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import CreatureRenderer from './creature';
import AbilityRenderer from './ability';
import CharacterRenderer from './character';
import SpellRenderer from './spell';
import Parser, { ParseError } from 'utils/parser';
import styles from 'styles/storyPage/renderer.module.scss';
import { FileType } from '@enums/database';

/** 
 * @param {EditorTemplate<any>} template
 * @param {Object<string, any>} metadata
 * @param {number?} keys
 * @returns {Promise<JSX.Element>}
 */
const BuildRenderer = async (template, metadata = {}) => {
    switch (template.type) {
        case FileType.Creature:
            return <CreatureRenderer metadata={metadata}/>
            
        case FileType.Ability:
            return <AbilityRenderer metadata={metadata}/>

        case FileType.Character:
            return <CharacterRenderer metadata={metadata}/>

        case FileType.Spell:
            return <SpellRenderer metadata={metadata}/>

        case FileType.Document:
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