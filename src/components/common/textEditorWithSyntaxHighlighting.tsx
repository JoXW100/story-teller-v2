import React, { useContext, useEffect, useRef } from 'react';
import Prism from "prismjs"
import styles from 'styles/components/textEditor.module.scss';
import Parser from 'utils/parser';
import { Context } from 'components/contexts/appContext';
import TextEditor from './textEditor';

type TextEditorProps = React.PropsWithRef<{
    text: string
    className?: string
    handleInput: (value: string) => void
    handleContext?: (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => void
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

const TextEditorWithSyntaxHighlighting = ({ className, text, handleInput, handleContext }: TextEditorProps): JSX.Element => {
    const [context] = useContext(Context)
    const ref = useRef<HTMLTextAreaElement>()
    const editRef = useRef<HTMLTextAreaElement>()
    const highlightRef = useRef<HTMLPreElement>()
    const name = className ? `${className} ${styles.holder}` : styles.holder

    const handleKey = (e : React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.code === 'Tab') {
            e.preventDefault();
            var target: HTMLTextAreaElement = e.target as unknown as HTMLTextAreaElement
            var start = target.selectionStart;
            target.value = `${target.value.substring(0, start)}\t${target.value.substring(start)}`;
            target.selectionStart = target.selectionEnd = start + 1;
            handleInput(target.value);
        }
    }

    const handleScroll = () => {
        highlightRef.current.scrollTop = editRef.current.scrollTop;
        highlightRef.current.scrollLeft = editRef.current.scrollLeft;
    }

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = text
                .replace(new RegExp("&", "g"), "&amp;")
                .replace(new RegExp("<", "g"), "&lt;")
            Prism.highlightElement(ref.current)
        }
    }, [ref.current, text])

    if (context.enableSyntaxHighlighting) {
        return (
            <div className={name}>
                <textarea 
                    ref={editRef}
                    id={styles.editing}
                    value={text}
                    onChange={(e) => handleInput(e.target.value)}
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
    else {
        return (
            <TextEditor 
                className={className} 
                text={text} 
                handleInput={handleInput}
                handleContext={handleContext}/>
        )
    }
    
}

export default TextEditorWithSyntaxHighlighting;