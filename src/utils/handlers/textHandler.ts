import { Context } from "components/contexts/appContext";
import { useContext, useState } from "react";

const useTextHandling  = (onChange: (value: string) => void): [
    handleChange: React.ChangeEventHandler<HTMLTextAreaElement>, 
    handleKey: React.KeyboardEventHandler<HTMLTextAreaElement>,
    handleScroll: React.FormEventHandler<HTMLTextAreaElement>
] => {
    const [context] = useContext(Context)
    const [state, setState] = useState({ post: false, pre: false });
    const MatchLastWorldExpression = /\s(\S*)$/;

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        var target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
        var value = target.value;
        if (context.enableAutomaticLineBreak && state.pre && !state.post) {
            var preSelect = value.slice(0, target.selectionStart)
            var postSelect = value.slice(target.selectionStart)
            preSelect = preSelect.replace(MatchLastWorldExpression, (...x) => `\n${x[1]}`);
            value = preSelect + postSelect
            target.scrollLeft = 0;
            target.value = value;
            target.setSelectionRange(preSelect.length, preSelect.length);
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

    const handleScroll: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
        var target: HTMLTextAreaElement = e.target as HTMLTextAreaElement
        if (context.enableAutomaticLineBreak) {
            setState({ post: target.scrollLeft == 0, pre: state.post });
        }
    }

    return [handleChange, handleKey, handleScroll]
}

export default useTextHandling;