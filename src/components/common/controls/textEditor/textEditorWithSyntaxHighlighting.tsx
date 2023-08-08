import React, { useContext, useEffect, useRef, useState } from 'react';
import Prism from "prismjs"
import { Context } from 'components/contexts/appContext';
import { ElementDictionary, getElement } from 'data/elements';
import useTextHandling from 'utils/handlers/textHandler';
import Parser from 'utils/parser';
import Logger from 'utils/logger';
import { TextEditorProps } from '.';
import openTextEditorContext from './contextMenu';
import { Point } from 'types/contextMenu';
import styles from 'styles/components/textEditor.module.scss';

type DialogType = "none" | "option" | "function" | "variable"

interface DialogState {
    left: number
    top: number
    options: string[]
    type: DialogType
    index: number
}

const characterWidth = 7.2;
const characterHeight = 15.05;
const dialogShowExpression = /([\$\\])([a-z0-9]*)$/i
const dialogFunctionOptionExpression = /\\([a-z0-9]+)[ \t\n\r]*\[[^\]]*?(?:,? *([a-z0-9]*))$/i
const dialogReplaceExpression = /([a-z0-9]*)$/i


const TextEditorWithSyntaxHighlighting = ({ className, text, variables, onChange }: TextEditorProps): JSX.Element => {
    const [context] = useContext(Context)
    const [state, setState] = useState<DialogState>({ left: 0, top: 0, options: [], type: "none", index: -1 })
    const [handleChange, handleKey, handlePreInput] = useTextHandling(onChange)
    const ref = useRef<HTMLTextAreaElement>()
    const dialog = useRef<HTMLDialogElement>()
    const highlightRef = useRef<HTMLPreElement>()
    const name = className ? `${className} ${styles.holder}` : styles.holder
    const elements = Object.keys(ElementDictionary);
    const dialogIsOpen = state.options.length > 0;

    const clearDialog = () => {
        setState({ ...state, left: 0, top: 0, options: [], type: "none", index: -1 })
    } 

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        handlePreInput(e);
        if (dialog.current) {
            const target: HTMLTextAreaElement = e.currentTarget
            const start = target.selectionStart;
            const startText = target.value.substring(0, start)
            const lines = startText.split('\n');
            const lastLine = lines[lines.length - 1];
            var match = dialogShowExpression.exec(lastLine);
            var options: string[] = [];
            var type: DialogType = "none";

            if (match) {
                if (match[1] === "$") {
                    options = variables?.filter((variable) => variable.startsWith(match[2])) ?? []
                    type = "variable"
                } else if (match[1] === "\\") {
                    options = elements.filter((element) => element.startsWith(match[2])) ?? []
                    type = "function"
                } else {
                    Logger.throw("textEditorWithSyntaxHighlighting.handleInput", new Error(match[1]))
                }
            } else if ((match = dialogFunctionOptionExpression.exec(startText))) {
                var element = getElement(match[1]);
                if (element) {
                    options = Array.from(element.validOptions ?? [])
                                   .filter((option => option.startsWith(match[2])))
                    type = "option"
                }
            }
            else {
                clearDialog();
                return;
            }
            const positionX = 5 + characterWidth * lastLine.replace(/\t/g, '    ').length;
            const positionY = 5 + characterHeight * lines.length;
            setState({ ...state, left: positionX, top: positionY, options: options, type: type })
        }
        handleScroll(e);
    }

    const handleScroll: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        const target: HTMLTextAreaElement = e.currentTarget
        highlightRef.current.scrollTop = target.scrollTop;
        highlightRef.current.scrollLeft = target.scrollLeft;
    }

    const handlePreKey: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        const target: HTMLTextAreaElement = e.currentTarget
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
                    if (state.index !== -1 && state.type !== "none") {
                        var selection: number = target.selectionEnd;
                        var start = target.value.substring(0, target.selectionStart)
                        var end = target.value.substring(target.selectionEnd)
                        const endsWithWhiteSpace = end.startsWith(" ");
                        const isOption = state.type === "option";
                        start = start.replace(dialogReplaceExpression, (...x) => {
                            selection += state.options[state.index].length - x[0].length
                            if (isOption) selection += 1;
                            if (!endsWithWhiteSpace) selection += 1;
                            return `${state.options[state.index]}${isOption ? ":" : ""}${endsWithWhiteSpace ? "" : " "}`;
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

    const handleContext: React.MouseEventHandler<HTMLTextAreaElement> = (e) => {
        e.preventDefault()
        e.stopPropagation()
        var point: Point = { x: e.clientX, y: e.clientY }
        openTextEditorContext(e.currentTarget, point, onChange)
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
                    'bracket': /\[|\]/,
                    'option': /[a-z0-9]+(?=:)(?!:\/)/i,
                    'separator': /,|:/,
                    'line': /\n|\r/,
                    'tab': /\t/,
                    'text': / *\S+/ 
                }
            },
            'bracket': /[\{\}]/,
            'variable': variables?.length ?? 0 > 0 
                ? new RegExp(`\\$(?:${variables.join('|')})(?![a-z0-9]+)`, "i")
                : Parser.matchVarsExpr,
            'variable error': Parser.matchVarsExpr,
            'line': /\n/,
            'tab': /\t/,
            'text': / *\S+/
        }
    }, [variables, elements])

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
                    ref={dialog} 
                    id={styles.dialog} 
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
                                data={state.index === index ? "selected" : undefined}>
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