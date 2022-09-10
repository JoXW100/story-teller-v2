import { useEffect, useRef, useState } from 'react'
import styles from 'styles/components/divider.module.scss'

/**
 * @param {{ 
 *  className: string, 
 *  left: JSX.Element, 
 *  right: JSX.Element,
 *  defaultSlider: number, 
 *  minLeft: number,
 *  minRight: number 
 * }}  
 * @returns {JSX.Element}
 */
const Divider = ({ className, left, right, defaultSlider=0.5, minLeft=0, minRight=0 }) => {
    const [slider, setSlider] = useState(defaultSlider);
    const ref = useRef()
    
    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const dragStart = (e) => {
        e.preventDefault()
        document.addEventListener('mouseup', mouseStop)
        document.addEventListener('mousemove', mouseDrag)
    }

    /** @param {React.TouchEvent<HTMLDivElement>} e */
    const touchStart = (e) => {
        document.addEventListener('touchend', touchStop)
        document.addEventListener('touchmove', touchDrag)
    }

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const mouseStop = (e) => {
        document.removeEventListener('mouseup', mouseStop)
        document.removeEventListener('mousemove', mouseDrag)
    }

    /** @param {React.TouchEvent<HTMLDivElement>} e */
    const touchStop = (e) => {
        document.removeEventListener('touchend', touchStop)
        document.removeEventListener('touchmove', touchDrag)
    }

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const mouseDrag = (e) => {
        let rect = ref.current?.parentElement.getBoundingClientRect();
        e.pageX && setSlider((e.clientX - rect.left) / rect.width);
    }

    /** @param {React.TouchEvent<HTMLDivElement>} e */
    const touchDrag = (e) => {
        let touch = e.touches[0] ?? null;
        let rect = ref.current?.parentElement.getBoundingClientRect();
        touch && setSlider((touch.pageX - rect.left) / rect.width);
    }
 
    const clamp = `clamp(${minLeft + 10}px, ${slider * 100}%, 100% - ${minRight + 10}px)`;

    return (
        <div className={className 
            ? styles.main + ' ' + className 
            : styles.main
        }>
            <div
                ref={ref}
                className={styles.divider}
                style={{ left: clamp }}
                onMouseDown={dragStart}
                onTouchStart={touchStart}
            />
            <div style={{ left: 0, width: clamp }}> { left }</div>
            <div style={{ left: clamp, right: 0 }}> { right }</div>
        </div>
    )
}

export default Divider