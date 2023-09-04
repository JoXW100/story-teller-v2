import Elements from 'data/elements';
import CreatureData from 'data/structures/creature';
import { Attribute} from 'types/database/dnd';
import styles from 'styles/renderer.module.scss';
import { AdvantageIcon, DisadvantageIcon } from 'assets/icons';
import { AttributeAdvantageBindingMap } from 'utils/calculations';

type DataProps = React.PropsWithRef<{
    data: CreatureData 
}>

const AttributesBox = ({ data }: DataProps): JSX.Element => {
    const advantages = data.advantages
    const disadvantages = data.disadvantages
    console.log("AttributesBox", advantages, disadvantages, AttributeAdvantageBindingMap[Attribute.DEX])
    return (
        <Elements.Align>
            { Object.values(Attribute).map((attr, index) => (
                <div className={styles.attributeBox} key={index}>
                    <Elements.Bold>{attr.toUpperCase()}</Elements.Bold>
                    <Elements.Bold>{data[attr] ?? 0}</Elements.Bold>
                    <Elements.Roll options={{ 
                        mod: data.getAttributeModifier(attr).toString(), 
                        desc: `${attr.toUpperCase()} Check`,
                        tooltips: `${attr.toUpperCase()} Check`
                    }}/>
                    <div/>
                    <Elements.Roll options={{ 
                        mod: data.getSaveModifier(attr).toString(), 
                        desc: `${attr.toUpperCase()} Save`,
                        tooltips: `${attr.toUpperCase()} Save`
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