import Boolean from './boolean';
import Editor from './editor';
import Enum from './enum';
import Group from './group';
import Text from './text';
import Textarea from './textarea'
import ItemList from './itemList'
import LinkList from './linkList'
import LinkInput from './linkInput'
import List from './list'
import Number from './number'
import Option from './option';
import Selection from './selection';
import Navigation from './navigation';
import { IFileTemplateParams } from 'types/templates';

type TemplateComponentProps<T extends IFileTemplateParams = IFileTemplateParams> = React.PropsWithChildren<{
    params: T
}>


const Components = {
    Boolean,
    Editor,
    Enum,
    Group,
    Text,
    Textarea,
    ItemList,
    LinkList,
    LinkInput,
    List,
    Number,
    Option,
    Selection,
    Navigation
}

export type {
    TemplateComponentProps
}

export default Components