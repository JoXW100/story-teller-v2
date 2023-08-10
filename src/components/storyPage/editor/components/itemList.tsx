import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import ItemListMenu, { ItemListItem } from 'components/common/controls/itemListMenu';
import { TemplateComponentProps } from '.';
import { getRelativeMetadata } from 'utils/helpers';
import { ItemListTemplateParams } from 'types/templates';
import { EditFilePage } from 'types/context/fileContext';
import styles from 'styles/pages/storyPage/editor.module.scss';

const ItemListComponent = ({ params }: TemplateComponentProps<ItemListTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const values: ItemListItem[] = (metadata && metadata[params.key]) ?? []
        
    const handleChange = (values: ItemListItem[]) => {
        dispatch.setMetadata(params.key, values)
    }

    const handleValidate = (value: string, values: ItemListItem[]): boolean => {
        return value?.length > 0 && !values.some(x => x.$name.toLocaleLowerCase().localeCompare(value.toLowerCase()) == 0);
    }

    const handleCLick = (item: ItemListItem, index: number) => {
        dispatch.openTemplatePage({
            template: params.template,
            rootKey: params.key,
            name: item.$name,
            index: index
        } satisfies EditFilePage);
    }

    return (
        <div className={styles.editList}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <ItemListMenu
                itemClassName={styles.editListItem}
                values={Array.isArray(values) ? values : []}
                defaultValue={params.default}
                prompt={params.prompt ?? "Edit"}
                onChange={handleChange}
                onClick={handleCLick}
                validateInput={handleValidate}
                placeholder={params.placeholder}/>
        </div>
    )
}

export default ItemListComponent;