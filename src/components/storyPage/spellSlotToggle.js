import React, { useState } from 'react';
import styles from 'styles/renderer.module.scss';

const SpellSlotToggle = () => {
    const [toggle, setToggle] = useState(false)
    return (
        <div 
            className={styles.spellSlotToggle} 
            onClick={() => setToggle(!toggle)}
            active={String(toggle)}
        />
    )
}

export default SpellSlotToggle;