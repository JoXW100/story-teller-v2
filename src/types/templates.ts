import { IFileMetadata, FileType } from "./database/files"

interface FileRendererTemplate {
    type: FileType | string
}

interface FileTemplate {
    editor: RootTemplateComponent
    renderer: FileRendererTemplate
    editorSubTemplates?: Record<string, RootTemplateComponent>
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
    value: string | boolean | number | null
}

class MetadataTemplateCondition implements ITemplateCondition {
    type: TemplateConditionType.Metadata
    value: keyof IFileMetadata
}

type TemplateCondition = 
      EqualsTemplateCondition
    | NotEqualsTemplateCondition
    | AnyTemplateCondition
    | AllTemplateCondition
    | ValueTemplateCondition
    | MetadataTemplateCondition
    | string
    | number
    | boolean
    | null

// --------------
// TemplateParams
// --------------
interface IFileTemplateParams {
    label: string
    key: string
    default?: boolean | string | number | (boolean | string | number)[]
}

interface BooleanTemplateParams extends IFileTemplateParams {
    default?: boolean
    viewURL?: boolean
}

interface EnumTemplateParams extends IFileTemplateParams {
    type: string
}

interface GroupTemplateParams extends IFileTemplateParams {
    key: never
    default: never
    open: boolean
    fill?: boolean
}

interface ListTemplateParams extends IFileTemplateParams {
    type: "text" | "number"
    default?: string | number
    editEnabled?: boolean
    reverse?: boolean
    placeholder?: string
    fill?: boolean
}
interface ItemListTemplateParams extends IFileTemplateParams {
    template: keyof FileTemplate['editorSubTemplates']
    default?: string
    prompt?: string
    placeholder?: string
    fill?: boolean
}

interface LinkListTemplateParams extends IFileTemplateParams {
    fileTypes: FileType[]
    allowText: boolean
    placeholder?: string
    fill?: boolean
}

interface LinkInputTemplateParams extends IFileTemplateParams {
    fileTypes: FileType[]
    placeholder?: string
}

interface NumberTemplateParams extends IFileTemplateParams {
    allowNegative?: boolean
    allowFloat?: boolean
}

interface OptionTemplateParams extends IFileTemplateParams {
    type: string
    default?: number
}

interface SelectionTemplateParams extends IFileTemplateParams {
    enum: string
    default?: string[]
    fill?: boolean
}

interface SelectionInputTemplateParams extends IFileTemplateParams {
    enum: string
    default?: string | number
    type?: "none" | "text" | "number"
    fill?: boolean
}

interface TextTemplateParams extends IFileTemplateParams {
    placeholder?: string
}

interface TextareaTemplateParams extends IFileTemplateParams {
    useSyntaxEditor?: boolean
    fill?: boolean
}

interface NavigationTemplateParams extends IFileTemplateParams {
    label: never
    key: never
    default: never
}

// ------------------
// TemplateComponents
// ------------------

interface ITemplateComponent {
    type: EditInputType
    params?: IFileTemplateParams
    conditions?: TemplateCondition[]
    content?: ITemplateComponent[]
}

type TemplateComponent = 
      RootTemplateComponent
    | BooleanTemplateComponent
    | EnumTemplateComponent
    | GroupTemplateComponent
    | ListTemplateComponent
    | ItemListTemplateComponent
    | LinkListTemplateComponent
    | LinkInputTemplateComponent
    | NumberTemplateComponent
    | OptionTemplateComponent
    | SelectionTemplateComponent
    | SelectionInputTemplateComponent
    | TextTemplateComponent
    | TextareaTemplateComponent
    | NavigationTemplateComponent

class RootTemplateComponent implements ITemplateComponent {
    type: EditInputType.Root
    content: TemplateComponent[]
}

class BooleanTemplateComponent implements ITemplateComponent {
    type: EditInputType.Boolean
    conditions?: TemplateCondition[]
    params?: BooleanTemplateParams;
}

class EnumTemplateComponent implements ITemplateComponent {
    type: EditInputType.Enum
    conditions?: TemplateCondition[]
    params?: EnumTemplateParams;
}

class GroupTemplateComponent implements ITemplateComponent {
    type: EditInputType.Group
    conditions?: TemplateCondition[]
    content?: TemplateComponent[];
    params?: GroupTemplateParams;
}

class ListTemplateComponent implements ITemplateComponent {
    type: EditInputType.List
    conditions?: TemplateCondition[]
    params?: ListTemplateParams;
}

class ItemListTemplateComponent implements ITemplateComponent {
    type: EditInputType.ItemList
    conditions?: TemplateCondition[]
    params?: ItemListTemplateParams;
}

class LinkListTemplateComponent implements ITemplateComponent {
    type: EditInputType.LinkList
    conditions?: TemplateCondition[]
    params?: LinkListTemplateParams;
}

class LinkInputTemplateComponent implements ITemplateComponent {
    type: EditInputType.LinkInput
    conditions?: TemplateCondition[]
    params?: LinkInputTemplateParams;
}

class NumberTemplateComponent implements ITemplateComponent {
    type: EditInputType.Number
    conditions?: TemplateCondition[]
    params?: NumberTemplateParams;
}

class OptionTemplateComponent implements ITemplateComponent {
    type: EditInputType.Option
    conditions?: TemplateCondition[]
    params?: OptionTemplateParams;
}

class SelectionTemplateComponent implements ITemplateComponent {
    type: EditInputType.Selection
    conditions?: TemplateCondition[]
    params?: SelectionTemplateParams;
}

class SelectionInputTemplateComponent implements ITemplateComponent {
    type: EditInputType.SelectionInput
    conditions?: TemplateCondition[]
    params?: SelectionInputTemplateParams;
}

class TextTemplateComponent implements ITemplateComponent {
    type: EditInputType.Text
    conditions?: TemplateCondition[]
    params?: TextTemplateParams;
}

class TextareaTemplateComponent implements ITemplateComponent {
    type: EditInputType.Textarea
    conditions?: TemplateCondition[]
    params?: TextareaTemplateParams;
}

class NavigationTemplateComponent implements ITemplateComponent {
    type: EditInputType.Navigation
    params?: NavigationTemplateParams;
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
    ItemList = 'itemList',
    LinkList = 'linkList',
    LinkInput = 'linkInput',
    TemplateList = 'templateList',
    Selection = 'selection',
    SelectionInput = 'selectionInput',
    Option = 'option',
    Enum = 'enum',
    Boolean = 'boolean',
    Navigation = 'navigation'
}

export type {
    FileTemplate,
    IFileTemplateParams,
    FileRendererTemplate,
    ITemplateComponent,
    ITemplateCondition,
    BooleanTemplateParams,
    EnumTemplateParams,
    GroupTemplateParams,
    ListTemplateParams,
    ItemListTemplateParams,
    LinkListTemplateParams,
    LinkInputTemplateParams,
    NumberTemplateParams,
    OptionTemplateParams,
    SelectionTemplateParams,
    SelectionInputTemplateParams,
    TextTemplateParams,
    TextareaTemplateParams,
    NavigationTemplateParams,
    ConditionValue,
    TemplateCondition,
    TemplateComponent,
    EqualsTemplateCondition,
    NotEqualsTemplateCondition,
    AnyTemplateCondition,
    AllTemplateCondition,
    ValueTemplateCondition,
    MetadataTemplateCondition,
    RootTemplateComponent,
    NavigationTemplateComponent
}