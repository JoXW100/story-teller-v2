import { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import NumberInput from 'components/common/controls/numericInput';
import { TemplateComponentProps } from '.';
import { getRelativeMetadata } from 'utils/helpers';
import { NumberTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'

const NumberComponent = ({ params }: TemplateComponentProps<NumberTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const value: number = metadata?.[params.key] ?? params.default ?? 0

    const handleChange = (value: number) => {
        dispatch.setMetadata(params.key, isNaN(value) ? params.default ?? 0 : Math.abs(value))
    }

    return (
        <div className={styles.editGroupItem}>
            <b>{`${ params.label ?? "label"}:`}</b>
            <NumberInput
                className={styles.editInput}
                value={value}
                decimal={params.allowFloat}
                setValue={handleChange}/>
        </div>
    )
}
export default NumberComponent;