import { useContext } from 'react';
import Loading from 'components/common/loading';
import { Context } from 'components/contexts/fileContext';
import useRenderer from 'components/renderer';
import { FileRendererTemplate } from 'types/templates';
import styles from 'styles/renderer.module.scss';

type RendererProps = React.PropsWithRef<{
    template: FileRendererTemplate
}>

const Renderer = ({ template }: RendererProps): JSX.Element => {
    const [context] = useContext(Context);
    const render = useRenderer(template, context?.file)

    return (
        <div className={styles.main}>
            <div className={styles.innerPage}>
                { context.fetching
                    ? <Loading className={styles.loading}/>
                    : <div className={styles.contentHolder}>
                        { render }
                    </div> 
                }
            </div>
        </div>
    )
}

export default Renderer;