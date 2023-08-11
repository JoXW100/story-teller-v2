import { ObjectId, Document } from 'mongodb'
import { DateValue, UserId } from ".."
import { ArmorType, Attribute, Language, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, ProficiencyType, Skill, Tool, WeaponType } from '../dnd'
import { ModifierSelectType, ModifierType } from '../editor'

interface FileMetadata { 
    name?: string
    description?: string
    $vars?: any
    $queries?: any
}

type FileStorage = {}
interface FileContent {
    text?: string
}

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
    metadata?: Omit<T,"$vars"|"$queries">
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

interface IFileMetadataQueryResult<T extends FileMetadata> {
    id: ObjectId,
    type: FileType
    metadata: T
}

interface Modifier {
    $name: string
    type?: ModifierType
    select?: ModifierSelectType
    bonusProperty?: ModifierBonusTypeProperty
    addRemoveProperty?: ModifierAddRemoveTypeProperty

    label?: string
    allowAny?: boolean

    proficiency?: ProficiencyType

    // Values
    value?: number
    file?: (ObjectId | string)
    files?: (ObjectId | string)[]
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

export type EnumChoiceData = { type: "enum", label: string, enum: string, options: string[] }
export type AnyFileChoiceData = { type: "file", label: string, allowAny: true, options: FileType[] }
export type FileChoiceData = { type: "file", label: string, allowAny: false, options: (ObjectId | string)[] }

export type ChoiceData = EnumChoiceData | AnyFileChoiceData | FileChoiceData
 
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
    modifyAbilities: (abilities: (ObjectId | string)[]) => (ObjectId | string)[]

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
type FileGetMetadataResult<T extends FileMetadata = FileMetadata> = IFileMetadataQueryResult<T>
type FileGetManyMetadataResult<T extends FileMetadata = FileMetadata> = FileGetMetadataResult<T>[]
type FileGetStructureResult = FileStructure[]

export type {
    DBFile,
    DBContent,
    FileData,
    FileStructure,
    IFileMetadataQueryResult,
    Modifier,
    ModifierCollection,
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