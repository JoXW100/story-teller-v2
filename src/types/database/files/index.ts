import { ObjectId, Document } from 'mongodb'
import { DateValue, UserId } from ".."
import { ArmorType, Attribute, Language, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, ProficiencyType, Skill, Tool, WeaponType } from '../dnd'
import { ModifierSelectType, ModifierType } from '../editor'
import { ExtractOptionType, IOptionType, OptionTypeKey } from 'data/optionData'
import { Enum } from 'types'
type FileMetadata = {}
type FileStorage = {}
type FileContent = {}

interface DBFile<T extends FileMetadata, K extends FileStorage = undefined> extends Document {
    _id?: ObjectId
    _userId: UserId
    _storyId: ObjectId
    _holderId?: ObjectId
    type: FileType
    content: DBContent<T,K>
    dateCreated: DateValue
    dateUpdated: DateValue
}

interface DBContent<T extends FileMetadata, K extends FileStorage> {
    name: string
    text?: string
    open?: boolean
    metadata?: T
    storage?: K
}

interface FileStructure {
    id: ObjectId
    holderId: ObjectId
    type: FileType
    name: string
    open: boolean
    children?: FileStructure[]
}

interface FileMetadataQueryResult<T extends FileMetadata> {
    id: ObjectId,
    type: FileType
    metadata: T
}

interface Modifier extends FileMetadata {
    $name: string
    type?: ModifierType
    select?: ModifierSelectType
    bonusProperty?: ModifierBonusTypeProperty
    addRemoveProperty?: ModifierAddRemoveTypeProperty

    proficiency?: ProficiencyType
    label?: string

    // Values
    value?: number
    armor?: ArmorType
    armors?: ArmorType[]
    weapon?: WeaponType
    weapons?: WeaponType[]
    tool?: Tool
    tools?: Tool[]
    language?: Language
    languages?: Language[]
    save?: Attribute
    saves?: Attribute[]
    skill?: Skill
    skills?: Skill[]
}

type ChoiceData = { 
    type: string, 
    label: string,
    options: string[]  
}
 
interface ModifierCollection {
    bonusAC: number
    bonusNumHealthDice: number
    bonusHealth: number
    bonusProficiency: number
    bonusInitiative: number

    modifyProficienciesArmor: (proficiencies: ArmorType[], onlyRemove?: boolean) => ArmorType[]
    modifyProficienciesWeapon: (proficiencies: WeaponType[], onlyRemove?: boolean) => WeaponType[]
    modifyProficienciesTool: (proficiencies: Tool[], onlyRemove?: boolean) => Tool[]
    modifyProficienciesLanguage: (proficiencies: Language[], onlyRemove?: boolean) => Language[]
    modifyProficienciesSave: (proficiencies: Attribute[], onlyRemove?: boolean) => Attribute[]
    modifyProficienciesSkill: (proficiencies: Skill[], onlyRemove?: boolean) => Skill[]

    join: (other: ModifierCollection) => ModifierCollection
    getChoices: () => Record<string, ChoiceData>
}

export enum FileType {
    Root = "root",
    Empty = "empty",
    Folder = "folder",
    Ability = "abi",
    Character = "cha",
    Class = "cla",
    Creature =  "cre",
    Document = "doc",
    Encounter = "enc",
    Spell = "spe",
}

export type UsedFileTypes = Exclude<FileType, FileType.Root|FileType.Empty>
export type RenderedFileTypes = Exclude<FileType, FileType.Root|FileType.Empty|FileType.Folder>

interface FileData<A extends FileContent, B extends FileMetadata, C extends FileStorage> {
    id: ObjectId
    name: string
    type: FileType
    isOwner: boolean
    content: A
    metadata: B
    storage: C
}

type FileAddResult = ObjectId
type FileAddCopyResult = boolean
type FileGetResult = FileData<FileContent, FileMetadata, FileStorage>
type FileDeleteResult = boolean
type FileDeleteFromResult = boolean
type FileConvertResult = boolean
type FileRenameResult = boolean
type FileMoveResult = boolean
type FileSetPropertyResult = boolean
type FileGetMetadataResult<T extends FileMetadata = FileMetadata> = FileMetadataQueryResult<T>
type FileGetManyMetadataResult<T extends FileMetadata = FileMetadata> = FileGetMetadataResult<T>[]
type FileGetStructureResult = FileStructure[]

export type {
    DBFile,
    DBContent,
    FileData,
    FileStructure,
    FileMetadataQueryResult,
    Modifier,
    ModifierCollection,
    ChoiceData,
    FileMetadata,
    FileStorage,
    FileContent,
    FileAddResult,
    FileAddCopyResult,
    FileGetResult,
    FileDeleteResult,
    FileDeleteFromResult,
    FileConvertResult,
    FileRenameResult,
    FileMoveResult,
    FileSetPropertyResult,
    FileGetMetadataResult,
    FileGetManyMetadataResult,
    FileGetStructureResult
}