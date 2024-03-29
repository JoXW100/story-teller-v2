import { useState, useContext } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomInSharp';
import ZoomOutIcon from '@mui/icons-material/ZoomOutSharp';
import Loading from 'components/common/loading';
import { Context } from 'components/contexts/fileContext';
import { useRenderer } from 'components/renderer';
import Localization from 'utils/localization';
import { FileRendererTemplate } from 'types/templates';
import styles from 'styles/renderer.module.scss';

type RendererProps = React.PropsWithRef<{
    template: FileRendererTemplate
}>

const zoomDelta: number = 10;

const Renderer = ({ template }: RendererProps): JSX.Element => {
    const [context, dispatch] = useContext(Context);
    const [zoom, setZoom] = useState(100);
    const render = useRenderer(template, context?.file)

    const changeZoom = (delta: number) => {
        setZoom((val) => Math.min(Math.max(val + delta, 10), 500))
    }

    return (
        <div className={styles.main}>
            <div className={styles.menu}>
                <div>
                    <span>{`${zoom}%`}</span>
                    <button 
                        className={styles.zoomButton}
                        onClick={() => changeZoom(zoomDelta)}
                        tooltips={Localization.toText('renderer-zoomIn')}>
                        <ZoomInIcon/>
                    </button>
                    <button 
                        className={styles.zoomButton}
                        onClick={() => changeZoom(-zoomDelta)} 
                        tooltips={Localization.toText('renderer-zoomOut')}>
                        <ZoomOutIcon/>
                    </button>
                </div>
            </div>
            <div className={styles.sidePanel}>
                <div data={String(context.rendererSidePanel !== null)}>
                    <div className={styles.sidePanelHeader}>
                        <b>{ context.rendererSidePanel?.header }</b>
                        <button tooltips='Close' onClick={dispatch.closeSidePanel}>
                            <CloseIcon/>
                        </button>
                    </div>
                    { context.rendererSidePanel?.content }
                </div>
            </div>
            <div className={styles.innerPage} style={{ zoom: `${zoom}%` }}>
                { context.fetching
                    ? <Loading className={styles.loading}/>
                    : (
                        <div className={styles.contentHolder}>
                            {render}
                        </div> 
                    )
                }
            </div>
        </div>
    )
}

export default Renderer;