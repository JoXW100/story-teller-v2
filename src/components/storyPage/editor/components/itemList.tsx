import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import ItemListMenu from 'components/common/controls/itemListMenu';
import { TemplateComponentProps } from '.';
import { getRelativeMetadata } from 'utils/helpers';
import { ItemListTemplateParams } from 'types/templates';
import { EditFilePage } from 'types/context/fileContext';
import { IModifier, ModifierAddRemoveTypeProperty, ModifierBonusTypeProperty, ModifierType, SelectType } from 'types/database/files/modifier';
import { Attribute } from 'types/database/dnd';
import { ISubPageItemMetadata } from 'types/database/files';
import styles from 'styles/pages/storyPage/editor.module.scss';

const Templates: Record<string, IModifier> = {
    "abilityScoreImprovement": {
        id: "$abilityScoreImprovement",
        label: "Improvement",
        type: ModifierType.Choice,
        choices: [
            {
                id: "feature",
                label: "Feature",
                modifiers: [
                    {
                        id: "feature",
                        type: ModifierType.Add,
                        addRemoveProperty: ModifierAddRemoveTypeProperty.Ability,
                        select: SelectType.Choice,
                        allowAny: true,
                        label: "Improvement Feature"
                    }
                ]
            },
            {
                id: "abilities",
                label: "Attributes",
                modifiers: [
                    {
                        id: "attribute1",
                        type: ModifierType.Bonus,
                        bonusProperty: ModifierBonusTypeProperty.Attribute,
                        select: SelectType.Choice,
                        numChoices: 2,
                        label: "Improvement Attribute",
                        attributes: Object.values(Attribute),
                        value: 1
                    }
                ]
            }
        ]
    } satisfies IModifier,
    "ability": {
        id: "$ability",
        type: ModifierType.Add,
        addRemoveProperty: ModifierAddRemoveTypeProperty.Ability
    } satisfies IModifier
}

const ItemListComponent = ({ params }: TemplateComponentProps<ItemListTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const values: ISubPageItemMetadata[] = (metadata && metadata[params.key]) ?? []
        
    const handleChange = (values: ISubPageItemMetadata[]) => {
        dispatch.setMetadata(params.key, values)
    }

    const handleValidate = (value: string, values: ISubPageItemMetadata[]): boolean => {
        return value?.length > 0 
           && !value.startsWith('$') 
           && !values.some(x => x.id.toLocaleLowerCase().localeCompare(value.toLowerCase()) == 0);
    }

    const handleCLick = (item: ISubPageItemMetadata, index: number) => {
        dispatch.openTemplatePage({
            template: params.template,
            rootKey: params.key,
            name: item.id,
            index: index
        } satisfies EditFilePage);
    }

    return (
        <div className={styles.editList} data={params.fill && "fill"}>
            <b>{`${ params.label ?? "label"}:`}</b>
            <ItemListMenu
                itemClassName={styles.itemListItem}
                values={Array.isArray(values) ? values : []}
                defaultValue={{ id: params.default }}
                prompt={params.prompt ?? "Edit"}
                onChange={handleChange}
                onClick={handleCLick}
                validateInput={handleValidate}
                templates={params.useTemplates ? Templates: {}}
                placeholder={params.placeholder}/>
        </div>
    )
}

export default ItemListComponent;