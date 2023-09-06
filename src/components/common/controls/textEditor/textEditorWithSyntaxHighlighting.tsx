import React, { useContext, useEffect, useRef } from 'react';
import Prism from "prismjs"
import { Context } from 'components/contexts/appContext';
import { TextEditorProps } from '.';
import openTextEditorContext from './contextMenu';
import useAutoCompleteDialog from '../../autoCompleteDialog';
import { ElementDictionary, getElement } from 'data/elements';
import useTextHandling from 'utils/handlers/textHandler';
import Parser from 'utils/parser';
import Logger from 'utils/logger';
import { Point } from 'types/contextMenu';
import { CreatureValue } from 'types/database/files/creature';
import styles from 'styles/components/textEditor.module.scss';

type DialogType = "none" | "option" | "function" | "variable" | "calc"

const characterWidth = 7.2;
const characterHeight = 15.05;
const dialogShowExpression = /(?:([\$\\])([a-z0-9]*)|(\$\{).*?([a-z]+))$/i
const dialogFunctionOptionExpression = /\\([a-z0-9]+)[ \t\n\r]*\[[^\]]*?(?:,? *([a-z0-9]*))$/i
const dialogReplaceExpression = /([a-z0-9]*)$/i


const TextEditorWithSyntaxHighlighting = ({ className, text, variables, onChange }: TextEditorProps): JSX.Element => {
    const [context] = useContext(Context)
    const [handleChange, handleKey, handlePreInput] = useTextHandling(onChange)
    const codeRef = useRef<HTMLTextAreaElement>()
    const highlightRef = useRef<HTMLPreElement>()
    const elements: string[] = Object.keys(ElementDictionary);
    const values: string[] = Object.values(CreatureValue)
    const name = className ? `${className} ${styles.holder}` : styles.holder

    const handleApply = (e: React.KeyboardEvent<HTMLTextAreaElement>, option: string, type: DialogType) => {
        const target: HTMLTextAreaElement = e.currentTarget;
        let selection: number = target.selectionEnd;
        let start = target.value.substring(0, target.selectionStart)
        const end = target.value.substring(target.selectionEnd)
        const endsWithWhiteSpace = end.startsWith(" ");
        const isOption = type === "option";
        start = start.replace(dialogReplaceExpression, (...x) => {
            selection += option.length - x[0].length
            if (isOption) selection += 1;
            if (!endsWithWhiteSpace) selection += 1;
            return `${option}${isOption ? ":" : ""}${endsWithWhiteSpace ? "" : " "}`;
        })
        target.value = start + end;
        // Reselect
        target.select()
        target.selectionStart = selection
        target.selectionEnd = selection
        handleScroll(e);
        onChange(target.value);
    }

    const [show, hide, onKeyPressed, AutoCompleteDialog] = useAutoCompleteDialog(handleApply)

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        handlePreInput(e);
        const target: HTMLTextAreaElement = e.currentTarget
        const start = target.selectionStart;
        const startText = target.value.substring(0, start)
        const lines = startText.split('\n');
        const lastLine = lines[lines.length - 1];
        let match = dialogShowExpression.exec(lastLine);
        let options: string[] = [];
        let type: DialogType = "none";

        if (match) {
            if (match[1] === "$") {
                options = variables?.filter((variable) => variable.startsWith(match[2])) ?? []
                type = "variable"
            } else if (match[1] === "\\") {
                options = elements.filter((element) => element.startsWith(match[2])) ?? []
                type = "function"
            } else if (match[3] === "${") {
                options = values.filter((value) => value.startsWith(match[4])) ?? []
                type = "calc"
            } else {
                Logger.throw("textEditorWithSyntaxHighlighting.handleInput", new Error(match[1]))
            }
        } else if ((match = dialogFunctionOptionExpression.exec(startText))) {
            let element = getElement(match[1]);
            if (element) {
                options = Array.from(element.validOptions ?? []).filter((option => option.startsWith(match[2])))
                type = "option"
            }
        } else {
            hide();
            return;
        }
        const positionX = 5 + characterWidth * lastLine.replace(/\t/g, '    ').length;
        const positionY = 5 + characterHeight * lines.length;
        show(positionX, positionY, options, type)
        handleScroll(e);
    }

    const handlePreKey: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (!onKeyPressed(e)) {
            e.preventDefault();
            e.stopPropagation();
        }
        handleKey(e);
    }

    const handleContext: React.MouseEventHandler<HTMLTextAreaElement> = (e) => {
        e.preventDefault()
        e.stopPropagation()
        let point: Point = { x: e.clientX, y: e.clientY }
        openTextEditorContext(e.currentTarget, point, onChange)
    }

    const handleScroll: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        const target: HTMLTextAreaElement = e.currentTarget;
        highlightRef.current.scrollTop = target.scrollTop;
        highlightRef.current.scrollLeft = target.scrollLeft;
    }

    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.innerHTML = text.replace("&", "&amp;").replace("<", "&lt;")
            Prism.highlightElement(codeRef.current)
            Prism.plugins
        }
    }, [codeRef.current, text])
    
    useEffect(() => {
        Prism.languages["custom"] = {
            'function': {
                pattern: Parser.matchFunctionExpr,
                inside: {
                    'name': {
                        pattern: /\\[a-z0-9]+/i,
                        inside: elements.length > 0 && {
                            'valid': new RegExp(`^\\\\(?:${elements.join('|')})$`),
                            'error': /.*/
                        }
                    },
                    'bracket': /\[|\]/,
                    'option': /[a-z0-9]+(?=:)(?!:\/)/i,
                    'calc': {
                        pattern: /\$\{[^}]+\}/,
                        inside: {
                            'variable': /\$/,
                            'bracket': /[\{\}]/,
                            'number': /-?[0-9]+/,
                            'value': {
                                pattern: /[a-z0-9]+/i,
                                inside: values.length > 0 && {
                                    'valid': new RegExp(`^${values.join('|')}$`),
                                    'error': /.*/
                                }
                            }
                        }
                    },
                    'separator': /,|:/,
                    'line': /\n|\r/,
                    'tab': /\t/,
                    'text': / *\S+/,
                }
            },
            'calc': {
                pattern: Parser.matchCalcExpr,
                inside: {
                    'variable': /^\$/,
                    'bracket': /[\{\}]/,
                    'number': /-?[0-9]+/,
                    'value': /[a-z0-9]+/i
                }
            },
            'bracket': /[\{\}]/,
            'variable': {
                pattern: Parser.matchVarsExpr,
                inside: variables?.length > 0 && {
                    'valid': new RegExp(`\\$(?:${variables.join('|')})(?![a-z0-9]+)`, "i"),
                    'error': /.*/
                }
            },
            'line': /\n|\r/,
            'tab': /\t/,
            'text': / *\S+/
        }
    }, [variables, ElementDictionary])

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
                onClick={hide}
                onBlur={hide}
                placeholder="Enter text here"
                spellCheck={false}
                data={context.enableRowNumbers ? 'show' : undefined}/>
            <pre ref={highlightRef} id={styles.highlighting} aria-hidden="true">
                <code 
                    ref={codeRef}
                    id={styles.highlightingContent}
                    className="language-custom"
                    data={context.enableRowNumbers ? 'show' : undefined}/>
                <AutoCompleteDialog 
                    className={styles.dialog} 
                    data={context.enableRowNumbers ? 'show' : undefined}/>
            </pre>
        </div>
    )
}

export default TextEditorWithSyntaxHighlighting;