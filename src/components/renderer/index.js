import { useEffect, useState } from 'react';
import AbilityRenderer from './ability';
import CreatureRenderer from './creature';
import CharacterRenderer from './character';
import SpellRenderer from './spell';
import DocumentRenderer from './document';
import StoryRenderer from './story';
import { ParseError } from 'utils/parser';
import { FileType } from '@enums/database';
import { FileData } from '@types/database';
import styles from 'styles/renderer.module.scss';

/** 
 * @param {EditorTemplate<any>} template
 * @param {FileData<any,any>} file
 * @param {Object<string, any>} metadata
 * @param {number?} keys
 * @returns {Promise<JSX.Element>}
 */
const buildRenderer = async (template, file) => {
    switch (template.type) {
        case FileType.Creature:
            return <CreatureRenderer file={file}/>
            
        case FileType.Ability:
            return <AbilityRenderer file={file}/>

        case FileType.Character:
            return <CharacterRenderer file={file}/>

        case FileType.Spell:
            return <SpellRenderer file={file}/>

        case FileType.Story:
            return <StoryRenderer file={file}/>

        case FileType.Document:
            return <DocumentRenderer file={file}/>
        
        default:
            return null;
    }
}

/**
 * @param {{ template: RendererTemplate<any>, file: FileData<any,any> }} 
 * @returns {{ render: JSX.Element }}
 */
const useRenderer = (template, file) => {
    const [state, setState] = useState(null)
    useEffect(() => {
        if (!template || !file)
            return
        buildRenderer(template, file)
            .then((value) => setState(value))
            .catch((error) => {
                if (error.type === ParseError.type) {
                    setState(<div className={styles.error}>{error.message}</div>);
                } else {
                    setState(null);
                    throw error;
                }
            })
    }, [template, file])
    return state
}

export default useRenderer;
export {
    AbilityRenderer,
    CharacterRenderer,
    CreatureRenderer,
    DocumentRenderer,
    SpellRenderer,
    StoryRenderer
}