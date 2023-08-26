import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import { TemplateComponentProps } from '.';
import { getRelativeMetadata } from 'utils/helpers';
import { TextTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';

const TextComponent = ({ params }: TemplateComponentProps<TextTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const value: string = metadata?.[params.key] ?? params.default ?? ''

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch.setMetadata(params.key, e.target.value);
    }

    return (
        <div className={styles.editGroupItem}>
            <b>{`${ params.label ?? "label"}:`}</b>
            <input 
                className={styles.editInput}
                value={value} 
                type="text"
                placeholder={params.placeholder}
                onChange={handleInput}/>
        </div>
    )
}
export default TextComponent;