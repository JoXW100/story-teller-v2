import React, { useState } from 'react';
import styles from 'styles/renderer.module.scss';

const SpellSlotToggle = (): JSX.Element => {
    const [toggle, setToggle] = useState(false)
    return (
        <div 
            className={styles.spellSlotToggle} 
            onClick={() => setToggle(!toggle)}
            data={toggle ? 'active' : undefined}
        />
    )
}

export default SpellSlotToggle;