import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import { useFiles } from "utils/handlers/files";
import { isObjectId } from "utils/helpers";
import { FileType } from "types/database/files";
import { ObjectId, ObjectIdText } from "types/database";
import { FileGetManyMetadataResult, FileGetMetadataResult } from "types/database/responses";
import LinkInput from "./linkInput";

type ListMenuPropsType<T, A extends boolean> = {
    className?: string
    editClassName?: string
    itemClassName?: string
    onChange: (selection: T[]) => void
    validateInput?: (value: T, values: T[]) => value is T
    values: T[]
    allowedTypes: FileType[]
    allowText: A
    placeholder?: string
}

type ListMenuComponent = {
    itemClassName?: string
    editClassName?: string
    files: FileGetManyMetadataResult
    allowedTypes?: FileType[]
    allowText?: boolean
    placeholder?: string
    onChange: (selection: ObjectIdText[]) => void
}

type ListMenuProps = React.PropsWithRef<ListMenuPropsType<ObjectId, false> | ListMenuPropsType<ObjectIdText, true>>

const LinkListMenu = (props: ListMenuProps): JSX.Element => {
    const { className, onChange, validateInput, values = [], allowedTypes } = props
    if (allowedTypes == undefined || allowedTypes.length === 0) {
        throw new Error("LinkListMenu with no accepted filetypes, expected at least one")
    }
    
    const [files, loading] = useFiles(values, allowedTypes)
    
    return (
        <ListTemplateMenu<ObjectIdText, ListMenuComponent>
            className={className}
            onChange={onChange}
            validateInput={validateInput}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={""}
            values={loading ? [] : values}
            params={{ files: files, ...props }}/>
    )
}


const Component = ({ value, params }: ListTemplateComponent<ObjectId, ListMenuComponent>): JSX.Element => {
    const { files, allowedTypes, allowText, itemClassName } = params
    const file = files.find((file) => file?.id == value)
    const valid = isObjectId(value)
        ? allowedTypes.includes(file?.type)
        : allowText
    const name = valid && allowedTypes.includes(file?.type)
        ? file?.metadata?.name ?? String(value)
        : String(value)
    return (
        <div className={itemClassName} error={String(valid && name)}>
            <b>{name}</b>
        </div>
    )
}

const EditComponent = ({ value, values, onUpdate, params }: ListTemplateComponent<ObjectId, ListMenuComponent>): JSX.Element => {
    const { allowedTypes, editClassName, placeholder, allowText, onChange } = params

    const handleChange = (value: FileGetMetadataResult) => {
        if (typeof value === "string") {
            onUpdate(value)
        } else {
            onChange([...values, value.id])
            onUpdate(value.id)
        }
    }

    return (
        <LinkInput
            className={editClassName} 
            placeholder={placeholder}
            allowedTypes={allowedTypes}
            allowText={allowText}
            value={value}
            onChange={handleChange}/>
    )
}


export default LinkListMenu;