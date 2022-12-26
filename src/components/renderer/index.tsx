import { useMemo } from 'react';
import AbilityRenderer from './ability';
import CreatureRenderer from './creature';
import CharacterRenderer from './character';
import SpellRenderer from './spell';
import DocumentRenderer from './document';
import { ParseError } from 'utils/parser';
import { RendererObject } from 'types/database/editor';
import { FileType, FileData, FileContent, FileMetadata } from 'types/database/files';
import { FileRendererTemplate } from 'types/templates';
import styles from 'styles/renderer.module.scss';

const useRenderer = (template: FileRendererTemplate, file: FileData<any, any>): JSX.Element => {
    if (!file)
        throw Error("File was null in useRenderer: " + String(file?.id))

    const Renderer = useMemo<RendererObject<FileContent,FileMetadata>>(() => {
        switch (template.type) {
            case FileType.Creature:
                return CreatureRenderer
            case FileType.Ability:
                return AbilityRenderer
            case FileType.Character:
                return CharacterRenderer
            case FileType.Spell:
                return SpellRenderer
            case FileType.Document:
                return DocumentRenderer
            default:
                console.error("No renderer for template type exists: " + template.type)
                return DocumentRenderer
        }
    }, [template])
    
    try {
        return <Renderer.fileRenderer file={file}/>
    } catch (error) {
        if (!(error instanceof ParseError)) {
            throw error;
        }
        return <div className={styles.error}>{error.message}</div>;
    }
}

export default useRenderer;
export {
    AbilityRenderer,
    CharacterRenderer,
    CreatureRenderer,
    DocumentRenderer,
    SpellRenderer
}