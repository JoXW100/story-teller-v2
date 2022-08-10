import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Editor, Transforms  } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import styles from 'styles/components/textEditor.module.scss'

const TextEditor = ({ text }) => {
    const [state, setState] = useState({
        value: [{ children: [{ text: "" }]}]
    })

    const decorateFunctions = (ranges, [node, path]) => {
        const regex = /\\([a-z]+)( *)(?:\[([^\]]*)\])?( *)(?:\{([^}]*)\})?/gi
        let match = null;
        while ((match = regex.exec(node.text)) !== null) {
            const data = { 
                match: match[0], 
                command: match[1], 
                params: match[3], 
                content: match[5], 
                padding: {
                    params: match[2],
                    content: match[4]
                }
            }
            let end = match.index
            if (data.command !== undefined) {
                ranges.push({
                    type: "command",
                    data: data,
                    anchor: { path, offset: end },
                    focus: { path, offset: (end = end + data.command.length + 1)}
                })
            }
            if (data.params !== undefined) {
                ranges.push({
                    type: "command-params",
                    data: data,
                    anchor: { path, offset: (end = end + data.padding.params.length)},
                    focus: { path, offset: (end = end + data.params.length + 2)}
                })
            }
            if (data.content !== undefined) {
                ranges.push({
                    type: "command-content",
                    data: data,
                    anchor: { path, offset: (end = end + data.padding.content.length)},
                    focus: { path, offset: (end = end + data.content.length + 2)}
                })
            }
        }
    }

    const editor = useMemo(() => withHistory(withReact(createEditor())), [])
    const renderer = useCallback(EditorRenderer, [])
    const leaf = useCallback(EditorLeaf, [])
    const decorate = useCallback((data) => {
        const ranges = []
        decorateFunctions(ranges, data)
        return ranges
    }, [])

    /** @param {import('react').KeyboardEvent} e */
    const handleKey = (e) => {
        switch (e.key) {
            case "Tab":
                e.preventDefault()
                e.stopPropagation()
                editor.insertText('\t')
            default:
                break;
        }
    }

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent} e */
    const handleClick = (e) => {
        if (e.currentTarget === e.target) {
            ReactEditor.focus(editor)
            Transforms.select(editor, Editor.end(editor, []))
        }
    }

    return (
        <div className={styles.main} onClick={handleClick}>
           <Slate 
                editor={editor}
                value={state.value}
                onChange={(e) => setState({ value: e })}
            >
                <Editable 
                    renderElement={renderer}
                    renderLeaf={leaf}
                    decorate={decorate}
                    onKeyDown={handleKey}
                    spellCheck
                />
            </Slate>
        </div>
    )
}

const EditorRenderer = (props) => {
    const { children, attributes } = props

    return (
        <div className={styles.line} {...attributes}> 
            {children} 
        </div>
    )
}

const EditorLeaf = ({ attributes, children, leaf }) => {
    const types = {
        "command": styles.command,
        "command-params": styles.params,
        "command-content": styles.content,
        "undefined": ''
    }

    return (
        <span 
            { ...attributes } 
            className={styles.leaf + ' ' + types[leaf.type]}
        >
            { children }
        </span>
    )
}


export default TextEditor