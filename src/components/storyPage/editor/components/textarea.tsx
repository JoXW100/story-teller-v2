import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import TextEditor from 'components/common/controls/textEditor';
import { TemplateComponentProps } from '.';
import { getRelativeMetadata } from 'utils/helpers';
import { TextareaTemplateParams } from 'types/templates';
import { IParserMetadata } from 'types/elements';
import styles from 'styles/pages/storyPage/editor.module.scss';

const TextareaComponent = ({ params }: TemplateComponentProps<TextareaTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const value: string = metadata?.[params.key] ?? params.default ?? ''

    const handleInput = (value: string) => {
        dispatch.setMetadata(params.key, value);
    }

    const variables = (context.file?.metadata as IParserMetadata)?.$vars?.[params.key] ?? {}

    return (
        <div 
            className={styles.editTextArea}
            data={params.fill ? 'fill' : undefined}>
            <b>{`${params.label ?? "label"}:`}</b>
            <TextEditor 
                className={styles.editTextEditor}
                text={value} 
                useSyntaxEditor={params.useSyntaxEditor} 
                variables={Object.keys(variables)} 
                onChange={handleInput}/>
        </div>
    )
}

export default TextareaComponent;