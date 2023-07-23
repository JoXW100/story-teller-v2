import React, { MutableRefObject, useEffect, useRef } from 'react'
import styles from 'styles/components/divider.module.scss'

type DividerProps = React.PropsWithRef<{
    className?: string
    left: JSX.Element
    right: JSX.Element
    collapsed?: boolean
    defaultSlider?: number
    minLeft?: number
    minRight?: number
    collapsedLeft?: JSX.Element
}>

const Divider = ({ className, left, right, collapsed = false, defaultSlider = 0.5, minLeft = 0, minRight = 0, collapsedLeft = null }: DividerProps): JSX.Element => {
    const ref: MutableRefObject<HTMLDivElement> = useRef()
    const leftRef: MutableRefObject<HTMLDivElement> = useRef()
    const rightRef: MutableRefObject<HTMLDivElement> = useRef()
    
    const dragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        document.addEventListener('mouseup', mouseStop)
        document.addEventListener('mousemove', mouseDrag)
    }

    const touchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        document.addEventListener('touchend', touchStop)
        document.addEventListener('touchmove', touchDrag)
    }

    const mouseStop = (e: MouseEvent) => {
        document.removeEventListener('mouseup', mouseStop)
        document.removeEventListener('mousemove', mouseDrag)
    }

    const touchStop = (e: TouchEvent) => {
        document.removeEventListener('touchend', touchStop)
        document.removeEventListener('touchmove', touchDrag)
    }

    const mouseDrag = (e: MouseEvent) => {
        let rect = ref.current?.parentElement.getBoundingClientRect();
        e.pageX && setSlider((e.clientX - rect.left) / rect.width);
    }

    const touchDrag = (e: TouchEvent) => {
        let touch = e.touches[0] ?? null;
        let rect = ref.current?.parentElement.getBoundingClientRect();
        setSlider((touch.pageX - rect.left) / rect.width)
    }

    const setSlider = (value: number) => {
        let clamp = `clamp(${minLeft + 10}px, ${value * 100}%, 100% - ${minRight + 10}px)`
        if (ref.current && leftRef.current && rightRef.current) {
            ref.current.style.left = clamp
            leftRef.current.style.width = clamp
            rightRef.current.style.left = clamp
        }
    }
    
    useEffect(() => {
        if (!collapsed) {
            setSlider(defaultSlider)
            ref.current.style.display = "initial";
        } else {
            ref.current.style.display = "none";
            leftRef.current.style.width = "auto"
            rightRef.current.style.left = leftRef.current.offsetWidth + "px";
        }
    }, [collapsed])
    
    const name = className ? styles.main + ' ' + className : styles.main

    return (
        <div className={name} data={collapsed ? "collapsed" : "expanded"}>
            <div
                ref={ref}
                className={styles.divider}
                onMouseDown={dragStart}
                onTouchStart={touchStart}/>
            <div ref={leftRef} style={{ left: 0 }}>{ collapsed ? collapsedLeft : left }</div>
            <div ref={rightRef} style={{ right: 0 }}>{ right}</div>
        </div>
    )
}

export default Divider