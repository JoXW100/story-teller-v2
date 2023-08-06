import { Context } from "components/contexts/appContext";
import { useContext } from "react";

const useTextHandling  = (onChange: (value: string) => void): [
    handleChange: React.ChangeEventHandler<HTMLTextAreaElement>, 
    handleKey: React.KeyboardEventHandler<HTMLTextAreaElement>
] => {
    const [context] = useContext(Context)
    const MatchLastWorldExpression = /\s(\S*)$/;
    const MatchLastLineExpression = /.*$/;

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        var target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
        var value = target.value;
        if (context.automaticLineBreak > 0) {
            var preSelect = value.slice(0, target.selectionStart)
            var postSelect = value.slice(target.selectionStart)
            var length = MatchLastLineExpression.exec(preSelect)[0].replace('\t', '____').length;
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
        if (e.code === 'Tab') {
            e.preventDefault();
            var target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
            var start = target.selectionStart;
            target.value = `${target.value.substring(0, start)}\t${target.value.substring(start)}`;
            target.selectionStart = target.selectionEnd = start + 1;
            onChange(target.value);
        }
        if (e.code === 'Enter') {
            var target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
            target.scrollLeft = 0;
        }
    }

    return [handleChange, handleKey]
}

export default useTextHandling;