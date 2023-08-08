import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import TextEditor from 'components/common/controls/textEditor';
import { TemplateComponentProps } from '.';
import { IFileTemplateParams } from 'types/templates';

const EditorComponent = ({}: TemplateComponentProps<IFileTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)

    const handleInput = (value: string) => {
        dispatch.setText(value);
    }

    const variables = (context.file?.metadata?.$vars ?? {}).$content ?? {}

    return (
        <TextEditor
            text={context.file?.content.text} 
            onChange={handleInput}
            variables={Object.keys(variables)}/>
    )
}

export default EditorComponent;