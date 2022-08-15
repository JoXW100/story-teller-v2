import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import TextEditor from 'components/textEditor/simple-textEditor';
import '@types/editor';

/** @returns {JSX.Element} */
const EditorComponent = () => {
    const [context, dispatch] = useContext(Context)

    /** @param {React.KeyboardEvent<HTMLElement>} e */
    const handleInput = (e) => {
        dispatch.setText(e.target.value);
    }

    return (
        <TextEditor 
            text={context.file?.content.text} 
            handleInput={handleInput}
        />
    )
}

export default EditorComponent;