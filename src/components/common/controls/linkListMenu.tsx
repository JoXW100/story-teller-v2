import { useState } from "react";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import { useFiles } from "utils/handlers/files";
import { isObjectId } from "utils/helpers";
import { FileType } from "types/database/files";
import { ObjectId } from "types/database";
import styles from 'styles/components/listMenu.module.scss';

type ListMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    onChange: (selection: ObjectId[]) => void
    validateInput?: (value: ObjectId, values: ObjectId[]) => boolean
    values: ObjectId[]
    fileTypes: FileType[]
    allowText: boolean
    placeholder?: string
}>

type IdCollection = { results: ObjectId[], rest: ObjectId[] } 

const LinkListMenu = ({ className, itemClassName, onChange, validateInput, values = [], fileTypes, allowText, placeholder }: ListMenuProps): JSX.Element => {
    if (fileTypes == undefined || fileTypes.length === 0) {
        throw new Error("LinkListMenu with no accepted filetypes, expected at least one")
    }
    
    const allowedFiles = new Set(fileTypes)
    const [files, loading] = useFiles(values, (values) => (
        new Promise((resolve) => {
            let ids = values.reduce<IdCollection>((prev, value) => (
                isObjectId(value)
                ? { ...prev, rest: [...prev.rest, value] }
                : { ...prev, results: [...prev.results, value] }
            ), { results: [] as ObjectId[], rest: [] as ObjectId[]})
            resolve(ids as any)
        })
    ))

    const Component = ({ value }: ListTemplateComponent<ObjectId>): JSX.Element => {
        const file = files.find((file) => file.id == value)
        const valid = isObjectId(value)
            ? allowedFiles.has(file?.type)
            : allowText
        const name = valid && allowedFiles.has(file?.type)
            ? file?.metadata?.name ?? file?.metadata?.title ?? String(value)
            : String(value)
        return (
            <div className={itemClassName} error={String(valid && name)}>
                { name }
            </div>
        )
    }

    const EditComponent = ({ value, onUpdate }: ListTemplateComponent<ObjectId>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.input}` : styles.input;
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
                onUpdate(id)
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
    
    return (
        <ListTemplateMenu<ObjectId>
            className={className}
            onChange={onChange}
            validateInput={validateInput}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={""}
            values={loading ? [] : values}/>
    )
}

export default LinkListMenu;