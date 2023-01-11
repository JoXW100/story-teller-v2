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
    [FileType.Ability]: AbilityTemplate,
    [FileType.Character]: CharacterTemplate,
    [FileType.Creature]: CreatureTemplate,
    [FileType.Document]: DocumentTemplate,
    [FileType.Encounter]: EncounterTemplate,
    [FileType.Spell]: SpellTemplate
} as { [key: string]: FileTemplate }

export const CreateFileOptions = { 
    [FileType.Ability]: "Ability",
    [FileType.Character]: "Character",
    [FileType.Creature]: "Creature",
    [FileType.Document]: 'Document',
    [FileType.Encounter]: "Encounter",
    [FileType.Spell]: "Spell"
}

export default Templates;