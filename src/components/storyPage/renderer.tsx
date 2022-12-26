import { useContext } from 'react';
import { Context } from 'components/contexts/fileContext';
import useRenderer from 'components/renderer';
import styles from 'styles/renderer.module.scss';
import { FileRendererTemplate } from 'types/templates';

type RendererProps = React.PropsWithRef<{
    template: FileRendererTemplate
}>

const Renderer = ({ template }: RendererProps): JSX.Element => {
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