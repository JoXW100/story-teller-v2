import { ChangeEventHandler, MouseEventHandler, useRef } from 'react';
import SearchIcon from '@mui/icons-material/SearchSharp';
import Localization from "utils/localization";
import styles from 'styles/components/searchbox.module.scss';

type SearchboxProps = React.PropsWithRef<{
    className: string
    value: string
    onChange: (value: string) => void
}>

const Searchbox = ({ className, value, onChange }: SearchboxProps): JSX.Element => {
    const name = className ? `${styles.main} ${className}` : styles.main
    const ref = useRef<HTMLInputElement>()
    
    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        onChange(e.target.value)
    }

    const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
        if (e.target != ref.current) {
            e.preventDefault()
            e.stopPropagation()
            ref.current?.select()
        }
    }

    return (
        <div className={name} onClick={handleClick}>
            <SearchIcon/>
            <input 
                ref={ref}
                type="text"
                value={value}
                placeholder={Localization.toText("searchbox-placeholder")}
                onChange={handleChange}/>
        </div>
    )
}

export default Searchbox