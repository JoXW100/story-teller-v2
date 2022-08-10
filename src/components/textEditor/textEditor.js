import React, { useEffect } from 'react';
import { useRef } from 'react';
import styles from 'styles/components/textEditor.module.scss';

const TextEditor = ({ text = "Hello World" }) => {

    const input = useRef();
    const dummy = useRef();

    /** @param {React.KeyboardEvent<HTMLElement>} e */
    const handleInput = (e) => {
        if (e.currentTarget.innerHTML === "<br>" || !e.currentTarget.innerHTML) {
            e.currentTarget.innerHTML = "<div></div>"
        }
        dummy.current.innerHTML = e.currentTarget.innerHTML.replace(/select|from/ig, (str) => (
            `<span class="${styles.highlight}">${str}</span>`
        ))
    }

    useEffect(() => {
        if (input.current && dummy.current) {
            var content = `<div>${text}</div>`;
            input.current.innerHTML = content;
            dummy.current.innerHTML = content;
        }
    }, [input.current, dummy.current, text])


    return (
        <div className={styles.holder}>
            <div 
                ref={input}
                className={styles.input} 
                onInput={handleInput}
                contentEditable
            />
            <div ref={dummy} className={styles.dummy}/>
        </div>
    )
}

export default TextEditor;