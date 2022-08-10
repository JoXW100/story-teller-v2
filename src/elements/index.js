import * as align from './align';
import * as bold from './bold';
import * as box from './box';
import * as center from './center';
import * as header from './header';
import * as line from './line';
import * as link from './link';
import * as margin from './margin';
import * as newline from './newline';
import * as save from './save';
import * as text from './text';

const ElementDictionary = {
    ...align.element,
    ...bold.element,
    ...box.element,
    ...center.element,
    ...header.element,
    ...line.element,
    ...link.element,
    ...margin.element,
    ...newline.element,
    ...save.element,
    ...text.element
}

export {
    align,
    bold,
    box,
    center,
    header,
    line,
    link,
    margin,
    newline,
    save,
    text
}

export default ElementDictionary;