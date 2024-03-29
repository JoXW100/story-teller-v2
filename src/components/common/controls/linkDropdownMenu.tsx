import DropdownMenu from "./dropdownMenu"
import { useFiles } from "utils/handlers/files"
import { isObjectId } from "utils/helpers"
import Logger from "utils/logger"
import { ObjectId } from "types/database"
import { FileType } from "types/database/files"

type LinkDropdownMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string,
    values: ObjectId[]
    value: ObjectId, 
    showButton?: boolean,
    allowNull?: boolean,
    allowedTypes?: FileType[]
    onChange: (value: ObjectId) => void
}>

const LinkDropdownMenu = ({ value, values, onChange, allowNull, showButton, allowedTypes, className, itemClassName }: LinkDropdownMenuProps) => {
    const [files, loading] = useFiles(values, allowedTypes)

    return (
        <DropdownMenu
            className={className}
            itemClassName={itemClassName}
            value={String(value)}
            showButton={showButton}
            values={values.reduce((prev, option) => (
                { ...prev, [String(option)]: loading ? '...' : files.find(x => x?.id === option)?.metadata?.name ?? "error"}
            ), allowNull ? { null: "Unset" } : {})}
            onChange={(value) => {
                if (isObjectId(value) || (allowNull && value === "null")) {
                    onChange(value == "null" ? null: value)
                } else {
                    Logger.throw("LinkDropdownMenu", value)
                }
            }}/>
    )
}

export default LinkDropdownMenu