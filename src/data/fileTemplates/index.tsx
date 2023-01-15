import AbilityTemplate from './abi.json';
import CreatureTemplate from './cre.json';
import DocumentTemplate from './doc.json';
import CharacterTemplate from './cha.json';
import EncounterTemplate from './enc.json';
import SpellTemplate from './spe.json';
import StoryTemplate from './sto.json';
import { FileType } from "types/database/files";
import { FileTemplate } from 'types/templates';

export {
    AbilityTemplate,
    CreatureTemplate,
    DocumentTemplate,
    CharacterTemplate,
    EncounterTemplate,
    SpellTemplate,
    StoryTemplate
}

const Templates = {
    [FileType.Ability]: AbilityTemplate as FileTemplate,
    [FileType.Character]: CharacterTemplate as FileTemplate,
    [FileType.Creature]: CreatureTemplate as FileTemplate,
    [FileType.Document]: DocumentTemplate as FileTemplate,
    [FileType.Encounter]: EncounterTemplate as FileTemplate,
    [FileType.Spell]: SpellTemplate as FileTemplate,
} satisfies Partial<Record<FileType, FileTemplate>>

export const CreateFileOptions = { 
    [FileType.Ability]: "Ability",
    [FileType.Character]: "Character",
    [FileType.Creature]: "Creature",
    [FileType.Document]: 'Document',
    [FileType.Encounter]: "Encounter",
    [FileType.Spell]: "Spell"
} satisfies Partial<Record<FileType, string>>

export default Templates;