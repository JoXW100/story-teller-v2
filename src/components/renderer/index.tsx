import { useMemo } from 'react';
import AbilityRenderer from './ability';
import CharacterRenderer from './character';
import ClassRenderer from './class';
import CreatureRenderer from './creature';
import SpellRenderer from './spell';
import DocumentRenderer from './document';
import EncounterRenderer from './encounter';
import { ParseError } from 'utils/parser';
import Logger from 'utils/logger';
import { RendererObject } from 'types/database/editor';
import { FileType, IFile } from 'types/database/files';
import { FileRendererTemplate } from 'types/templates';
import styles from 'styles/renderer.module.scss';

const useRenderer = (template: FileRendererTemplate, file: IFile): JSX.Element => {
    if (!file)
        throw Error("File was null in useRenderer: " + String(file?.id))

    const Renderer = useMemo<RendererObject>(() => {
        switch (template?.type) {
            case FileType.Ability:
                return AbilityRenderer
            case FileType.Character:
                return CharacterRenderer
            case FileType.Class:
                return ClassRenderer
            case FileType.Creature:
                return CreatureRenderer
            case FileType.Spell:
                return SpellRenderer
            case FileType.Document:
                return DocumentRenderer
            case FileType.Encounter:
                return EncounterRenderer
            default:
                Logger.throw("useRenderer", new Error("No renderer for template type exists: " + template.type))
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