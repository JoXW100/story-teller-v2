import { useState } from "react"
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/EditSharp';
import CollapseIcon from '@mui/icons-material/CloseFullscreenSharp';
import ExpandIcon from '@mui/icons-material/OpenInFullSharp';
import Localization from "utils/localization"
import { openContext } from "./contextMenu";
import { ContextRowData } from "types/contextMenu";
import styles from 'styles/components/collapsibleGroup.module.scss';
import { DragData } from "index";

type CollapsibleGroupProps = React.PropsWithChildren<{
    header: React.ReactNode | string
    open?: boolean
    onChange?: (value: string) => void
    onRemove?: () => void
    onDrag?: (data: DragData) => boolean
    onDrop?: (data: DragData) => void
}>

const CollapsibleGroup = ({ header, open = true, onChange, onRemove, onDrag, onDrop, children }: CollapsibleGroupProps): JSX.Element => {
    const [state, setState] = useState({
        isOpen: open,
        isEdit: false,
        highlight: false,
        header: header as string
    })
    const tooltips = state.isOpen 
        ? Localization.toText('common-collapse')
        : Localization.toText('common-expand')

    const handleContextMenu: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        e.stopPropagation()

        const collapseExpandRow: ContextRowData = {
            text: tooltips, 
            icon: state.isOpen ? CollapseIcon : ExpandIcon, 
            action: () => setState((state) => ({...state, isOpen: !state.isOpen}))
        }
        const editRow: ContextRowData = {
            text: Localization.toText('common-rename'), 
            icon: EditIcon, 
            action: () => setState((state) => ({...state, isEdit: !state.isEdit}))
        }
        const removeRow: ContextRowData = {
            text: Localization.toText('common-delete'), 
            icon: RemoveIcon, 
            action: onRemove
        }

        openContext(onRemove !== undefined
            ? [collapseExpandRow, editRow, removeRow]
            : [collapseExpandRow, editRow]
        , { x: e.pageX, y: e.pageY }, true)
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setState((state) => ({...state, header: e.target.value }))
    }

    const handleLoseFocus = () => {
        if (state.header !== header) {
            onChange(state.header)
        }
        setState((state) => ({...state, isEdit: false }))
    }

    const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
        if (onDrag && onDrag(window.dragData)) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    const handleDragEnter = (e: React.DragEvent<HTMLInputElement>) => {
        if (onDrag && onDrag(window.dragData)) {
            e.preventDefault();
            e.stopPropagation();
            setState({ ...state, highlight: true });
        }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLInputElement>) => {
        if (onDrag && onDrag(window.dragData)) {
            e.preventDefault();
            setState({ ...state, highlight: false });
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
        if (onDrag && onDrop && onDrag(window.dragData)) {
            e.preventDefault();
            e.stopPropagation();
            onDrop(window.dragData)
        }
    } 

    return <>
        <div 
            className={styles.collapsibleGroup} 
            data={open ? "open" : "closed"}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
            <button 
                onClick={() => setState((state) => ({...state, isOpen: !state.isOpen}))}
                onContextMenu={handleContextMenu}
                tooltips={tooltips}>
                {state.isEdit && onChange !== undefined 
                    ? <input 
                        className={styles.headerInput} 
                        value={state.header} 
                        onChange={handleChange} 
                        onBlur={handleLoseFocus} 
                        autoFocus/>
                    : header
                }
            </button>
        </div>
        { open && children }
    </>
}

export default CollapsibleGroup