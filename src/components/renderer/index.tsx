import AbilityRenderer from './ability';
import CharacterRenderer from './character';
import ClassRenderer from './class';
import CreatureRenderer from './creature';
import SpellRenderer from './spell';
import DocumentRenderer from './document';
import EncounterRenderer from './encounter';
import ItemRenderer from './item';
import { ParseError } from 'utils/parser';
import { RendererObject } from 'types/database/editor';
import { FileType, IFile } from 'types/database/files';
import { FileRendererTemplate } from 'types/templates';
import styles from 'styles/renderer.module.scss';
import { asEnum } from 'utils/helpers';

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
    [FileType.Folder]: null
}

export const useRenderer = (template: FileRendererTemplate, file: IFile): JSX.Element => {
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