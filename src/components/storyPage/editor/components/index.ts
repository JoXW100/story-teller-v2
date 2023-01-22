import Boolean from './boolean';
import Editor from './editor';
import Enum from './enum';
import Group from './group';
import Text from './text';
import Textarea from './textarea'
import LinkList from './linkList'
import List from './list'
import Number from './number'
import Option from './option';
import Selection from './selection';
import { FileTemplateParams } from 'types/templates';

type TemplateComponentProps<T extends FileTemplateParams> = React.PropsWithChildren<{
    params: T
}>


const Components = {
    Boolean,
    Editor,
    Enum,
    Group,
    Text,
    Textarea,
    LinkList,
    List,
    Number,
    Option,
    Selection
}

export type {
    TemplateComponentProps
}

export default Components