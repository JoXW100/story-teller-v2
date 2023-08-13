// @ts-nocheck
import { Collection, Db } from "mongodb";
import Logger from "utils/logger";
import { failure, success } from "./database";
import { DBData, DBFile, DBFolder, DBItem, DBResponse, DBRoot } from "types/database";
import { FileType } from "types/database/files";
import { KeysOf } from "types";
import AbilityFile from "types/database/files/ability";
import CreatureFile from "types/database/files/creature";
import CharacterFile from "types/database/files/character";
import DocumentFile from "types/database/files/document";
import EncounterFile from "types/database/files/encounter";
import SpellFile from "types/database/files/spell";
import ClassFile from "types/database/files/class";
import { Alignment, Skill } from "types/database/dnd";

type DBAbility = DBData & AbilityFile
type DBCreature = DBData & CreatureFile
type DBCharacter = DBData & CharacterFile
type DBDocument = DBData & DocumentFile
type DBEncounter = DBData & EncounterFile
type DBSpell = DBData & SpellFile
type DBClass = DBData & ClassFile

function addIfExists(property: string): {} {
    return { 
        $cond: {
            if: { $eq: [{ $type: property }, 'missing'] }, // Value does not exist
            then: '$$REMOVE',
            else: property
        }
    }
} 

function addIfExistsAndMap(property: string, map: Record<any, any>): {} {
    return { 
        $cond: {
            if: { $eq: [{ $type: property }, 'missing'] }, // Value does not exist
            then: '$$REMOVE',
            else: { 
                $let: {
                    vars: { mapArray: { $objectToArray: map } },
                    in: {
                        $let: {
                            vars: {
                                match: {
                                    $arrayElemAt: [
                                        { $filter: { 
                                            input: '$$mapArray', 
                                            cond: { $eq: ['$$this.k', property] } 
                                        }},
                                        0
                                    ]
                                }
                            },
                            in: '$$match.v'
                        }
                    }
                }
            }
        }
    }
}

function addKeysInIfExists(property: string) {
    return { 
        $cond: {
            if: { $eq: [{ $type: property }, "object"] },
            then: {
                $map: {
                    input: { $objectToArray: property },
                    as: "item",
                    in: "$$item.k"
                }
            },
            else: '$$REMOVE'
        }
    }
} 

function addKeysInIfExistsAndMap(property: string, map: Record<any, any>) {
    return { 
        $cond: {
            if: { $eq: [{ $type: property }, 'object'] },
            then: {
                $map: {
                    input: { $objectToArray: property },
                    as: 'item',
                    in: {
                        $let: { 
                            vars: { mapArray: { $objectToArray: map } },
                            in: {
                                $let: {
                                    vars: {
                                        match: {
                                            $arrayElemAt: [
                                                { $filter: { 
                                                    input: '$$mapArray', 
                                                    cond: { $eq: ['$$this.k', '$$item.k'] } 
                                                }},
                                                0
                                            ]
                                        }
                                    },
                                    in: '$$match.v'
                                }
                            }
                        }
                    }
                }
            },
            else: '$$REMOVE'
        }
    }
}

const SkillMap = {
    0: Skill.Acrobatics,
    1: Skill.AnimalHandling,
    2: Skill.Arcana,
    3: Skill.Athletics,
    4: Skill.Deception,
    5: Skill.History,
    6: Skill.Insight,
    7: Skill.Intimidation,
    8: Skill.Investigation,
    9: Skill.Medicine,
    10: Skill.Nature,
    11: Skill.Perception, 
    12: Skill.Performance,
    13: Skill.Persuasion,
    14: Skill.Religion,
    15: Skill.SleightOfHand,
    16: Skill.Stealth,
    17: Skill.Survival
} satisfies Record<number, Skill>

const AlignmentMap = {
    0: Alignment.None,
    1: Alignment.Unaligned,
    2: Alignment.Any,
    3: Alignment.LawfulGood,
    4: Alignment.LawfulNeutral,
    5: Alignment.LawfulEvil,
    6: Alignment.NeutralGood,
    7: Alignment.TrueNeutral,
    8: Alignment.NeutralEvil,
    9: Alignment.ChaoticGood,
    10: Alignment.ChaoticNeutral,
    11: Alignment.ChaoticEvil
} satisfies Record<number, Alignment>

class DebugInterface
{
    private storiesCollection: Collection;
    private filesCollection: Collection<DBItem>;
    private backupCollection: Collection<DBItem>;
    private tmpCollection: Collection<DBItem>;

    /** Creates a new DBRequestInterface */
    constructor(database: Db) {
        this.storiesCollection = database.collection('stories');
        this.filesCollection = database.collection('files');
        this.backupCollection = database.collection('dev_files_backup')
        this.tmpCollection = database.collection('dev_files_tmp')
    }

    async debug(): Promise<DBResponse<any>> {
        let responses: DBResponse<any>[] = []
        //responses.push(await this.clearBackup()); // Not necessary
        //responses.push(await this.transferToBackup());
        //responses.push(await this.clearTmp()); // Not necessary
        //responses.push(await this.convert());
        //responses.push(await this.transferFixedRoots());
        //responses.push(await this.transferFixedFolders());
        //responses.push(await this.transferFixedAbilities());
        //responses.push(await this.transferFixedCharacters());
        //responses.push(await this.transferFixedClasses());
        //responses.push(await this.transferFixedCreatures());
        //responses.push(await this.transferFixedDocuments());
        //responses.push(await this.transferFixedEncounters());
        //responses.push(await this.transferFixedSpells());
        //responses.push(await this.clearFiles()); // Not necessary
        //responses.push(await this.transferToFiles());
        return success(responses);
    }

    async clearTmp(): Promise<DBResponse<number>> {
        let res = await this.tmpCollection.deleteMany({})
        Logger.log('debug.clearTmp', res)
        return success(res.deletedCount)
    }

    async clearBackup(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.deleteMany({})
        Logger.log('debug.clearBackup', res)
        return success(res.deletedCount)
    }
    
    async clearFiles(): Promise<DBResponse<number>> {
        let res = await this.filesCollection.deleteMany({})
        Logger.log('debug.clearBackup', res)
        return success(res.deletedCount)
    }

    async transferToBackup(): Promise<DBResponse<number>> {
        let res = await this.filesCollection.aggregate([
            { $match: {} },
            { $out: 'dev_files_backup' },
        ]).toArray()

        Logger.log('debug.transfer', res)
        return success(res.length)
    }

    async transferToFiles(): Promise<DBResponse<number>> {
        let res = await this.tmpCollection.aggregate([
            { $match: { 
                type: { $ne: FileType.Empty } 
            } satisfies Partial<KeysOf<DBItem>>},
            { $out: 'files' },
        ]).toArray()

        Logger.log('debug.transfer', res)
        return success(res.length)
    }

    async convert(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: {}},
            { $project: {
                result: {
                    $switch: {
                        branches: [
                            {
                                case: { $eq: ['$type', FileType.Root]},
                                then: this.rootProjection
                            }, 
                            {
                                case: { $eq: ['$type', FileType.Folder]},
                                then: this.foldersProjection
                            }, 
                            {
                                case: { $eq: ['$type', FileType.Ability]},
                                then: this.abilityProjection
                            }, 
                            {
                                case: { $eq: ['$type', FileType.Character]},
                                then: this.characterProjection
                            }, 
                            {
                                case: { $eq: ['$type', FileType.Creature]},
                                then: this.creatureProjection
                            }, 
                            {
                                case: { $eq: ['$type', FileType.Document]},
                                then: this.documentProjection
                            }, 
                            {
                                case: { $eq: ['$type', FileType.Encounter]},
                                then: this.encounterProjection
                            }, 
                            {
                                case: { $eq: ['$type', FileType.Spell]},
                                then: this.spellProjection
                            }, 
                            {
                                case: { $eq: ['$type', FileType.Class]},
                                then: this.classProjection
                            }
                        ],
                        default: {
                            type: FileType.Empty,
                            was: '$type'
                        }
                    }
                }
            } },
            { $replaceRoot: { 
                newRoot: '$result'
            }},
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.convert', res)
        return success(res.length)
    }

    async transferFixedRoots(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Root 
            } satisfies Partial<KeysOf<DBFile>> },
            { $project: this.rootProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedRoots', res)
        return success(res.length)
    }

    async transferFixedFolders(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Folder 
            } satisfies Partial<KeysOf<DBFile>> },
            { $project: this.foldersProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedFolders', res)
        return success(res.length)
    }

    async transferFixedAbilities(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Ability
            } satisfies Partial<KeysOf<DBAbility>> },
            { $project: this.abilityProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedAbilities', res)
        return success(res.length)
    }

    async transferFixedCharacters(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Character
            } satisfies Partial<KeysOf<DBCharacter>> },
            { $project: this.characterProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedCharacters', res)
        return success(res.length)
    }

    async transferFixedCreatures(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Creature
            } satisfies Partial<DBCreature> },
            { $project: this.creatureProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedCreatures', res)
        return success(res.length)
    }

    async transferFixedDocuments(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Document 
            } satisfies Partial<DBDocument> },
            { $project: this.documentProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedDocuments', res)
        return success(res.length)
    }

    async transferFixedEncounters(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Encounter
            } satisfies Partial<DBEncounter> },
            { $project: this.encounterProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedEncounters', res)
        return success(res.length)
    }

    async transferFixedSpells(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Spell
            } satisfies Partial<DBSpell> },
            { $project: this.spellProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedSpells', res)
        return success(res.length)
    }

    async transferFixedClasses(): Promise<DBResponse<number>> {
        let res = await this.backupCollection.aggregate([
            { $match: { 
                type: FileType.Class
            } satisfies Partial<DBClass> },
            { $project: this.classProjection },
            { $out: 'dev_files_tmp' },
        ]).toArray()

        Logger.log('debug.transferFixedClasses', res)
        return success(res.length)
    }

    private get rootProjection(): KeysOf<DBRoot> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: { $ifNull: ['$_holderId', null] },
            type: FileType.Root,
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBRoot>
    }

    private get foldersProjection(): KeysOf<DBFolder> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: '$_holderId',
            type: FileType.Folder,
            content: {
                name: { $ifNull: ['$content.name', ""] },
                open: { $ifNull: ['$content.open', false] }
            } satisfies KeysOf<DBFolder["content"]>,
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBFolder>
    }

    private get abilityProjection(): KeysOf<DBAbility> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: '$_holderId',
            type: '$type',
            content: {
                name: { $ifNull: ['$content.name', ""] },
                public: { $ifNull: ['$content.metadata.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<Required<DBAbility["content"]>>,
            metadata: {
                name: { $ifNull: ['$content.metadata.name', ""] },
                description: { $ifNull: ['$content.metadata.description', ""] },
                type: addIfExists('$content.metadata.type'),
                versatile: addIfExists('$content.metadata.versatile'),
                action: addIfExists('$content.metadata.action'),
                notes: addIfExists('$content.metadata.notes'),
                condition: addIfExists('$content.metadata.condition'),
                saveAttr: addIfExists('$content.metadata.saveAttr'),
                damageType: addIfExists('$content.metadata.damageType'),
                target: addIfExists('$content.metadata.target'),
                range: addIfExists('$content.metadata.range'),
                rangeLong: addIfExists('$content.metadata.rangeLong'),
                rangeThrown: addIfExists('$content.metadata.rangeThrown'),
                effectVersatileDice: addIfExists('$content.metadata.effectVersatileDice'),
                conditionScaling: addIfExists('$content.metadata.conditionScaling'),
                conditionProficiency: addIfExists('$content.metadata.conditionProficiency'),
                conditionModifier: addIfExists('$content.metadata.conditionModifier'),
                effectText: addIfExists('$content.metadata.effectText'),
                effectScaling: addIfExists('$content.metadata.effectScaling'),
                effectProficiency: addIfExists('$content.metadata.effectProficiency'),
                effectModifier: addIfExists('$content.metadata.effectModifier'),
                effectDice: addIfExists('$content.metadata.effectDice'),
                effectDiceNum: addIfExists('$content.metadata.effectDiceNum'),
                modifiers: addIfExists('$content.metadata.modifiers')
            } satisfies KeysOf<Required<DBAbility["metadata"]>>,
            storage: { $ifNull: ['$content.storage', {} satisfies Required<DBAbility["storage"]> ] },
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBAbility>
    }

    private get characterProjection(): KeysOf<DBCharacter> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: '$_holderId',
            type: '$type',
            content: {
                name: { $ifNull: ['$content.name', ""] },
                public: { $ifNull: ['$content.metadata.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<Required<DBCharacter["content"]>>,
            metadata: {
                name: { $ifNull: ['$content.metadata.name', ""] },
                description: { $ifNull: ['$content.metadata.description', ""] },
                simple: addIfExists('$content.metadata.simple'),
                gender: addIfExists('$content.metadata.gender'),
                age: addIfExists('$content.metadata.age'),
                height: addIfExists('$content.metadata.height'),
                weight: addIfExists('$content.metadata.weight'),
                raceText: addIfExists('$content.metadata.raceText'),
                occupation: addIfExists('$content.metadata.occupation'),
                appearance: addIfExists('$content.metadata.appearance'),
                history: addIfExists('$content.metadata.history'),
                notes: addIfExists('$content.metadata.notes'),
                type: addIfExists('$content.metadata.type'),
                size: addIfExists('$content.metadata.size'),
                alignment: addIfExistsAndMap('$content.metadata.alignment', AlignmentMap),
                portrait: addIfExists('$content.metadata.portrait'),
                abilities: addIfExists('$content.metadata.abilities'),
                challenge: addIfExists('$content.metadata.challenge'),
                xp: addIfExists('$content.metadata.xp'),
                level: addIfExists('$content.metadata.level'),
                classFile: addIfExists('$content.metadata.classFile'),
                hitDice: addIfExists('$content.metadata.hitDice'),
                health: addIfExists('$content.metadata.health'),
                ac: addIfExists('$content.metadata.ac'),
                proficiency: addIfExists('$content.metadata.proficiency'),
                initiative: addIfExists('$content.metadata.initiative'),
                str: addIfExists('$content.metadata.str'),
                dex: addIfExists('$content.metadata.dex'),
                con: addIfExists('$content.metadata.con'),
                int: addIfExists('$content.metadata.int'),
                wis: addIfExists('$content.metadata.wis'),
                cha: addIfExists('$content.metadata.cha'),
                critRange: addIfExists('$content.metadata.critRange'),
                resistances: addIfExists('$content.metadata.resistances'),
                vulnerabilities: addIfExists('$content.metadata.vulnerabilities'),
                advantages: addIfExists('$content.metadata.advantages'),
                dmgImmunities: addIfExists('$content.metadata.dmgImmunities'),
                conImmunities: addIfExists('$content.metadata.conImmunities'),
                speed: addIfExists('$content.metadata.speed'),
                senses: addIfExists('$content.metadata.sensesThatDoNotExist'), // Does not exist
                proficienciesSave: addKeysInIfExists('$content.metadata.saves'),
                proficienciesSkill: addKeysInIfExistsAndMap('$content.metadata.skills', SkillMap),
                proficienciesArmor: addIfExists('$content.metadata.proficienciesArmor'),
                proficienciesWeapon: addIfExists('$content.metadata.proficienciesWeapon'),
                proficienciesTool: addIfExists('$content.metadata.proficienciesTool'),
                proficienciesLanguage: addIfExists('$content.metadata.proficienciesLanguage'),
                spellAttribute: addIfExists('$content.metadata.spellAttribute'),
                spellSlots: addIfExists('$content.metadata.spellSlots'),
                spells: addIfExists('$content.metadata.spells'),
            } satisfies KeysOf<Required<DBCharacter["metadata"]>>,
            storage: { 
                classData: { $ifNull: ['$content.storage.classData', {} satisfies Required<DBCharacter["storage"]["classData"]> ] }
            } satisfies KeysOf<Required<DBCharacter["storage"]>>,
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBCharacter>
    }

    private get creatureProjection(): KeysOf<DBCreature> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: '$_holderId',
            type: '$type',
            content: {
                name: { $ifNull: ['$content.name', ""] },
                public: { $ifNull: ['$content.metadata.public', false] },
                text: { $ifNull: ['$content.text', ""] }
            } satisfies KeysOf<Required<DBCreature["content"]>>,
            metadata: {
                name: { $ifNull: ['$content.metadata.name', ""] },
                description: { $ifNull: ['$content.metadata.description', ""] },
                type: addIfExists('$content.metadata.type'),
                size: addIfExists('$content.metadata.size'),
                alignment: addIfExistsAndMap('$content.metadata.alignment', AlignmentMap),
                portrait: addIfExists('$content.metadata.portrait'),
                abilities: addIfExists('$content.metadata.abilities'),
                challenge: addIfExists('$content.metadata.challenge'),
                xp: addIfExists('$content.metadata.xp'),
                level: addIfExists('$content.metadata.level'),
                hitDice: addIfExists('$content.metadata.hitDice'),
                health: addIfExists('$content.metadata.health'),
                ac: addIfExists('$content.metadata.ac'),
                proficiency: addIfExists('$content.metadata.proficiency'),
                initiative: addIfExists('$content.metadata.initiative'),
                str: addIfExists('$content.metadata.str'),
                dex: addIfExists('$content.metadata.dex'),
                con: addIfExists('$content.metadata.con'),
                int: addIfExists('$content.metadata.int'),
                wis: addIfExists('$content.metadata.wis'),
                cha: addIfExists('$content.metadata.cha'),
                critRange: addIfExists('$content.metadata.critRange'),
                resistances: addIfExists('$content.metadata.resistances'),
                vulnerabilities: addIfExists('$content.metadata.vulnerabilities'),
                advantages: addIfExists('$content.metadata.advantages'),
                dmgImmunities: addIfExists('$content.metadata.dmgImmunities'),
                conImmunities: addIfExists('$content.metadata.conImmunities'),
                speed: addIfExists('$content.metadata.speed'),
                senses: addIfExists('$content.metadata.sensesThatDoNotExist'), // Does not exist
                proficienciesSave: addKeysInIfExists('$content.metadata.saves'),
                proficienciesSkill: addKeysInIfExistsAndMap('$content.metadata.skills', SkillMap),
                proficienciesArmor: addIfExists('$content.metadata.proficienciesArmor'),
                proficienciesWeapon: addIfExists('$content.metadata.proficienciesWeapon'),
                proficienciesTool: addIfExists('$content.metadata.proficienciesTool'),
                proficienciesLanguage: addIfExists('$content.metadata.proficienciesLanguage'),
                spellAttribute: addIfExists('$content.metadata.spellAttribute'),
                spellSlots: addIfExists('$content.metadata.spellSlots'),
                spells: addIfExists('$content.metadata.spells'),
            } satisfies KeysOf<Required<DBCreature["metadata"]>>,
            storage: { $ifNull: ['$content.storage', {} satisfies Required<DBCreature["storage"]> ] },
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBCreature>
    }

    private get documentProjection(): KeysOf<DBDocument> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: '$_holderId',
            type: '$type',
            content: {
                name: { $ifNull: ['$content.name', ""] },
                public: { $ifNull: ['$content.metadata.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<Required<DBDocument["content"]>>,
            metadata: {
                name: { $ifNull: ['$content.metadata.name', { $ifNull: ['$content.metadata.title', ""] }] },
                description: { $ifNull: ['$content.metadata.description', { $ifNull: ['$content.metadata.content', ""] }] },
            } satisfies KeysOf<Required<DBDocument["metadata"]>>,
            storage: { $ifNull: ['$content.storage', {} satisfies Required<DBDocument["storage"]> ] },
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBDocument>
    }

    private get encounterProjection(): KeysOf<DBEncounter> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: '$_holderId',
            type: '$type',
            content: {
                name: { $ifNull: ['$content.name', ""] },
                public: { $ifNull: ['$content.metadata.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<DBEncounter["content"]>,
            metadata: {
                name: { $ifNull: ['$content.metadata.name', ""] },
                description: { $ifNull: ['$content.metadata.description', ""] },
                creatures: addIfExists('$content.metadata.creatures'),
                challenge: addIfExists('$content.metadata.challenge'),
                xp: addIfExists('$content.metadata.xp')
            } satisfies KeysOf<Required<DBEncounter["metadata"]>>,
            storage: { 
                cards: { $ifNull: ['$content.storage.cards', [] satisfies KeysOf<Required<DBEncounter["storage"]["cards"]>> ] }
            } satisfies KeysOf<Required<DBEncounter["storage"]>>,
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBEncounter>
    }

    private get spellProjection(): KeysOf<DBSpell> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: '$_holderId',
            type: '$type',
            content: {
                name: { $ifNull: ['$content.name', ""] },
                public: { $ifNull: ['$content.metadata.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<DBSpell["content"]>,
            metadata: {
                name: { $ifNull: ['$content.metadata.name', ""] },
                description: { $ifNull: ['$content.metadata.description', ""] },
                level: addIfExists('$content.metadata.level'),
                school: addIfExists('$content.metadata.school'),
                time: addIfExists('$content.metadata.time'),
                timeCustom: addIfExists('$content.metadata.timeCustom'),
                timeValue: addIfExists('$content.metadata.timeValue'),
                duration: addIfExists('$content.metadata.duration'),
                durationValue: addIfExists('$content.metadata.durationValue'),
                ritual: addIfExists('$content.metadata.ritual'),
                concentration: addIfExists('$content.metadata.concentration'),
                componentVerbal: addIfExists('$content.metadata.componentVerbal'),
                componentSomatic: addIfExists('$content.metadata.componentSomatic'),
                componentMaterial: addIfExists('$content.metadata.componentMaterial'),
                materials: addIfExists('$content.metadata.materials'),
                notes: addIfExists('$content.metadata.notes'),
                condition: addIfExists('$content.metadata.condition'),
                saveAttr: addIfExists('$content.metadata.saveAttr'),
                damageType: addIfExists('$content.metadata.damageType'),
                target: addIfExists('$content.metadata.target'),
                range: addIfExists('$content.metadata.range'),
                rangeLong: addIfExists('$content.metadata.rangeLong'),
                area: addIfExists('$content.metadata.area'),
                areaSize: addIfExists('$content.metadata.areaSize'),
                areaHeight: addIfExists('$content.metadata.areaHeight'),
                conditionScaling: addIfExists('$content.metadata.conditionScaling'),
                conditionProficiency: addIfExists('$content.metadata.conditionProficiency'),
                conditionModifier: addIfExists('$content.metadata.conditionModifier'),
                effectText: addIfExists('$content.metadata.effectText'),
                effectScaling: addIfExists('$content.metadata.effectScaling'),
                effectProficiency: addIfExists('$content.metadata.effectProficiency'),
                effectModifier: addIfExists('$content.metadata.effectModifier'),
                effectDice: addIfExists('$content.metadata.effectDice'),
                effectDiceNum: addIfExists('$content.metadata.effectDiceNum')
            } satisfies KeysOf<Required<DBSpell["metadata"]>>,
            storage: { $ifNull: ['$content.storage.cards', {} satisfies Required<DBSpell["storage"]> ] },
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBSpell>
    }

    private get classProjection(): KeysOf<DBClass> {
        return {
            _id: '$_id',
            _userId: '$_userId',
            _storyId: '$_storyId',
            _holderId: '$_holderId',
            type: '$type',
            content: {
                name: { $ifNull: ['$content.name', ""] },
                public: { $ifNull: ['$content.metadata.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<DBClass["content"]>,
            metadata: {
                name: { $ifNull: ['$content.metadata.name', ""] },
                description: { $ifNull: ['$content.metadata.description', ""] },
                hitDice: addIfExists('$content.metadata.hitDice'),
                isSubclass: addIfExists('$content.metadata.isSubclass'),
                subclassLevel: addIfExists('$content.metadata.subclassLevel'),
                subclasses: addIfExists('$content.metadata.subclasses'),
                1: addIfExists('$content.metadata.1'),
                2: addIfExists('$content.metadata.2'),
                3: addIfExists('$content.metadata.3'),
                4: addIfExists('$content.metadata.4'),
                5: addIfExists('$content.metadata.5'),
                6: addIfExists('$content.metadata.6'),
                7: addIfExists('$content.metadata.7'),
                8: addIfExists('$content.metadata.8'),
                9: addIfExists('$content.metadata.9'),
                10: addIfExists('$content.metadata.10'),
                11: addIfExists('$content.metadata.11'),
                12: addIfExists('$content.metadata.12'),
                13: addIfExists('$content.metadata.13'),
                14: addIfExists('$content.metadata.14'),
                15: addIfExists('$content.metadata.15'),
                16: addIfExists('$content.metadata.16'),
                17: addIfExists('$content.metadata.17'),
                18: addIfExists('$content.metadata.18'),
                19: addIfExists('$content.metadata.19'),
                20: addIfExists('$content.metadata.20'),
            } satisfies KeysOf<Required<DBClass["metadata"]>>,
            storage: { $ifNull: ['$storage', {} satisfies Required<DBClass["storage"]> ] },
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBClass>
    }
}

export default DebugInterface