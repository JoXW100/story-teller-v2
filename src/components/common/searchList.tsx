import React, { useState } from 'react';
import styles from 'styles/components/searchList.module.scss';

interface SearchItem {
    keyWords: string[]
    value: number
    content: JSX.Element
}

type SearchListProps = React.PropsWithoutRef<{
    className: string
    items: SearchItem[]
    prompt: string
}>

const SearchList = ({ className, items, prompt }: SearchListProps): JSX.Element => {
    const [search, setSearch] = useState("")
    const name = className ? `${styles.main} ${className}` : styles.main

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    return (
        <div className={name}>
            <div className={styles.search}>
                <div className={styles.text}> { prompt } </div>
                <input value={search} onChange={handleChange}/>
            </div>
            <div className={styles.content}>
                { items?.filter((item) => (
                        item.keyWords.some((keyword) => keyword.includes(search.toLowerCase()))
                    )).map((item) => item.content)
                }
            </div>
        </div>
    )
}

export default SearchList;