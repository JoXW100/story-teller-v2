import React, { useContext } from 'react'
import EditIcon from '@mui/icons-material/EditSharp';
import AlignIcon from '@mui/icons-material/AlignHorizontalLeftSharp';
import BoxIcon from '@mui/icons-material/CheckBoxOutlineBlankSharp';
import CopyIcon from '@mui/icons-material/ContentCopySharp';
import PasteIcon from '@mui/icons-material/ContentPasteSharp';
import BlockIcon from '@mui/icons-material/GridViewSharp';
import BoldIcon from '@mui/icons-material/FormatBoldSharp';
import TableIcon from '@mui/icons-material/TableChartSharp';
import LinkIcon from '@mui/icons-material/InsertLinkSharp';
import LayoutIcon from '@mui/icons-material/DashboardSharp';
import InteractiveIcon from '@mui/icons-material/TouchAppSharp';
import CenterIcon from '@mui/icons-material/FilterCenterFocusSharp';
import DiceIcon from '@mui/icons-material/CasinoSharp';
import LineIcon from '@mui/icons-material/HorizontalRuleSharp';
import SpaceIcon from '@mui/icons-material/SpaceBarSharp';
import IconIcon from '@mui/icons-material/InsertEmoticonSharp';
import ImageIcon from '@mui/icons-material/InsertPhotoSharp';
import TextIcon from '@mui/icons-material/TextFieldsSharp';
import FormatIcon from '@mui/icons-material/FormatAlignCenterSharp';
import { Context } from 'components/contexts/fileContext';
import { openContext } from 'components/common/contextMenu';
import TextEditor from 'components/common/textEditor';
import Localization from 'utils/localization';
import { TemplateComponentProps } from '.';
import Elements, { ElementDictionary } from 'elements';
import { FileTemplateParams } from 'types/templates';
import { ElementObject } from 'types/elements';

const EditorComponent = ({}: TemplateComponentProps<FileTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)

    const handleInput = (value: string) => {
        dispatch.setText(value);
    }

    const insertText = (e: HTMLTextAreaElement, insertion: string) => {
        var end = e.selectionEnd + insertion.length
        e.value = e.value.substring(0, e.selectionStart) + insertion + e.value.substring(e.selectionEnd)
        e.select()
        e.selectionStart = end
        e.selectionEnd = end
        handleInput(e.value);
    }

    const formatText = (e: HTMLTextAreaElement) => {
        const maxSize = 80
        let text = e.value.replace(/(\t|\n|\r)/g, '')
        let parts = text.split(/(\\[a-z0-9]+ *(?:\[[^\]]+\])?(?:[^a-z0-9\\]*{)?|})/gi) //(\\[a-z0-9]+ *(?:\[([^]]+)\])?) *({)?|(})
        let depth = 0
        let result = ""
        let queue = []
        var match: RegExpExecArray | null;
        var element: ElementObject;
        var prev: ElementObject = null;
        for (let index = 0; index < parts.length; index++) {
            let value = parts[index];
            if (value == '}') {
                element = queue.pop()
                depth--
                if (element.container) {
                    result += `\n${'\t'.repeat(depth)}}\n${'\t'.repeat(depth)}`
                } else {
                    result += '}'
                }
                if (element.lineBreak && !element.container) {
                    result += `\n${'\t'.repeat(depth)}`
                }
            } else if (match = /\\([a-z0-9]+) *(?:\[([^\]]+)\])?(?:[^a-z0-9\\]*({))?/i.exec(value)) {
                if (element = ElementDictionary[match[1]]) {
                    if (prev && !prev.lineBreak && !element.inline) {
                        result += `\n${'\t'.repeat(depth)}`
                    }
                    result += `\\${match[1]}`
                    if (match[2]) { result += `[${match[2]}]` }
                    if (match[3]) {
                        queue.push(element)
                        depth++; 
                        result += ' {'; 
                    } 
                    if ((!match[3] || element.container) && element.lineBreak) {
                        result += `\n${'\t'.repeat(depth)}`
                    }
                    prev = element
                } else {
                    console.warn(`${match[1]} is not a recognized command`)
                }
            } else if (value) {
                let size = depth * 4
                result += value;
                prev = ElementDictionary['text']
            }
        }
        console.log("formatText:\n", result)
    }

    const handleContext = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        e.preventDefault()
        e.stopPropagation()
        var target = e.currentTarget;
        var selection = target.value.substring(target.selectionStart, target.selectionEnd)
        openContext([
            {
                text: Localization.toText('editor-insert'), 
                icon: EditIcon,
                content: [
                    {
                        text: Localization.toText('editor-insert-layout'),
                        icon: LayoutIcon,
                        content: [
                            {
                                text: Localization.toText('editor-insert-align'), 
                                icon: AlignIcon, 
                                action: () => insertText(target, `\\align[hc] {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-block'), 
                                icon: BlockIcon, 
                                action: () => insertText(target, `\\block {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-table'), 
                                icon: TableIcon, 
                                action: () => insertText(target, `\\table {\n\t\\th{ Header }\n\t\\tc{${selection}}\n}`),
                            },
                            {
                                text: Localization.toText('editor-insert-box'), 
                                icon: BoxIcon, 
                                action: () => insertText(target, `\\box {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-center'), 
                                icon: CenterIcon, 
                                action: () => insertText(target, `\\center {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-line'), 
                                icon: LineIcon, 
                                action: () => insertText(target, `\\line`),
                            },
                            {
                                text: Localization.toText('editor-insert-space'), 
                                icon: SpaceIcon, 
                                action: () => insertText(target, `\\space`),
                            }
                        ]
                    },
                    {
                        text: Localization.toText('editor-insert-decoration'),
                        icon: ImageIcon,
                        content: [
                            {
                                text: Localization.toText('editor-insert-bold'), 
                                icon: BoldIcon, 
                                action: () => insertText(target, `\\bold {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-header'), 
                                icon: TextIcon, 
                                action: () => insertText(target, `\\h1 {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-subheader'), 
                                icon: TextIcon, 
                                action: () => insertText(target, `\\h2 {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-subsubheader'), 
                                icon: TextIcon, 
                                action: () => insertText(target, `\\h3 {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-icon'), 
                                icon: IconIcon, 
                                action: () => insertText(target, `\\icon[acid, tooltips: Acid]`),
                            },
                            {
                                text: Localization.toText('editor-insert-image'), 
                                icon: ImageIcon, 
                                action: () => insertText(target, `\\image[]`),
                            }
                        ]
                    },
                    {
                        text: Localization.toText('editor-insert-interactive'),
                        icon: InteractiveIcon,
                        content: [
                            {
                                text: Localization.toText('editor-insert-link'), 
                                icon: LinkIcon, 
                                action: () => insertText(target, `\\link[] {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-linkTitle'), 
                                icon: LinkIcon, 
                                action: () => insertText(target, `\\linkTitle[]`),
                            },
                            {
                                text: Localization.toText('editor-insert-linkContent'), 
                                icon: LinkIcon, 
                                action: () => insertText(target, `\\linkContent[]`),
                            },
                            {
                                text: Localization.toText('editor-insert-roll'), 
                                icon: DiceIcon, 
                                action: () => insertText(target, `\\roll[20, num: 1, mod: 0, mode: dice, desc: ..., tooltips: ...] {${selection}}`),
                            },
                            {
                                text: Localization.toText('editor-insert-save'), 
                                icon: DiceIcon, 
                                action: () => insertText(target, `\\save[10, type:temp, tooltips: ...]`),
                            }
                        ]
                    }
                ]
            },
            {
                text: Localization.toText('editor-copy'),
                icon: CopyIcon, 
                action: () => navigator.clipboard.writeText(selection),
            },
            {
                text: Localization.toText('editor-paste'),
                icon: PasteIcon, 
                action: () => navigator.clipboard.readText().then((res) => insertText(target, res)),
            },
            /*{
                text: Localization.toText('editor-format'),
                icon: FormatIcon, 
                action: () => formatText(target),
            }*/
        ], { x: e.pageX, y: e.pageY }, true)
    }

    return (
        <TextEditor
            text={context.file?.content.text} 
            handleInput={handleInput}
            handleContext={handleContext}/>
    )
}

export default EditorComponent;