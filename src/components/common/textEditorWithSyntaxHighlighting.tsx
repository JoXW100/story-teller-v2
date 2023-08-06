import React, { useContext, useEffect, useRef, useState } from 'react';
import useTextHandling from 'utils/handlers/textHandler';
import Prism from "prismjs"
import Parser from 'utils/parser';
import { Context } from 'components/contexts/appContext';
import styles from 'styles/components/textEditor.module.scss';
import { ElementDictionary } from 'elements';

type TextEditorProps = React.PropsWithRef<{
    className?: string
    text: string
    variables?: string[]
    onChange: (value: string) => void
    handleContext?: React.MouseEventHandler<HTMLTextAreaElement>
}>

interface DialogState {
    left: number
    top: number
    options: string[]
    index: number
}

const characterWidth = 7.2;
const characterHeight = 15;
const dialogShowExpression = /([\$\\])([a-z0-9]*)$/i


const TextEditorWithSyntaxHighlighting = ({ className, text, variables, onChange, handleContext }: TextEditorProps): JSX.Element => {
    const [context] = useContext(Context)
    const [state, setState] = useState<DialogState>({ left: 0, top: 0, options: [], index: -1 })
    const [handleChange, handleKey] = useTextHandling(onChange)
    const ref = useRef<HTMLTextAreaElement>()
    const dialog = useRef<HTMLDialogElement>()
    const highlightRef = useRef<HTMLPreElement>()
    const name = className ? `${className} ${styles.holder}` : styles.holder
    const elements = Object.keys(ElementDictionary);
    const dialogIsOpen = state.options.length > 0;

    const clearDialog = () => {
        setState({ ...state, left: 0, top: 0, options: [], index: -1 })
    } 

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        if (dialog.current) {
            const target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
            var lines = target.value.substring(0, target.selectionStart).split('\n');
            var lastLine = lines[lines.length - 1];
            var match = dialogShowExpression.exec(lastLine);
            if (match) {
                var positionX = 5 + characterWidth * lastLine.length;
                var positionY = 5 + characterHeight * lines.length;
                var options: string[] = [];
                if (match[1] === "$") {
                    options = variables?.filter((variable) => variable.startsWith(match[2])) ?? []
                } else if (match[1] === "\\") {
                    options = elements.filter((element) => element.startsWith(match[2])) ?? []
                }
                setState({ ...state, left: positionX, top: positionY, options: options })
            } else {
                clearDialog();
            }
        }

        handleScroll(e);
    }

    const handleScroll: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        const target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
        highlightRef.current.scrollTop = target.scrollTop;
        highlightRef.current.scrollLeft = target.scrollLeft;
    }

    const handlePreKey: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        const target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
        if (dialogIsOpen) {
            switch (e.key) {
                case "ArrowDown":
                    setState({ ...state, index: Math.min(state.index + 1, state.options.length - 1)})
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                case "ArrowUp":
                    setState({ ...state, index: Math.max(state.index - 1, -1)})
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                case "ArrowRight":
                case "ArrowLeft":
                case "Delete":
                case "Tab":
                    clearDialog();
                    break;
                case "Enter":
                    if (state.index !== -1) {
                        var selection: number = target.selectionEnd;
                        var start = target.value.substring(0, target.selectionStart)
                        var end = target.value.substring(target.selectionEnd)
                        start = start.replace(dialogShowExpression, (...x) => {
                            selection += state.options[state.index].length - x[0].length + 2;
                            return `${x[1]}${state.options[state.index]} `;
                        })
                        e.preventDefault();
                        e.stopPropagation();
                        target.value = start + end;
                        target.select()
                        target.selectionStart = selection
                        target.selectionEnd = selection
                        clearDialog();
                        onChange(target.value);
                        handleScroll(e);
                        return;
                    }
                    break;
                default:
                    break;
            }
        }
        handleKey(e);
    }

    useEffect(() => {
        if (dialog.current && state.index != -1) {
            dialog.current.children[0].children[state.index].scrollIntoView({ block: 'nearest' });
        }
    }, [state.index])

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = text
                .replace(new RegExp("&", "g"), "&amp;")
                .replace(new RegExp("<", "g"), "&lt;")
            Prism.highlightElement(ref.current)
            Prism.plugins
        }
    }, [ref.current, text])
    
    useEffect(() => {
        Prism.languages["custom"] = {
            'function': {
                pattern: Parser.matchFunctionExpr,
                inside: {
                    'name': new RegExp(`\\\\(?:${elements.join('|')})(?![a-z0-9]+)`, "i"),
                    'name error': /\\[a-z0-9]+/i,
                    'bracket': /[\[\]]/,
                    'option': /[a-z]+(?=:)(?!:\/)/i,
                    'separator': /[,:]/,
                    'line': /\n/,
                    'tab': /\t/,
                }
            },
            'bracket': /[\{\}]/,
            'variable': variables.length > 0 
                ? new RegExp(`\\$(?:${variables.join('|')})(?![a-z0-9]+)`, "i")
                : Parser.matchVarsExpr,
            'variable error': Parser.matchVarsExpr,
            'line': /\n/,
            'tab': /\t/,
            'text': /.+/ 
        }
    }, [variables])

    return (
        <div className={name}>
            <textarea 
                id={styles.editing}
                value={text}
                onChange={handleChange}
                onContextMenu={handleContext}
                onKeyDown={handlePreKey}
                onInput={handleInput}
                onScroll={handleScroll}
                onClick={clearDialog}
                onBlur={clearDialog}
                placeholder="Enter text here"
                spellCheck={false}
                data={context.enableRowNumbers ? 'show' : undefined}/>
            <pre ref={highlightRef} id={styles.highlighting} aria-hidden="true">
                <code 
                    ref={ref} 
                    id={styles.highlightingContent}
                    className="language-custom"
                    data={context.enableRowNumbers ? 'show' : undefined}/>
                <dialog 
                    ref={dialog} id={styles.dialog} 
                    role='complementary'
                    autoFocus={false}
                    open={dialogIsOpen}
                    data={context.enableRowNumbers ? 'show' : undefined}
                    tabIndex={-1}
                    style={{ left: state.left + "px", top: state.top + "px"}}>
                    <div className={styles.dialogContentHolder}>
                        { state.options.map((option, index) => (
                            <div 
                                key={option} 
                                className={styles.dialogOption}
                                data={state.index === index ? "selected" : undefined}
                                onClick={() => console.log("CLick!")}>
                                {option}
                            </div>
                        ))}
                    </div>
                </dialog>
            </pre>
        </div>
    )
}

export default TextEditorWithSyntaxHighlighting;