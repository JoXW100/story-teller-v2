import AbilityRenderer from './ability';
import CharacterRenderer from './character';
import ClassRenderer from './class';
import CreatureRenderer from './creature';
import SpellRenderer from './spell';
import DocumentRenderer from './document';
import EncounterRenderer from './encounter';
import ItemRenderer from './item';
import { ParseError } from 'utils/parser';
import { asEnum } from 'utils/helpers';
import { RendererObject } from 'types/database/editor';
import { File, FileType } from 'types/database/files';
import { FileRendererTemplate } from 'types/templates';
import styles from 'styles/renderer.module.scss';

const Renderers: Record<FileType, RendererObject> = {
    [FileType.Ability]: AbilityRenderer,
    [FileType.Character]: CharacterRenderer,
    [FileType.Class]: ClassRenderer,
    [FileType.Creature]: CreatureRenderer,
    [FileType.Spell]: SpellRenderer,
    [FileType.Document]: DocumentRenderer,
    [FileType.Encounter]: EncounterRenderer,
    [FileType.Item]: ItemRenderer,
    [FileType.Empty]: null,
    [FileType.Root]: null,
    [FileType.Folder]: null,
    [FileType.LocalFolder]: null,
    [FileType.LocalImage]: null
}

export const useRenderer = (template: FileRendererTemplate, file: File<any>): JSX.Element => {
    if (!file)
        throw Error("File was null in useRenderer: " + String(file?.id))

    const Renderer = Renderers[asEnum(template?.type, FileType)] ?? DocumentRenderer
    
    try {
        return <Renderer.fileRenderer file={file}/>
    } catch (error: unknown) {
        if (error instanceof ParseError) {
            return (
                <div className={styles.error}>
                    {error.message}
                </div>
            )
        }
        throw error;
    }
}

export default Renderers
export {
    AbilityRenderer,
    CharacterRenderer,
    ClassRenderer,
    CreatureRenderer,
    EncounterRenderer,
    DocumentRenderer,
    SpellRenderer,
    ItemRenderer
}