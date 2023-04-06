import { useState, useContext } from 'react';
import ZoomInIcon from '@mui/icons-material/ZoomInSharp';
import ZoomOutIcon from '@mui/icons-material/ZoomOutSharp';
import Loading from 'components/common/loading';
import { Context } from 'components/contexts/fileContext';
import useRenderer from 'components/renderer';
import { FileRendererTemplate } from 'types/templates';
import styles from 'styles/renderer.module.scss';
import Localization from 'utils/localization';

type RendererProps = React.PropsWithRef<{
    template: FileRendererTemplate
}>

const Renderer = ({ template }: RendererProps): JSX.Element => {
    const delta = 10;
    const [context] = useContext(Context);
    const [zoom, setZoom] = useState(100);
    const render = useRenderer(template, context?.file)

    const changeZoom = (delta) => {
        setZoom((val) => Math.min(Math.max(val + delta, 0), 500))
    }

    return (
        <div className={styles.main}>
            <div className={styles.menu}>
                <span>{`${zoom}%`}</span>
                <button 
                    className={styles.zoomInButton}
                    onClick={() => changeZoom(delta)}
                    tooltips={Localization.toText('renderer-zoomIn')}>
                    <ZoomInIcon/>
                </button>
                <button 
                    className={styles.zoomOutButton}
                    onClick={() => changeZoom(-delta)} 
                    tooltips={Localization.toText('renderer-zoomOut')}>
                    <ZoomOutIcon/>
                </button>
            </div>
            <div className={styles.innerPage} style={{ zoom: `${zoom}%` }}>
                { context.fetching
                    ? <Loading className={styles.loading}/>
                    : <div className={styles.contentHolder}>{ render }</div> 
                }
            </div>
        </div>
    )
}

export default Renderer;