import { FileType } from "./database/files"

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
interface TemplateCondition {
    type: TemplateConditionType
    value: any
}

type ConditionValue = TemplateConditionType | string | boolean
class EqualsTemplateCondition implements TemplateCondition {
    type: TemplateConditionType.Equals
    value: ConditionValue[]
}

class NotEqualsTemplateCondition implements TemplateCondition {
    type: TemplateConditionType.NotEquals
    value: ConditionValue[]
}

class AnyTemplateCondition implements TemplateCondition {
    type: TemplateConditionType.Any
    value: ConditionValue[]
}

class AllTemplateCondition implements TemplateCondition {
    type: TemplateConditionType.All
    value: ConditionValue[]
}

class ValueTemplateCondition implements TemplateCondition {
    type: TemplateConditionType.Value
    value: string
}

class MetadataTemplateCondition implements TemplateCondition {
    type: TemplateConditionType.Metadata
    value: string
}

// ------------------
// TemplateComponents
// ------------------
interface TemplateComponent {
    type: EditInputType
    params?: FileTemplateParams
    conditions?: TemplateCondition[]
    content?: TemplateComponent[]
}

class RootTemplateComponent implements TemplateComponent {
    type: EditInputType.Root
    params?: undefined;
    content: TemplateComponent[]
}

// --------------
// TemplateParams
// --------------
type ParamTypes = string | number | boolean
interface FileTemplateParams {
    [key: string]: ParamTypes
}

interface BooleanTemplateParams extends FileTemplateParams {
    label: string
    key: string
    default?: boolean
}

interface EnumTemplateParams extends FileTemplateParams {
    label: string
    key: string
    type: string
}

interface GroupTemplateParams extends FileTemplateParams {
    label: string
    open: boolean
}

interface ListTemplateParams extends FileTemplateParams {
    label: string
    key: string
    type: string
    default?: string | number
    editEnabled?: boolean
}

interface NumberTemplateParams extends FileTemplateParams {
    label: string
    key: string
    allowNegative?: boolean
    allowFloat?: boolean
}

interface OptionTemplateParams extends FileTemplateParams {
    label: string
    key: string
    type: string
    default?: number
}

interface SelectionTemplateParams extends FileTemplateParams {
    label: string
    key: string
    enum: string
}

interface TextTemplateParams extends FileTemplateParams {
    label: string
    key: string
}

interface TextAreaTemplateParams extends FileTemplateParams {
    label: string
    key: string
    fill?: boolean
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
    Selection = 'selection',
    Option = 'option',
    Enum = 'enum',
    Boolean = 'boolean',
    TemplateList = 'template-list'
}

export type {
    FileTemplate,
    FileTemplateParams,
    FileRendererTemplate,
    TemplateComponent,
    TemplateCondition,
    BooleanTemplateParams,
    EnumTemplateParams,
    GroupTemplateParams,
    ListTemplateParams,
    NumberTemplateParams,
    OptionTemplateParams,
    SelectionTemplateParams,
    TextTemplateParams,
    TextAreaTemplateParams,
    ConditionValue,
    EqualsTemplateCondition,
    NotEqualsTemplateCondition,
    AnyTemplateCondition,
    AllTemplateCondition,
    ValueTemplateCondition,
    MetadataTemplateCondition,
    RootTemplateComponent
}