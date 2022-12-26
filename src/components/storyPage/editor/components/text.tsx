import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import { TextTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss';

type TextComponentProps = React.PropsWithChildren<{
    params: TextTemplateParams
}>

const TextComponent = ({ params }: TextComponentProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const value: string = context.file?.metadata 
        ? context.file.metadata[params.key] ?? ''
        : '';

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch.setMetadata(params.key, e.target.value);
    }

    return (
        <div className={styles.editText}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <input value={value} onChange={handleInput}/>
        </div>
    )
}
export default TextComponent;