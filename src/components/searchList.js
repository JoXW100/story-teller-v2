import React, { useState } from 'react';
import styles from 'styles/components/searchList.module.scss';

/**
 * @typedef SearchItem
 * @property {[String]} keyWords
 * @property {number} value
 * @property {JSX.Element} content
 */

/**
 * 
 * @param {{ className: string, items: [SearchItem], prompt: string }} 
 * @returns {JSX.Element}
 */
const SearchList = ({ className, items, prompt }) => {
    const [search, setSearch] = useState("")

    /** @param {React.ChangeEvent<HTMLInputElement>} e */
    const handleChange = (e) => {
        setSearch(e.target.value)
    }

    return (
        <div className={className ? `${styles.main} ${className}` : styles.main}>
            <div className={styles.search}>
                <div className={styles.text}> { prompt } </div>
                <input value={search} onChange={handleChange}/>
            </div>
            <div className={styles.content}>
                { items?.filter((item) => item.keyWords.some((keyword) => keyword.includes(search.toLowerCase())))
                    .map((item) => item.content)
                }
            </div>
        </div>
    )
}

export default SearchList;