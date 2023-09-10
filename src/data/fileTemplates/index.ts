import AbilityTemplate from './abi.json';
import CharacterTemplate from './cha.json';
import ClassTemplate from './cla.json';
import CreatureTemplate from './cre.json';
import DocumentTemplate from './doc.json';
import EncounterTemplate from './enc.json';
import SpellTemplate from './spe.json';
import ItemTemplate from './ite.json';
import SubTemplates from './subTemplates';
import { FileType, RenderedFileTypes } from "types/database/files";
import { FileTemplate, RootTemplateComponent } from 'types/templates';

export {
    AbilityTemplate,
    CharacterTemplate,
    ClassTemplate,
    CreatureTemplate,
    DocumentTemplate,
    EncounterTemplate,
    SpellTemplate,
    ItemTemplate
}

const Templates = {
    [FileType.Ability]: AbilityTemplate as FileTemplate,
    [FileType.Character]: CharacterTemplate as FileTemplate,
    [FileType.Class]: ClassTemplate as FileTemplate,
    [FileType.Creature]: CreatureTemplate as FileTemplate,
    [FileType.Document]: DocumentTemplate as FileTemplate,
    [FileType.Encounter]: EncounterTemplate as FileTemplate,
    [FileType.Item]: ItemTemplate as FileTemplate,
    [FileType.Spell]: SpellTemplate as FileTemplate
} satisfies Record<RenderedFileTypes, FileTemplate>

export const CreateFileOptions = { 
    [FileType.Ability]: "Ability",
    [FileType.Character]: "Character",
    [FileType.Class]: "Class",
    [FileType.Creature]: "Creature",
    [FileType.Document]: 'Document',
    [FileType.Encounter]: "Encounter",
    [FileType.Item]: "Item",
    [FileType.Spell]: "Spell"
} satisfies Record<RenderedFileTypes, string>

type ExtractTemplate<T> = T extends keyof typeof Templates
  ? typeof Templates[T]
  : FileTemplate;

export function getTemplate<T extends string>(key: T): ExtractTemplate<T>
export function getTemplate<T extends keyof typeof Templates>(key: T): ExtractTemplate<T> {
    return Templates[key] as ExtractTemplate<T>;
}

export function getSubTemplate(key: string): RootTemplateComponent {
    return SubTemplates[key] ?? null
}

export default Templates;