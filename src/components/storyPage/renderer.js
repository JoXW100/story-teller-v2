import { useContext } from 'react';
import { Context } from 'components/contexts/fileContext';
import useRenderer from 'components/renderer';
import styles from 'styles/renderer.module.scss';
/**
 * @param {{ template: RendererTemplate<any> }} 
 * @returns {JSX.Element}
 */
const Renderer = ({ template }) => {
    const [context] = useContext(Context);
    const render = useRenderer(template, context?.file)
    return (
        <div className={styles.main}>
            <div className={styles.innerPage}>
                { render }
            </div>
        </div>
    )
}

export default Renderer;