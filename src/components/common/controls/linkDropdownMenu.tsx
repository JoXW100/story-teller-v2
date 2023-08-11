import { useFiles } from "utils/handlers/files"
import DropdownMenu from "./dropdownMenu"
import { ObjectId } from "types/database"
import { FileGetMetadataResult, FileMetadata } from "types/database/files"

type LinkDropdownMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string,
    values: ObjectId[]
    value: ObjectId, 
    showButton?: boolean,
    onChange: (value: ObjectId) => void
}>

const LinkDropdownMenu = ({ value, values, onChange, showButton, className, itemClassName }: LinkDropdownMenuProps) => {
    const [files, loading] = useFiles(values)

    return (
        <DropdownMenu
            className={className}
            itemClassName={itemClassName}
            value={String(value)}
            values={values.reduce((prev, option) => (
                { ...prev, [String(option)]: loading ? '...' : files.find(x => x.id === option) ?.metadata?.name ?? "error"}
            ), { null: "Unset" })}
            onChange={onChange}
            showButton={showButton}/>
    )
}

export default LinkDropdownMenu