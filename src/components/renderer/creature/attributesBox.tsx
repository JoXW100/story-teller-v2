import Elements from 'data/elements';
import CreatureData from 'data/structures/creature';
import { Attribute} from 'types/database/dnd';
import styles from 'styles/renderer.module.scss';

type DataProps = React.PropsWithRef<{
    data: CreatureData 
}>

const AttributesBox = ({ data }: DataProps): JSX.Element => (
    <Elements.Align>
        { Object.keys(Attribute).map((attr, index) => (
            <div className={styles.attributeBox} key={index}>
                <Elements.Bold>{attr}</Elements.Bold>
                <Elements.Bold>{data[Attribute[attr]] ?? 0}</Elements.Bold>
                <Elements.Roll options={{ 
                    mod: data.getAttributeModifier(Attribute[attr]).toString(), 
                    desc: `${attr} Check`,
                    tooltips: `${attr} Check`
                }}/>
                <div/>
                <Elements.Roll options={{ 
                    mod: data.getSaveModifier(Attribute[attr]).toString(), 
                    desc: `${attr} Save`,
                    tooltips: `${attr} Save`
                }}/>
            </div>
        ))}
    </Elements.Align>
)

export default AttributesBox;