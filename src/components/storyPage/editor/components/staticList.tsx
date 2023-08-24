import React, { useCallback, useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import StaticListMenu, { StaticListMenuItemData } from 'components/common/controls/staticListMenu';
import { TemplateComponentProps } from '.';
import { getRelativeMetadata } from 'utils/helpers';
import { StaticListTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';


const StaticListComponent = ({ params }: TemplateComponentProps<StaticListTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const values: (number | number[])[] = (metadata && metadata[params.key]) ?? []
    const valueData = params.labels?.reduce<StaticListMenuItemData[]>((prev, label, index) => (
        [...prev, { 
            label: label, 
            value: params.type === "number" 
                ? String(values[index] ?? params.default)
                : ((values[index] ?? params.default) as number[]).join(',') 
        }]
    ), []) ?? [] 

    const handleValidate = useCallback((value: string): boolean => {
        if (params.type === "number") {
            let num = parseInt(value)
            return !isNaN(num) && num >= 0
        } else {
            let parts = value.split(',')
            return value.length === 0 || parts.every((part) => {
                let num = parseInt(part)
                return !isNaN(num) && num >= 0
            })
        }
    }, [params.type])
        
    const handleChange = (values: StaticListMenuItemData[]) => {
        let index = 0
        let res: (number | number[])[]
        if (params.type === "number") {
            res = values.map((value, i) => {
                let num = parseInt(value.value)
                if (num > 0) {
                    index = i
                }
                return num
            })
        } else {
            res = values.map((value, i) => {
                if (value.value.length > 0) {
                    index = i
                    let parts = value.value.split(',')
                    return parts.map(part => parseInt(part))
                }
                return []
            })
        }
        dispatch.setMetadata(params.key, res.slice(0, index + 1))
    }

    return (
        <div className={styles.editList} data="fill">
            <b> {`${ params.label ?? "label"}:`} </b>
            <StaticListMenu
                itemClassName={styles.editListItem}
                values={valueData}
                type={params.type === "number" ? "number" : "text"}
                onChange={handleChange}
                validate={handleValidate}/>
        </div>
    )
}

export default StaticListComponent;