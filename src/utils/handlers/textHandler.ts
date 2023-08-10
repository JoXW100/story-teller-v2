import { Context } from "components/contexts/appContext";
import { useContext } from "react";

const MatchLastWorldExpression = /\s(\S*)$/;
const MatchLastLineExpression = /.*$/;
const ReplaceLastLineAfterLineBreakWithTabExpression = /[\n\r]\t(.*)$/g
const ReplaceLastLineAfterLineBreakExpression = /[\n\r](.*)$/g
const ReplaceStartOfLinesWithTabExceptFirstExpression = /([\n\r])^\t/gm
const ReplaceStartOfLinesExceptFirstExpression = /([\n\r])^/gm

const useTextHandling  = (onChange: (value: string) => void): [
    handleChange: React.ChangeEventHandler<HTMLTextAreaElement>, 
    handleKey: React.KeyboardEventHandler<HTMLTextAreaElement>,
    handleInput: React.FormEventHandler<HTMLTextAreaElement>
] => {
    const [context] = useContext(Context)

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        const target: HTMLTextAreaElement = e.currentTarget
        let value = target.value;
        if (context.automaticLineBreak > 0) {
            let preSelect = value.slice(0, target.selectionStart)
            let postSelect = value.slice(target.selectionStart)
            let length = MatchLastLineExpression.exec(preSelect)[0].replace('\t', '____').length;
            if (length > context.automaticLineBreak) {
                preSelect = preSelect.replace(MatchLastWorldExpression, (...x) => `\n${x[1]}`);
                value = preSelect + postSelect
                target.scrollLeft = 0;
                target.value = value;
                target.setSelectionRange(preSelect.length, preSelect.length);
            }
        }
        onChange(value);
    }

    const handleKey: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        const target: HTMLTextAreaElement = e.currentTarget
        if (e.code === 'Tab') {
            e.preventDefault();
            let start = target.selectionStart;
            let end = target.selectionEnd;
            let stringStart = target.value.substring(0, start);
            let stringMiddle = target.value.substring(start, end);
            let stringEnd = target.value.substring(end);
            if (e.shiftKey && start === end) {
                let countStart = 0;
                stringStart = stringStart.replace(ReplaceLastLineAfterLineBreakWithTabExpression, (...x) => { countStart++; return `\n${x[1]}` })
                target.value = stringStart + stringEnd;
                target.selectionStart = target.selectionEnd = start - countStart;
            } else if (e.shiftKey) {
                let countStart = 0, count = 0;
                stringStart = stringStart.replace(ReplaceLastLineAfterLineBreakWithTabExpression, (...x) => { countStart++; return `\n${x[1]}` })
                stringMiddle = stringMiddle.replace(ReplaceStartOfLinesWithTabExceptFirstExpression, () => { count++; return '\n' })
                target.value = `${stringStart}${stringMiddle}${stringEnd}`;
                target.selectionStart = start - countStart;
                target.selectionEnd = end - countStart - count;
            } else if (start === end) {
                target.value = `${stringStart}\t${stringEnd}`;
                target.selectionStart = target.selectionEnd = start + 1;
            } else {
                let countStart = 0, count = 0;
                stringStart = stringStart.replace(ReplaceLastLineAfterLineBreakExpression, (...x) => { countStart++; return `\n\t${x[1]}` })
                stringMiddle = stringMiddle.replace(ReplaceStartOfLinesExceptFirstExpression, () => { count++; return '\n\t' })
                target.value = `${stringStart}${stringMiddle}${stringEnd}`;
                target.selectionStart = start + countStart;
                target.selectionEnd = end + countStart + count;
            }
            onChange(target.value);
        }
        if (e.code === 'Enter') {
            target.scrollLeft = 0;
        }
    }

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        const target: HTMLTextAreaElement = e.currentTarget
        const input = e.nativeEvent as InputEvent

        const start = target.selectionStart;
        const startText = target.value.substring(0, start)
        if (input.data === '[') {
            target.value = `${startText}]${target.value.substring(start)}`;
            target.selectionStart = target.selectionEnd = start;
        } else if (input.data === '{') {
            target.value = `${startText}}${target.value.substring(start)}`;
            target.selectionStart = target.selectionEnd = start;
        }
    }

    return [handleChange, handleKey, handleInput]
}

export default useTextHandling;