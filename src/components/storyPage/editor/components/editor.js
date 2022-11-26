import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import { openContext } from 'components/contextMenu';
import TextEditor from 'components/textEditor/simple-textEditor';
import EditIcon from '@mui/icons-material/EditSharp';
import AlignIcon from '@mui/icons-material/AlignHorizontalLeftSharp';
import BoxIcon from '@mui/icons-material/CheckBoxOutlineBlankSharp';
import CopyIcon from '@mui/icons-material/ContentCopySharp';
import PasteIcon from '@mui/icons-material/ContentPasteSharp';
import BlockIcon from '@mui/icons-material/GridViewSharp';
import BoldIcon from '@mui/icons-material/FormatBoldSharp';
import LinkIcon from '@mui/icons-material/InsertLinkSharp';
import Localization from 'classes/localization';

/** @returns {JSX.Element} */
const EditorComponent = () => {
    const [context, dispatch] = useContext(Context)

    /** @param {React.KeyboardEvent<HTMLTextAreaElement>} e */
    const handleInput = (e) => {
        dispatch.setText(e.target.value);
    }

    /** 
     * @param {HTMLTextAreaElement} e
     * @param {string} insertion
     */
    const insertText = (e, insertion) => {
        var end = e.selectionEnd + insertion.length
        e.value = e.value.substring(0, e.selectionStart) + insertion + e.value.substring(e.selectionEnd)
        e.select()
        e.selectionStart = end
        e.selectionEnd = end
    }

    /** @param {React.MouseEvent<HTMLTextAreaElement>} e */
    const handleContext = (e) => {
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
                        text: Localization.toText('editor-insert-bold'), 
                        icon: BoldIcon, 
                        action: () => insertText(target, `\\bold {${selection}}`),
                    },
                    {
                        text: Localization.toText('editor-insert-box'), 
                        icon: BoxIcon, 
                        action: () => insertText(target, `\\box[true] {${selection}}`),
                    },
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
            }
        ], { x: e.pageX, y: e.pageY }, true)
    }

    return (
        <TextEditor 
            text={context.file?.content.text} 
            handleInput={handleInput}
            handleContext={handleContext}
        />
    )
}

export default EditorComponent;