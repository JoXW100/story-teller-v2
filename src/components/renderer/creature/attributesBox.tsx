import { AdvantageIcon, DisadvantageIcon } from 'assets/icons';
import Elements from 'data/elements';
import CreatureData from 'data/structures/creature';
import { getOptionType } from 'data/optionData';
import { AttributeAdvantageBindingMap } from 'utils/calculations';
import { Attribute} from 'types/database/dnd';
import styles from 'styles/renderer.module.scss';

type DataProps = React.PropsWithRef<{
    data: CreatureData 
}>

const AttributesBox = ({ data }: DataProps): JSX.Element => {
    const advantages = data.advantages
    const disadvantages = data.disadvantages
    const options = getOptionType('attr')
    return (
        <Elements.Align>
            { Object.values(Attribute).map((attr, index) => (
                <div className={styles.attributeBox} key={index}>
                    <Elements.Bold>{options.options[attr]}</Elements.Bold>
                    <Elements.Bold>{data[attr] ?? 0}</Elements.Bold>
                    <Elements.Roll options={{ 
                        mod: data.getAttributeModifier(attr).toString(), 
                        desc: `${options.options[attr]} Check`,
                        tooltips: `${options.options[attr]} Check`
                    }}/>
                    <div/>
                    <Elements.Roll options={{ 
                        mod: data.getSaveModifier(attr).toString(), 
                        desc: `${options.options[attr]} Save`,
                        tooltips: `${options.options[attr]} Save`
                    }}/>
                    <span className={styles.iconHolder}>
                        <span 
                            data={String(AttributeAdvantageBindingMap[attr] in advantages)} 
                            tooltips={advantages[AttributeAdvantageBindingMap[attr]]}>
                            <AdvantageIcon/>
                        </span>
                        <span 
                            data={String(AttributeAdvantageBindingMap[attr] in disadvantages)} 
                            tooltips={disadvantages[AttributeAdvantageBindingMap[attr]]}>
                            <DisadvantageIcon/>
                        </span>
                    </span>
                </div>
            ))}
        </Elements.Align>
    )
}
export default AttributesBox;