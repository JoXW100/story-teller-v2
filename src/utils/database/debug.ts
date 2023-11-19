// @ts-nocheck
import { Collection, Db } from "mongodb";
import Logger from "utils/logger";
import { success } from "./database";
import { DBData, DBFolder, DBItem, DBResponse, DBRoot } from "types/database";
import { FileType } from "types/database/files";
import { KeysOf, ValueOf } from "types";
import { AbilityFile } from "types/database/files/ability";
import { CreatureFile } from "types/database/files/creature";
import { CharacterFile } from "types/database/files/character";
import { DocumentFile } from "types/database/files/document";
import { EncounterFile } from "types/database/files/encounter";
import { SpellFile } from "types/database/files/spell";
import { ClassFile } from "types/database/files/class";
import { Alignment, Skill } from "types/database/dnd";

type DBAbility = DBData & AbilityFile
type DBCreature = DBData & CreatureFile
type DBCharacter = DBData & CharacterFile
type DBDocument = DBData & DocumentFile
type DBEncounter = DBData & EncounterFile
type DBSpell = DBData & SpellFile
type DBClass = DBData & ClassFile

function addIfNotExists(property: string, value: any): {} {
    return { 
        $cond: {
            if: { $eq: [{ $type: property }, 'missing'] }, // Value does not exist
            then: value,
            else: '$$REMOVE'
        }
    }
}

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
        responses.push(await this.convert(this.backupCollection));
        //responses.push(await this.clearFiles()); // Not necessary
        responses.push(await this.transferToFiles());
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

    async convert(collection: Collection<DBItem>, match: any = {}): Promise<DBResponse<number>> {
        let res = await collection.aggregate([
            { $match: match},
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
                public: { $ifNull: ['$content.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<Required<DBAbility["content"]>>,
            metadata: {
                name: { $ifNull: ['$metadata.name', ""] },
                description: { $ifNull: ['$metadata.description', ""] },
                type: addIfExists('$metadata.type'),
                action: addIfExists('$metadata.action'),
                notes: addIfExists('$metadata.notes'),
                condition: addIfExists('$metadata.condition'),
                saveAttr: addIfExists('$metadata.saveAttr'),
                target: addIfExists('$metadata.target'),
                range: addIfExists('$metadata.range'),
                rangeLong: addIfExists('$metadata.rangeLong'),
                rangeThrown: addIfExists('$metadata.rangeThrown'),
                conditionScaling: addIfExists('$metadata.conditionScaling'),
                conditionProficiency: addIfExists('$metadata.conditionProficiency'),
                conditionModifier: addIfExists('$metadata.conditionModifier'),
                effects: addIfNotExists('$metadata.effects', this.effectProjection),
                modifiers: addIfExists('$metadata.modifiers')
            } satisfies KeysOf<Required<DBAbility["metadata"]>>,
            storage: { $ifNull: ['$storage', {} satisfies Required<DBAbility["storage"]> ] },
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
                public: { $ifNull: ['$content.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<Required<DBCharacter["content"]>>,
            metadata: {
                name: { $ifNull: ['$metadata.name', ""] },
                description: { $ifNull: ['$metadata.description', ""] },
                simple: addIfExists('$metadata.simple'),
                gender: addIfExists('$metadata.gender'),
                age: addIfExists('$metadata.age'),
                height: addIfExists('$metadata.height'),
                weight: addIfExists('$metadata.weight'),
                raceName: addIfExists('$metadata.raceName'),
                occupation: addIfExists('$metadata.occupation'),
                appearance: addIfExists('$metadata.appearance'),
                history: addIfExists('$metadata.history'),
                notes: addIfExists('$metadata.notes'),
                type: addIfExists('$metadata.type'),
                size: addIfExists('$metadata.size'),
                alignment: addIfExistsAndMap('$metadata.alignment', AlignmentMap),
                portrait: addIfExists('$metadata.portrait'),
                abilities: addIfExists('$metadata.abilities'),
                challenge: addIfExists('$metadata.challenge'),
                xp: addIfExists('$metadata.xp'),
                level: addIfExists('$metadata.level'),
                classFile: addIfExists('$metadata.classFile'),
                hitDice: addIfExists('$metadata.hitDice'),
                health: addIfExists('$metadata.health'),
                ac: addIfExists('$metadata.ac'),
                proficiency: addIfExists('$metadata.proficiency'),
                initiative: addIfExists('$metadata.initiative'),
                str: addIfExists('$metadata.str'),
                dex: addIfExists('$metadata.dex'),
                con: addIfExists('$metadata.con'),
                int: addIfExists('$metadata.int'),
                wis: addIfExists('$metadata.wis'),
                cha: addIfExists('$metadata.cha'),
                critRange: addIfExists('$metadata.critRange'),
                resistances: addIfExists('$metadata.resistances'),
                vulnerabilities: addIfExists('$metadata.vulnerabilities'),
                advantages: addIfExists('$metadata.advantages'),
                dmgImmunities: addIfExists('$metadata.dmgImmunities'),
                conImmunities: addIfExists('$metadata.conImmunities'),
                speed: addIfExists('$metadata.speed'),
                senses: addIfExists('$metadata.sensesThatDoNotExist'), // Does not exist
                proficienciesSave: addKeysInIfExists('$metadata.saves'),
                proficienciesSkill: addKeysInIfExistsAndMap('$metadata.skills', SkillMap),
                proficienciesArmor: addIfExists('$metadata.proficienciesArmor'),
                proficienciesWeapon: addIfExists('$metadata.proficienciesWeapon'),
                proficienciesTool: addIfExists('$metadata.proficienciesTool'),
                proficienciesLanguage: addIfExists('$metadata.proficienciesLanguage'),
                spellAttribute: addIfExists('$metadata.spellAttribute'),
                spellSlots: addIfExists('$metadata.spellSlots'),
                spells: addIfExists('$metadata.spells'),
            } satisfies KeysOf<Required<DBCharacter["metadata"]>>,
            storage: { 
                classData: { $ifNull: ['$storage.classData', {} satisfies Required<DBCharacter["storage"]["classData"]> ] }
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
                public: { $ifNull: ['$content.public', false] },
                text: { $ifNull: ['$content.text', ""] }
            } satisfies KeysOf<Required<DBCreature["content"]>>,
            metadata: {
                name: { $ifNull: ['$metadata.name', ""] },
                description: { $ifNull: ['$metadata.description', ""] },
                type: addIfExists('$metadata.type'),
                size: addIfExists('$metadata.size'),
                alignment: addIfExistsAndMap('$metadata.alignment', AlignmentMap),
                portrait: addIfExists('$metadata.portrait'),
                abilities: addIfExists('$metadata.abilities'),
                challenge: addIfExists('$metadata.challenge'),
                xp: addIfExists('$metadata.xp'),
                level: addIfExists('$metadata.level'),
                hitDice: addIfExists('$metadata.hitDice'),
                health: addIfExists('$metadata.health'),
                ac: addIfExists('$metadata.ac'),
                proficiency: addIfExists('$metadata.proficiency'),
                initiative: addIfExists('$metadata.initiative'),
                str: addIfExists('$metadata.str'),
                dex: addIfExists('$metadata.dex'),
                con: addIfExists('$metadata.con'),
                int: addIfExists('$metadata.int'),
                wis: addIfExists('$metadata.wis'),
                cha: addIfExists('$metadata.cha'),
                critRange: addIfExists('$metadata.critRange'),
                resistances: addIfExists('$metadata.resistances'),
                vulnerabilities: addIfExists('$metadata.vulnerabilities'),
                advantages: addIfExists('$metadata.advantages'),
                dmgImmunities: addIfExists('$metadata.dmgImmunities'),
                conImmunities: addIfExists('$metadata.conImmunities'),
                speed: addIfExists('$metadata.speed'),
                senses: addIfExists('$metadata.sensesThatDoNotExist'), // Does not exist
                proficienciesSave: addKeysInIfExists('$metadata.saves'),
                proficienciesSkill: addKeysInIfExistsAndMap('$metadata.skills', SkillMap),
                proficienciesArmor: addIfExists('$metadata.proficienciesArmor'),
                proficienciesWeapon: addIfExists('$metadata.proficienciesWeapon'),
                proficienciesTool: addIfExists('$metadata.proficienciesTool'),
                proficienciesLanguage: addIfExists('$metadata.proficienciesLanguage'),
                spellAttribute: addIfExists('$metadata.spellAttribute'),
                spellSlots: addIfExists('$metadata.spellSlots'),
                spells: addIfExists('$metadata.spells'),
            } satisfies KeysOf<Required<DBCreature["metadata"]>>,
            storage: { $ifNull: ['$storage', {} satisfies Required<DBCreature["storage"]> ] },
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
                public: { $ifNull: ['$content.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<Required<DBDocument["content"]>>,
            metadata: {
                name: { $ifNull: ['$metadata.name', { $ifNull: ['$metadata.title', ""] }] },
                description: { $ifNull: ['$metadata.description', { $ifNull: ['$metadata.content', ""] }] },
            } satisfies KeysOf<Required<DBDocument["metadata"]>>,
            storage: { $ifNull: ['$storage', {} satisfies Required<DBDocument["storage"]> ] },
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
                public: { $ifNull: ['$content.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<DBEncounter["content"]>,
            metadata: {
                name: { $ifNull: ['$metadata.name', ""] },
                description: { $ifNull: ['$metadata.description', ""] },
                creatures: addIfExists('$metadata.creatures'),
                challenge: addIfExists('$metadata.challenge'),
                xp: addIfExists('$metadata.xp')
            } satisfies KeysOf<Required<DBEncounter["metadata"]>>,
            storage: { 
                cards: { $ifNull: ['$storage.cards', [] satisfies KeysOf<Required<DBEncounter["storage"]["cards"]>> ] }
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
                public: { $ifNull: ['$content.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<DBSpell["content"]>,
            metadata: {
                name: { $ifNull: ['$metadata.name', ""] },
                description: { $ifNull: ['$metadata.description', ""] },
                level: addIfExists('$metadata.level'),
                school: addIfExists('$metadata.school'),
                time: addIfExists('$metadata.time'),
                timeCustom: addIfExists('$metadata.timeCustom'),
                timeValue: addIfExists('$metadata.timeValue'),
                duration: addIfExists('$metadata.duration'),
                durationValue: addIfExists('$metadata.durationValue'),
                ritual: addIfExists('$metadata.ritual'),
                concentration: addIfExists('$metadata.concentration'),
                componentVerbal: addIfExists('$metadata.componentVerbal'),
                componentSomatic: addIfExists('$metadata.componentSomatic'),
                componentMaterial: addIfExists('$metadata.componentMaterial'),
                materials: addIfExists('$metadata.materials'),
                notes: addIfExists('$metadata.notes'),
                condition: addIfExists('$metadata.condition'),
                saveAttr: addIfExists('$metadata.saveAttr'),
                target: addIfExists('$metadata.target'),
                range: addIfExists('$metadata.range'),
                rangeLong: addIfExists('$metadata.rangeLong'),
                area: addIfExists('$metadata.area'),
                areaSize: addIfExists('$metadata.areaSize'),
                areaHeight: addIfExists('$metadata.areaHeight'),
                conditionScaling: addIfExists('$metadata.conditionScaling'),
                conditionProficiency: addIfExists('$metadata.conditionProficiency'),
                conditionModifier: addIfExists('$metadata.conditionModifier'),
                effects: addIfNotExists('$metadata.effects', this.effectProjection),
            } satisfies KeysOf<Required<DBSpell["metadata"]>>,
            storage: { $ifNull: ['$storage.cards', {} satisfies Required<DBSpell["storage"]> ] },
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
                public: { $ifNull: ['$metadata.public', false] },
                text: { $ifNull: ['$content.text', ""] },
            } satisfies KeysOf<DBClass["content"]>,
            metadata: {
                name: { $ifNull: ['$metadata.name', ""] },
                description: { $ifNull: ['$metadata.description', ""] },
                hitDice: addIfExists('$metadata.hitDice'),
                isSubclass: addIfExists('$metadata.isSubclass'),
                subclassLevel: addIfExists('$metadata.subclassLevel'),
                subclasses: addIfExists('$metadata.subclasses'),
                1: addIfExists('$metadata.1'),
                2: addIfExists('$metadata.2'),
                3: addIfExists('$metadata.3'),
                4: addIfExists('$metadata.4'),
                5: addIfExists('$metadata.5'),
                6: addIfExists('$metadata.6'),
                7: addIfExists('$metadata.7'),
                8: addIfExists('$metadata.8'),
                9: addIfExists('$metadata.9'),
                10: addIfExists('$metadata.10'),
                11: addIfExists('$metadata.11'),
                12: addIfExists('$metadata.12'),
                13: addIfExists('$metadata.13'),
                14: addIfExists('$metadata.14'),
                15: addIfExists('$metadata.15'),
                16: addIfExists('$metadata.16'),
                17: addIfExists('$metadata.17'),
                18: addIfExists('$metadata.18'),
                19: addIfExists('$metadata.19'),
                20: addIfExists('$metadata.20'),
            } satisfies KeysOf<Required<DBClass["metadata"]>>,
            storage: { $ifNull: ['$storage', {} satisfies Required<DBClass["storage"]> ] },
            dateCreated: '$dateCreated',
            dateUpdated: '$dateUpdated'
        } satisfies KeysOf<DBClass>
    }

    private get effectProjection(): KeysOf<ValueOf<Required<DBAbility["metadata"]["effects"]>>>[] {
        return [
            {
                id: "main",
                label: {
                    $cond: { 
                        if: { $eq: ['$metadata.damageType', 'none'] },
                        then: "Effect",
                        else: "Damage"
                    }
                },
                text: addIfExists('$metadata.effectText'),
                damageType: addIfExists('$metadata.damageType'),
                scaling: addIfExists('$metadata.effectScaling'),
                proficiency: addIfExists('$metadata.effectProficiency'),
                modifier: addIfExists('$metadata.effectModifier'),
                dice: addIfExists('$metadata.effectDice'),
                diceNum: addIfExists('$metadata.effectDiceNum'),
            } satisfies KeysOf<ValueOf<Required<DBAbility["metadata"]["effects"]>>>
        ]
    }
}

export default DebugInterface