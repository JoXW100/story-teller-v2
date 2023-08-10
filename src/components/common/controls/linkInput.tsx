import { useEffect, useState } from 'react'
import RemoveIcon from '@mui/icons-material/Remove';
import { isObjectId } from 'utils/helpers';
import { useFile } from 'utils/handlers/files';
import { ObjectId } from 'types/database';
import { FileType } from 'types/database/files';
import styles from 'styles/components/linkInput.module.scss';

type EditLinkInputComponentProps = React.PropsWithRef<{
    className?: string
    value: ObjectId
    placeholder: string
    fileTypes: FileType[]
    onUpdate: (value: ObjectId) => void
}>

interface EditLinkInputState {
    text: ObjectId
    error: boolean
    highlight: boolean
}

const LinkInput = ({ className, value, placeholder, fileTypes, onUpdate }: EditLinkInputComponentProps): JSX.Element => {
    const [state, setState] = useState<EditLinkInputState>({ text: value, error: false, highlight: false })
    const [file, loading] = useFile(value)
    const style = className ? `${styles.holder} ${className}` : styles.holder;
    const valid: boolean = value && !loading && file !== null;
    const name: string = file?.metadata?.name ?? file?.metadata?.title
    const allowedFiles = new Set<FileType>(fileTypes)

    const handleRemove: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        onUpdate(null);
    }

    const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && allowedFiles.has(window.dragData.file.type)) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    const handleDragEnter = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && allowedFiles.has(window.dragData.file.type)) {
            e.preventDefault();
            e.stopPropagation();
            setState({ ...state, highlight: true });
        }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && allowedFiles.has(window.dragData.file.type)) {
            e.preventDefault();
            setState({ ...state, highlight: false });
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && allowedFiles.has(window.dragData.file.type)) {
            e.preventDefault();
            e.stopPropagation();
            let id = window.dragData.file.id;
            window.dragData.target = null;
            window.dragData.file = null;
            onUpdate(id)
        }
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        let value = e.target.value
        if (isObjectId(value) || value === "") {
            onUpdate(value === "" ? null : value);
            setState({ ...state, text: value, error: false, highlight: false })
        } else {
            setState({ ...state, text: value, error: true, highlight: false })
        }
    }

    useEffect(() => {
        setState({ ...state, text: value, error: false, highlight: false })
    }, [value])

    return (
        <div className={style}>
            <input 
                type="text" 
                value={valid ? name : state.text as string} 
                onChange={handleChange}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                placeholder={placeholder}
                data={state.highlight ? "highlight" : undefined}
                disabled={valid}
                error={String(state.error)}/>
            <button onClick={handleRemove} disabled={!valid}>
                <RemoveIcon sx={{ width: '100%' }}/>
            </button>
        </div>
    )
}

export default LinkInput;