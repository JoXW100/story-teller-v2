import AbilityTemplate from './abi.json';
import CreatureTemplate from './cre.json';
import DocumentTemplate from './doc.json';
import CharacterTemplate from './cha.json';
import SpellTemplate from './spe.json';
import StoryTemplate from './sto.json';
import { FileType } from "types/database/files";
import { FileTemplate } from 'types/templates';

export {
    AbilityTemplate,
    CreatureTemplate,
    DocumentTemplate,
    CharacterTemplate,
    SpellTemplate,
    StoryTemplate
}

const Templates = {
    [FileType.Ability]: AbilityTemplate,
    [FileType.Creature]: CreatureTemplate,
    [FileType.Document]: DocumentTemplate,
    [FileType.Character]: CharacterTemplate,
    [FileType.Spell]: SpellTemplate
} as { [key: string]: FileTemplate }

export const CreateFileOptions = { 
    [FileType.Document]: 'Document', 
    [FileType.Creature]: "Creature", 
    [FileType.Ability]: "Ability",
    [FileType.Character]: "Character",
    [FileType.Spell]: "Spell",
    [FileType.Spell]: "Spell"
}

export default Templates;