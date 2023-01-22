import { useMemo, useState } from "react";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import { useFiles } from "utils/handlers/files";
import { FileStructure, FileType } from "types/database/files";
import { ObjectId } from "types/database";
import styles from 'styles/components/listMenu.module.scss';
import { resolve } from "styled-jsx/css";

type ListMenuProps = React.PropsWithRef<{
    className: string
    onChange: (selection: ObjectId[]) => void
    values: ObjectId[]
    fileTypes: FileType[]
    allowText: boolean
    placeholder?: string
}>

const LinkListMenu = ({ className, onChange, values = [], fileTypes, allowText, placeholder }: ListMenuProps): JSX.Element => {
    if (fileTypes == undefined || fileTypes.length === 0) {
        throw new Error("LinkListMenu with no accepted filetypes, expected at least one")
    }
    
    const allowedFiles = new Set(fileTypes)
    const [files, loading] = useFiles(values, (values) => (
        new Promise((resolve) => {
            let ids = values.reduce((prev, value) => (
                /[a-z0-9]{24}/.test(String(value)) 
                ? { ...prev, rest: [...prev.rest, value] }
                : { ...prev, results: [...prev.results, value] }
            ), { results: [] as ObjectId[], rest: [] as ObjectId[]})
            resolve(ids as any)
        })
    ))

    const Component = ({ value }: ListTemplateComponent<ObjectId>): JSX.Element => {
        const file = files.find((file) => file.id == value)
        const valid = /[a-z0-9]{24}/.test(String(value))
            ? allowedFiles.has(file?.type)
            : allowText
        const name = useMemo<string>(() => {
            return valid && allowedFiles.has(file?.type)
                ? file.metadata.name ?? file.metadata.title ?? String(value)
                : String(value)
        }, [])

        return (
            <div className={styles.rowContent} data={valid ? undefined : "error"}>
                { name }
            </div>
        )
    }

    const EditComponent = ({ value, onUpdate }: ListTemplateComponent<ObjectId>): JSX.Element => {
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

        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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
                className={styles.input} 
                value={String(value)}
                type="text"
                placeholder={placeholder}
                onChange={(e) => onUpdate(e.target.value)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                data={highlight ? "highlight" : undefined}
            />
        )
    }
    
    return (
        <ListTemplateMenu<ObjectId>
            className={className}
            onChange={onChange}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={""}
            values={loading ? [] : values}
        />
    )
}

export default LinkListMenu;