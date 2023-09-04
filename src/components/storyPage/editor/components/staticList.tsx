import { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import StaticListMenu, { StaticListMenuItemData } from 'components/common/controls/staticListMenu';
import { TemplateComponentProps } from '.';
import { getOptionType } from 'data/optionData';
import { getRelativeMetadata, isEnum } from 'utils/helpers';
import Logger from 'utils/logger';
import { StaticListTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';


const StaticListComponent = ({ params }: TemplateComponentProps<StaticListTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const values: (number | number[])[] = metadata?.[params.key] ?? []
    const type = getOptionType(params.enum);

    if (params.type === "enum" && !type){
        Logger.throw("enumComponent", new Error("No option type of type: " + params.type))
        return null;
    }

    const valueData = params.labels?.reduce<StaticListMenuItemData[]>((prev, label, index) => (
        [...prev, { 
            label: label, 
            value: params.type === "list" 
                ? ((values[index] ?? params.default) as number[]).join(',')
                : String(values[index] ?? params.default)
        }]
    ), []) ?? [] 

    const handleValidate = (value: string): boolean => {
        switch (params.type) {
            case 'number':
                let num = parseInt(value)
                return !isNaN(num) && num >= 0
            case 'list':
                let parts = value.split(',')
                return value.length === 0 || parts.every((part) => {
                    let num = parseInt(part)
                    return !isNaN(num) && num >= 0
                })
            case 'enum':
            default:
                return true

        }
    }
        
    const handleChange = (values: StaticListMenuItemData[]) => {
        let index = 0
        let res: (number | string | number[])[]
        switch (params.type) {
            case 'number':
                res = values.map((value, i) => {
                    let num = parseInt(value.value)
                    if (num > 0) {
                        index = i
                    }
                    return num
                })
                break
            case 'list':
                res = values.map((value, i) => {
                    if (value.value?.length > 0) {
                        index = i
                        let parts = value.value.split(',')
                        return parts.map(part => parseInt(part))
                    }
                    return []
                })
                break
            case 'enum':
                res = values.map((value, i) => {
                    if (value.value && value.value !== type.default) {
                        index = i
                    }
                    return value.value
                })
                break
            default:
                break

        }
        dispatch.setMetadata(params.key, res.slice(0, index + 1))
    }

    return (
        <div className={styles.editList} data="fill">
            <b>{`${params.label ?? "label"}:`}</b>
            <StaticListMenu
                itemClassName={styles.editSelectionItem}
                values={valueData}
                options={type?.options}
                type={params.type === "list" ? "text" : params.type}
                onChange={handleChange}
                validate={handleValidate}/>
        </div>
    )
}

export default StaticListComponent;