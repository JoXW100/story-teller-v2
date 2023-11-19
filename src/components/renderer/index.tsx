import AbilityRenderer from './ability';
import CharacterRenderer from './character';
import ClassRenderer from './class';
import CreatureRenderer from './creature';
import SpellRenderer from './spell';
import DocumentRenderer from './document';
import EncounterRenderer from './encounter';
import ItemRenderer from './item';
import RaceRenderer from './race';
import { ParseError } from 'utils/parser';
import { asEnum } from 'utils/helpers';
import { RendererObject } from 'types/database/editor';
import { FileType, IFileData, RenderedFileTypes, IFile } from 'types/database/files';
import { FileRendererTemplate } from 'types/templates';
import styles from 'styles/renderer.module.scss';

const Renderers: Record<RenderedFileTypes, RendererObject> = {
    [FileType.Ability]: AbilityRenderer,
    [FileType.Character]: CharacterRenderer,
    [FileType.Class]: ClassRenderer,
    [FileType.Creature]: CreatureRenderer,
    [FileType.Document]: DocumentRenderer,
    [FileType.Encounter]: EncounterRenderer,
    [FileType.Item]: ItemRenderer,
    [FileType.Race]: RaceRenderer,
    [FileType.Spell]: SpellRenderer,
}

export const useRenderer = (template: FileRendererTemplate, file: IFile): JSX.Element => {
    const Renderer: RendererObject<IFileData> = Renderers[asEnum(template?.type, FileType)] ?? DocumentRenderer
    try {
        return file?.id && <Renderer.fileRenderer file={file}/>
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