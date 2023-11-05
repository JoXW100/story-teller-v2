import { useEffect, useMemo, useState } from 'react'
import { isObjectId } from 'utils/helpers';
import { useFile } from 'utils/handlers/files';
import { FileType } from 'types/database/files';
import { ObjectId } from 'types/database';
import { FileGetMetadataResult } from 'types/database/responses';
import styles from 'styles/components/linkInput.module.scss';
import { isValidAbilityFormat } from 'utils/importers/stringFormatAbilityImporter';

type EditLinkTypeHelper<A extends boolean, S> = {
    className?: string
    value: ObjectId
    placeholder?: string
    disabled?: boolean
    allowedTypes?: FileType[]
    allowText?: A
    onChange: (value: S) => void
}

type EditLinkInputComponentPropsType = EditLinkTypeHelper<true, FileGetMetadataResult | string> | EditLinkTypeHelper<false, FileGetMetadataResult>

type EditLinkInputComponentProps = React.PropsWithRef<EditLinkInputComponentPropsType>

interface EditLinkInputState {
    text: string
    error: boolean
    highlight: boolean
}

const LinkInput = ({ className, value, placeholder, disabled, allowText, allowedTypes, onChange }: EditLinkInputComponentProps): JSX.Element => {
    const [state, setState] = useState<EditLinkInputState>({ text: value ? String(value) : "", error: false, highlight: false })
    const fileId = useMemo(() => isObjectId(state.text) ? state.text : null, [state.text])
    const [file, loading] = useFile(fileId, allowedTypes)
    const style = className ? `${styles.linkInput} ${className}` : styles.linkInput;
    const name: string = file?.metadata?.name ?? "..."

    const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && (!allowedTypes || allowedTypes.includes(window.dragData.file.type))) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    const handleDragEnter = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && (!allowedTypes || allowedTypes.includes(window.dragData.file.type))) {
            e.preventDefault();
            e.stopPropagation();
            setState({ ...state, highlight: true });
        }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && (!allowedTypes || allowedTypes.includes(window.dragData.file.type))) {
            e.preventDefault();
            setState({ ...state, highlight: false });
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && (!allowedTypes || allowedTypes.includes(window.dragData.file.type))) {
            e.preventDefault();
            e.stopPropagation();
            let id = window.dragData.file.id;
            window.dragData.target = null;
            window.dragData.file = null;
            setState({ ...state, text: id, error: false, highlight: false })
        }
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        let value = e.target.value
        if (allowText) {
            if (isValidAbilityFormat(value)) {
                onChange(value)
            } else {
                setState({ ...state, text: value, error: true, highlight: false })
            }
        } else if (isObjectId(value) || value === "" ) {
            setState({ ...state, text: value, error: false, highlight: false })
        } else {
            setState({ ...state, text: value, error: true, highlight: false })
        }
    }

    useEffect(() => {
        if (file && !loading && String(file.id) !== String(value)) {
            onChange(file)
        }
    }, [file, loading])

    useEffect(() => {
        if (String(value) !== state.text) {
            setState({ ...state, text: value ? String(value) : "", error: false, highlight: false })
        }
    }, [value])

    return (
        <input
            className={style}
            value={disabled ? name : state.text ?? "" }
            placeholder={placeholder}
            onChange={handleChange}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            data={state.highlight ? "highlight" : undefined}
            disabled={disabled}
            error={String(state.error)}/>
    )
}

export default LinkInput;