import React, { useState } from 'react';
import styles from 'styles/components/searchList.module.scss';

export interface SearchItem {
    keyWords: string[]
    value: number
    content: JSX.Element
}

type SearchListProps = React.PropsWithoutRef<{
    className?: string
    items: SearchItem[]
    prompt: string
    placeholder?: string
}>

const SearchList = ({ className, items, prompt, placeholder }: SearchListProps): JSX.Element => {
    const [search, setSearch] = useState("")
    const name = className ? `${styles.main} ${className}` : styles.main

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    return (
        <div className={name}>
            <div className={styles.search}>
                <label>{prompt}</label>
                <input value={search} placeholder={placeholder} onChange={handleChange}/>
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