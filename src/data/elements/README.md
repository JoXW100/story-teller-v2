# Elements
Elements are the available commands that can be used within the editor.

### Content 
* `\align` [`direction`]
    - Default option: `direction`
    - If no `direction` is specified, it will default to `horizontal`
    - Valid `direction` values: `vertical`, `horizontal`, `v`, or `h`
    - `\align [vertical]` or `\align [v]` Aligns content in a column and centers them.
    - `\align [horizontal]` or `\align [h]` Aligns content in a row and centers them.


* `\block`
    - Default option: `none`
    - `\block` A holder for regular content, commonly used in align bodies


* `\bold`
    - Default option: `none`
    - `\bold` Bolded content text


* `\box` [`color`]
    - Default option: `color`
    - If no `color` is specified, it will default to a color in the color theme
    - Valid `color` values: 
        - Hex color values in the format `#ffffff`
        - RGB values in the format: `rgb(255,255,255)`
        - Colors by name: `purple`
    - `\box` Creates a colored box that will fit the width of the document and contain its content


* `\center`
    - Default option: `none`
    - `\center` Align content to the center, both vertically and horizontally


* `\fill`
    - Default option: `none`
    - `\fill` Fills the rest of the parent element


* `\h1` [`underline`]
    - Default option: `underline`
    - If no `underline` is specified, it will default to `false`
    - Valid `underline` values: `true` or `false`
    - `\h1 [false]` Create a header that line breaks after its content
    - `\h1 [true]` Create a header with and underline that line breaks after its content


* `\h2` [`underline`]
    - Default option: `underline`
    - If no `underline` is specified, it will default to `false`
    - Valid `underline` values: `true` or `false`
    - `\h2 [false]` Create a sub-header that line breaks after its content
    - `\h2 [true]` Create a sub-header with and underline that line breaks after its content


* `\h3` [`underline`]
    - Default option: `underline`
    - If no `underline` is specified, it will default to `false`
    - Valid `underline` values: `true` or `false`
    - `\h3 [false]` Create a sub-sub-header that line breaks after its content
    - `\h3 [true]` Create a sub-sub-header with and underline that line breaks after its content


* `\line`
    - Default option: `none`
    - `\line` Draw an horizontal line


* `\image` [`href`, `width`, `border`]
    - Default option: `href`
    - If no `href` is specified, a default image is displayed
    - Valid `href` values:
        - File/Document ID's: `NOT IMPLEMENTED YET`
        - External url's: `https://...`
    - If no `width` is specified, it will default to `100%`
    - Valid `width` values: CSS measurement units (`100%`, `10px` etc)
    - If no `border` is specified, it will default to `false`
    - Valid `border` values: `true` or `false`
    - `\image [https://helpx.adobe.com/content/dam/help/en/photos…before_and_after/image-before/Landscape-Color.jpg]` Displays the external image.
    - `\link [ffffffffffffffffffffffff]` Redirects to the file with id `ffffffffffffffffffffffff` when the content is clicked


* `\link` [`href`]
    - Default option: `href`
    - If no `href` is specified, the link will not redirect when clicked
    - Valid `href` values:
        - File/Document ID's: `ffffffffffffffffffffffff`
        - External url's: `https://...`
    - `\link [https://www.google.com/]` Redirects to `https://www.google.com/` when the content is clicked
    - `\link [ffffffffffffffffffffffff]` Redirects to the file with id `ffffffffffffffffffffffff` when the content is clicked


* `\linkContent` [`fileId`]
    - Default option: `fileId`
    - If no `fileId` is specified, an error will be drawn
    - Valid `fileId` values: File/Document ID's, `ffffffffffffffffffffffff`
    - `\linkContent [ffffffffffffffffffffffff]` Draws a box containing the metadata content of the referenced file. Clicking on the box redirects to the referenced file.


* `\linkTitle` [`fileId`]
    - Default option: `fileId`
    - If no `fileId` is specified, an error will be drawn
    - Valid `fileId` values: File/Document ID's, `ffffffffffffffffffffffff`
    - `\linkContent [ffffffffffffffffffffffff]` Draws a link text containing the title of the referenced file.


* `\margin` [`margin`]
    - Default option: `margin`
    - If no `margin` is specified, it will default to `5px`
    - Valid `margin` values: CSS units (cm, mm, in, px, pt, pc, %, ch, em, ex)
        - Can specify for each direction individually, separated by spaces
        - Ex: `100%`, `10px`, `1ch`, `5px 1px 0 0`, `10px 5px`
    - `\margin [10px 5px 3px 2px]` Content has a margin of `10px` on top, `5px` right, `3px` bottom, and `2px` left.
    - `\margin [1cm]` Content has a `1cm` margin on all sides
    - `\margin [1cm 2cm]` Content has a `1cm` margin top and bottom, and `2cm` right and left.


* `\n` or `\newline`
    - Default option: `none`
    - `\n` or `\newline` Insert line


* `\roll` [`dice`, `num`, `mod`, `mode`]
    - Default option: `dice`
    - If no `dice` is specified, it will default to `20`
    - Valid `dice` values: Any integer value greater than zero
    - If no `num` is specified, it will default to `1`
    - Valid `num` values: Any integer value greater than zero
    - If no `mod` is specified, it will default to `0`
    - Valid `mod` values: Any integer value
    - If no `mode` is specified, it will default to `mod` if `dice` is `20`, otherwise `dice`.
    - Valid `mode` values: `dice`, `mode`, or `dmg`
    - `\roll [10, num: 2, mod: -1, mode: dice]` Draws a dice roll figure with `2d10 - 1` displayed, and has the context choices: `flat`, `advantage`, and `disadvantage`.
    - `\roll [12, num: 3, mod: 1, mode: dmg]` Draws a dice roll figure with `3d12 + 1` displayed, and has the context choices: `flat`, and `crit`.
    - `\roll [num: 1]` Draws a dice roll figure with `+ 1` displayed, and has the context choices: `flat`, `advantage`, and `disadvantage`.


* `\save` [`value`, `attr`]
    - Default option: `value`
    - If no `value` is specified, it will default to `0`
    - Valid `value` values: Any integer value greater than zero
    - If no `attr` is specified, it will default to `NONE`
    - Valid `attr` values: Any
    - `\save [12, attr: dex]` Draws a saving throw figure with DC 12 for the dex attribute


* `\set` [`identifier`]
    - Default option: `identifier`
    - If no `identifier` is specified, the command will be ignored
    - If no body is specified, the command will be ignored
    - `\set [var] {test}` Sets the variable `$var` to `test`