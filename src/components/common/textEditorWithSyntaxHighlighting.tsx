import React, { useContext, useEffect, useRef } from 'react';
import useTextHandling from 'utils/handlers/textHandler';
import Prism from "prismjs"
import Parser from 'utils/parser';
import { Context } from 'components/contexts/appContext';
import styles from 'styles/components/textEditor.module.scss';

type TextEditorProps = React.PropsWithRef<{
    className?: string
    text: string
    onChange: (value: string) => void
    handleContext?: React.MouseEventHandler<HTMLTextAreaElement>
}>

Prism.languages["custom"] = {
    'function': {
        pattern: Parser.matchFunctionExpr,
        inside: {
            'name': /\\[a-z0-9]+/i,
            'bracket': /[\[\]]/,
            'option': /[a-z]+(?=:)(?!:\/)/i,
            'separator': /[,:]/,
            'line': /\n/,
            'tab': /\t/,
        }
    },
    'bracket': {
        pattern: /[\{\}]/
    },
    'variable': Parser.matchVarsExpr,
    'line': /\n/,
    'tab': /\t/,
    'text': /.+/ 
}

const TextEditorWithSyntaxHighlighting = ({ className, text, onChange, handleContext }: TextEditorProps): JSX.Element => {
    const [context] = useContext(Context)
    const [handleChange, handleKey] = useTextHandling(onChange)
    const ref = useRef<HTMLTextAreaElement>()
    const highlightRef = useRef<HTMLPreElement>()
    const name = className ? `${className} ${styles.holder}` : styles.holder

    const handleScroll: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        var target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
        highlightRef.current.scrollTop = target.scrollTop;
        highlightRef.current.scrollLeft = target.scrollLeft;
    }

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = text
                .replace(new RegExp("&", "g"), "&amp;")
                .replace(new RegExp("<", "g"), "&lt;")
            Prism.highlightElement(ref.current)
        }
    }, [ref.current, text])

    return (
        <div className={name}>
            <textarea 
                id={styles.editing}
                value={text}
                onChange={handleChange}
                onContextMenu={handleContext}
                onKeyDown={handleKey}
                onInput={handleScroll}
                onScroll={handleScroll}
                placeholder="Enter text here"
                data={context.enableRowNumbers ? 'show' : undefined}/>
            <pre ref={highlightRef} id={styles.highlighting} aria-hidden="true">
                <code 
                    ref={ref} 
                    id={styles.highlightingContent}
                    className="language-custom"
                    data={context.enableRowNumbers ? 'show' : undefined}/>
            </pre>
        </div>
    )
}

export default TextEditorWithSyntaxHighlighting;