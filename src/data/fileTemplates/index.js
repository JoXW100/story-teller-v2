import AbilityTemplate from './abi.json';
import CreatureTemplate from './cre.json';
import DocumentTemplate from './doc.json';
import CharacterTemplate from './cha.json';
import SpellTemplate from './spe.json';
import StoryTemplate from './sto.json';
import { FileType } from '@enums/database';

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
    [FileType.Spell]: SpellTemplate,
    [FileType.Story]: StoryTemplate
}

export default Templates;