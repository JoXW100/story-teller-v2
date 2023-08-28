import { useState } from "react";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import { useFiles } from "utils/handlers/files";
import { isObjectId } from "utils/helpers";
import { FileType } from "types/database/files";
import { ObjectId, ObjectIdText } from "types/database";
import styles from 'styles/components/listMenu.module.scss';
import { FileGetManyMetadataResult } from "types/database/responses";

type ListMenuPropsType<T, A extends boolean> = {
    className?: string
    itemClassName?: string
    onChange: (selection: T[]) => void
    validateInput?: (value: T, values: T[]) => value is T
    values: T[]
    fileTypes: FileType[]
    allowText: A
    placeholder?: string
}

type ListMenuComponent = {
    className: string
    files: FileGetManyMetadataResult
    allowedFiles: Set<FileType>
    allowText: boolean
    placeholder: string
    onChange: (selection: ObjectIdText[]) => void
}

type ListMenuProps = React.PropsWithRef<ListMenuPropsType<ObjectId, false> | ListMenuPropsType<ObjectIdText, true>>

type IDCollection = { results: string[], rest: ObjectId[] } 

const LinkListMenu = ({ className, itemClassName, onChange, validateInput, values = [], fileTypes, allowText, placeholder }: ListMenuProps): JSX.Element => {
    if (fileTypes == undefined || fileTypes.length === 0) {
        throw new Error("LinkListMenu with no accepted filetypes, expected at least one")
    }
    
    const allowedFiles = new Set(fileTypes)
    const [files, loading] = useFiles(values, (values) => (
        new Promise((resolve) => {
            let ids = values.reduce<IDCollection>((prev, value) => {
                if (isObjectId(value)) {
                    return { ...prev, rest: [...prev.rest, value] }
                } else {
                    return { ...prev, results: [...prev.results, value] }
                }
            }, { results: [], rest: []})
            resolve(ids as any)
        })
    ))
    
    return (
        <ListTemplateMenu<ObjectIdText, ListMenuComponent>
            className={className}
            onChange={onChange}
            validateInput={validateInput}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={""}
            values={loading ? [] : values}
            params={{ className: itemClassName, files: files, allowedFiles: allowedFiles, allowText: allowText, placeholder: placeholder, onChange: onChange }}/>
    )
}


const Component = ({ value, params }: ListTemplateComponent<ObjectId, ListMenuComponent>): JSX.Element => {
    const { files, allowedFiles, allowText, className } = params
    const file = files.find((file) => file.id == value)
    const valid = isObjectId(value)
        ? allowedFiles.has(file?.type)
        : allowText
    const name = valid && allowedFiles.has(file?.type)
        ? file?.metadata?.name ?? String(value)
        : String(value)
    return (
        <div className={className} error={String(valid && name)}>
            <b>{name}</b>
        </div>
    )
}

const EditComponent = ({ value, values, onUpdate, params }: ListTemplateComponent<string, ListMenuComponent>): JSX.Element => {
    const { allowedFiles, className, placeholder, onChange } = params
    const style = className ? `${className} ${styles.input}` : styles.input;
    const [highlight, setHighlight] = useState<boolean>(false)

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
            setHighlight(true);
        }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && allowedFiles.has(window.dragData.file.type)) {
            e.preventDefault();
            setHighlight(false);
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
        if (window.dragData?.file && allowedFiles.has(window.dragData.file.type)) {
            e.preventDefault();
            e.stopPropagation();
            let id = window.dragData.file.id;
            window.dragData.target = null;
            window.dragData.file = null;
            onUpdate('')
            onChange([...values, id])
        }
    }

    return (
        <input 
            className={style} 
            value={String(value)}
            type="text"
            placeholder={placeholder}
            onChange={(e) => onUpdate(e.target.value)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            data={highlight ? "highlight" : undefined}/>
    )
}


export default LinkListMenu;