import { FileMetadata, FileType } from "./database/files"

interface FileRendererTemplate {
    type: FileType
}

interface FileTemplate {
    editor: RootTemplateComponent
    renderer: FileRendererTemplate
}

// ------------------
// TemplateConditions
// ------------------

interface ITemplateCondition {
    type: TemplateConditionType
    value: unknown
}

type ConditionValue = TemplateConditionType | string | boolean
class EqualsTemplateCondition implements ITemplateCondition {
    type: TemplateConditionType.Equals
    value: ConditionValue[]
}

class NotEqualsTemplateCondition implements ITemplateCondition {
    type: TemplateConditionType.NotEquals
    value: ConditionValue[]
}

class AnyTemplateCondition implements ITemplateCondition {
    type: TemplateConditionType.Any
    value: ConditionValue[]
}

class AllTemplateCondition implements ITemplateCondition {
    type: TemplateConditionType.All
    value: ConditionValue[]
}

class ValueTemplateCondition implements ITemplateCondition {
    type: TemplateConditionType.Value
    value: string | boolean | null
}

class MetadataTemplateCondition implements ITemplateCondition {
    type: TemplateConditionType.Metadata
    value: keyof FileMetadata
}

type TemplateCondition = 
      EqualsTemplateCondition
    | NotEqualsTemplateCondition
    | AnyTemplateCondition
    | AllTemplateCondition
    | ValueTemplateCondition
    | MetadataTemplateCondition
    | string
    | boolean
    | null

// --------------
// TemplateParams
// --------------
type ParamTypes = string | number | boolean
interface IFileTemplateParams {
    [key: string]: ParamTypes | ParamTypes[]
}

interface BooleanTemplateParams extends IFileTemplateParams {
    label: string
    key: string
    default?: boolean
}

interface EnumTemplateParams extends IFileTemplateParams {
    label: string
    key: string
    type: string
}

interface GroupTemplateParams extends IFileTemplateParams {
    label: string
    open: boolean
}

interface ListTemplateParams extends IFileTemplateParams {
    label: string
    key: string
    type: string
    default?: string | number
    editEnabled?: boolean
    placeholder?: string
}

interface LinkListTemplateParams extends IFileTemplateParams {
    label: string
    key: string
    fileTypes: FileType[]
    allowText: boolean
    placeholder?: string
}

interface NumberTemplateParams extends IFileTemplateParams {
    label: string
    key: string
    allowNegative?: boolean
    allowFloat?: boolean
}

interface OptionTemplateParams extends IFileTemplateParams {
    label: string
    key: string
    type: string
    default?: number
}

interface SelectionTemplateParams extends IFileTemplateParams {
    label: string
    key: string
    enum: string
}

interface TextTemplateParams extends IFileTemplateParams {
    label: string
    key: string
}

interface TextAreaTemplateParams extends IFileTemplateParams {
    label: string
    key: string
    useSyntaxEditor?: boolean
    fill?: boolean
}


// ------------------
// TemplateComponents
// ------------------
interface TemplateComponent {
    type: EditInputType
    params?: IFileTemplateParams
    conditions?: TemplateCondition[]
    content?: TemplateComponent[]
}

class RootTemplateComponent implements TemplateComponent {
    type: EditInputType.Root
    content: TemplateComponent[]
}

// -----
// Enums
// -----

export enum TemplateConditionType {
    Equals = "equals",
    NotEquals = "notEquals",
    Any = "any",
    All = "all",
    Metadata = "metadata",
    Value = "value"
}

export enum EditInputType {
    Root = 'root',
    Group = 'group',
    Editor = 'editor',
    Text = 'text',
    Textarea = 'textarea',
    Number = 'number',
    List = 'list',
    LinkList = 'linkList',
    Selection = 'selection',
    Option = 'option',
    Enum = 'enum',
    Boolean = 'boolean',
    TemplateList = 'template-list'
}

export type {
    FileTemplate,
    IFileTemplateParams,
    FileRendererTemplate,
    TemplateComponent,
    ITemplateCondition,
    BooleanTemplateParams,
    EnumTemplateParams,
    GroupTemplateParams,
    ListTemplateParams,
    LinkListTemplateParams,
    NumberTemplateParams,
    OptionTemplateParams,
    SelectionTemplateParams,
    TextTemplateParams,
    TextAreaTemplateParams,
    ConditionValue,
    TemplateCondition,
    EqualsTemplateCondition,
    NotEqualsTemplateCondition,
    AnyTemplateCondition,
    AllTemplateCondition,
    ValueTemplateCondition,
    MetadataTemplateCondition,
    RootTemplateComponent
}