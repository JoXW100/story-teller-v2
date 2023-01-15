import * as Align from './align';
import * as Block from './block';
import * as Bold from './bold';
import * as Box from './box';
import * as Center from './center';
import * as Fill from './fill';
import * as Header from './header';
import * as Icon from './icon';
import * as Image from './image';
import * as Line from './line';
import * as Link from './link';
import * as Margin from './margin';
import * as Newline from './newline';
import * as Roll from './roll';
import * as Root from './root';
import * as Row from './row';
import * as Save from './save';
import * as Space from './space';
import * as Text from './text';
import * as Toggle from './toggle';
import { ElementObject } from 'types/elements';

export const ElementDictionary: Record<string, ElementObject> = {
    ...Align.element,
    ...Block.element,
    ...Bold.element,
    ...Box.element,
    ...Center.element,
    ...Fill.element,
    ...Header.element,
    ...Icon.element,
    ...Image.element,
    ...Line.element,
    ...Link.element,
    ...Margin.element,
    ...Newline.element,
    ...Roll.element,
    ...Root.element,
    ...Row.element,
    ...Save.element,
    ...Space.element,
    ...Text.element,
    ...Toggle.element
}

export const Elements = {
    Align: Align.default,
    Block: Block.default,
    Bold: Bold.default,
    Box: Box.default,
    Center: Center.default,
    Fill: Fill.default,
    Header1: Header.Header1,
    Header2: Header.Header2,
    Header3: Header.Header3,
    Icon: Icon.default,
    Image: Image.default,
    Line: Line.default,
    Link: Link.LinkElement,
    LinkContent: Link.LinkContentElement,
    LinkTitle: Link.LinkTitleElement,
    Margin: Margin.default,
    Newline: Newline.default,
    Roll: Roll.default,
    Row: Row.default,
    Save: Save.default,
    Space: Space.default,
    Text: Text.default,
    Toggle: Toggle.default
}

export default Elements;