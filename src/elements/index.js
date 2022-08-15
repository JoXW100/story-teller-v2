import * as align from './align';
import * as block from './block';
import * as bold from './bold';
import * as box from './box';
import * as center from './center';
import * as fill from './fill';
import * as header from './header';
import * as image from './image';
import * as line from './line';
import * as link from './link';
import * as margin from './margin';
import * as newline from './newline';
import * as roll from './roll';
import * as save from './save';
import * as text from './text';

const ElementDictionary = {
    ...align.element,
    ...block.element,
    ...bold.element,
    ...box.element,
    ...center.element,
    ...fill.element,
    ...header.element,
    ...image.element,
    ...line.element,
    ...link.element,
    ...margin.element,
    ...newline.element,
    ...roll.element,
    ...save.element,
    ...text.element
}

export {
    align,
    block,
    bold,
    box,
    center,
    fill,
    header,
    image,
    line,
    link,
    margin,
    newline,
    roll,
    save,
    text
}

export default ElementDictionary;