import { useEffect, useRef, useState } from "react"
import OpenExternalIcon from '@mui/icons-material/OpenInNewSharp';
import NextIcon from '@mui/icons-material/NavigateNextSharp';
import PrevIcon from '@mui/icons-material/NavigateBeforeSharp';
import { closePopup } from "components/common/popupHolder";
import Searchbox from "components/common/controls/searchbox";
import Loading from "components/common/loading";
import { CreateContentProps } from ".";
import { open5eCreatureImporter, open5eSpellImporter } from "utils/importers/open5eImporter";
import { Open5eCompendiumData } from "data";
import Localization from "utils/localization";
import Navigation from "utils/navigation";
import Communication from "utils/communication";
import { asNumber } from "utils/helpers";
import Logger from "utils/logger";
import { IFileMetadata, FileType } from "types/database/files";
import { InputType } from "types/context/fileSystemContext";
import { ICompendiumMenuItem, Open5eItemInfo } from "types/open5eCompendium";
import styles from 'styles/pages/storyPage/createFilePopup.module.scss';

interface ImportContentState {
    menu: ICompendiumMenuItem
    values: Open5eItemInfo[]
    sorting: SortingMethod
    selected: Open5eItemInfo | null
    loading: boolean
}

interface SortingMethod {
    field: string | null
    direction: "ascending" | "descending" | "none"
}

const spellFilterItems = ["C", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const hpSplitExpr = /([0-9]+)d([0-9]+)([\+\-][0-9]+)?/;
const itemsPerPage = 100

const CreateImportContent = ({ callback }: CreateContentProps): JSX.Element => {
    const ref = useRef<HTMLButtonElement>(null);
    const [name, setName] = useState("")
    const [searchText, setSearchText] = useState("")
    const [spellFilter, setSpellFilter] = useState(Array.from({length: 10}, () => true))
    const [page, setPage] = useState<number>(0)
    const [state, setState] = useState<ImportContentState>({
        menu: Open5eCompendiumData[0],
        values: [],
        sorting: { field: null, direction: "none" },
        selected: null,
        loading: false
    })
    
    useEffect(() => {
        if (!state.loading) {
            setState({ ...state, loading: true, values: [] })
            Communication.open5eFetchAll<Open5eItemInfo>(state.menu.type,
                state.menu.query, 
                ["slug", "level_int", ...state.menu.fields])
            .then((res) => {
                if (page != 0) { setPage(0) }
                setState((state) => state.loading ? { 
                    ...state, 
                    loading: false, 
                    values: res.results
                } : state)
            })
        }
    }, [state.menu])

    const handleImportClick = () => {
        if (state.selected != null) {
            let importer: Promise<IFileMetadata>;
            if (state.menu.type == "monsters") {
                importer = open5eCreatureImporter(state.selected.slug)
            } else {
                importer = open5eSpellImporter(state.selected.slug)
            }
            importer.then((res) => res && callback && callback({
                type: InputType.Import,
                data: {
                    type: state.menu.type == "monsters" 
                        ? FileType.Creature 
                        : FileType.Spell,
                    name: name,
                    data: res
                }
            }))
            .catch(e => Logger.throw("createImportContent.handleImportClick", e))
            .finally(closePopup)
        }
    }

    const handleItemCLick = (item: Open5eItemInfo) => {
        if (name.length == 0) {
            setName(item.name)
        }
        setState({ ...state, selected: item })
    }

    const handleMenuItemCLick = (item: ICompendiumMenuItem) => {
        setState({ ...state, menu: item, selected: null })
    }

    const handleSpellFilterItemCLick = (index: number) => {
        let filter = [...spellFilter]
        filter[index] = !filter[index]
        setSpellFilter(filter)
        if (page != 0) { setPage(0) }
    }

    const handleNavigateClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: Open5eItemInfo) => {
        e.stopPropagation();
        window.open(Navigation.open5eURL(state.menu.type, item.slug))
    }

    const handleSearchChange = (newValue: string) => {
        if (page != 0) { setPage(0) }
        setSearchText(newValue)
    }

    const filterItems = (items: Open5eItemInfo[]): Open5eItemInfo[] => {
        let res = items.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))
        if (state.menu.type == "spells") {
            res = res.filter((item) => spellFilter[item.level_int])
        }
        return res
    }

    const splitHP = (hp: string) => {
        let res = hpSplitExpr.exec(hp ?? "") ?? []
        return {
            num: asNumber(res[1]),
            dice: asNumber(res[2]),
            mod: asNumber(res[3])
        }
    }

    const sortItems = (a: Open5eItemInfo, b: Open5eItemInfo): number => {
        let val = 0;
        if (typeof a[state.sorting.field] == typeof "") {
            let numA = parseInt(a[state.sorting.field])
            if (hpSplitExpr.test(a[state.sorting.field])) {
                let hpA = splitHP(a[state.sorting.field])
                let hpB = splitHP(b[state.sorting.field])
                val = (hpA.num * hpA.dice + hpA.mod) - (hpB.num * hpB.dice + hpB.mod)
            } else if (!isNaN(numA)) {
                let numB = parseInt(b[state.sorting.field])
                val = numA - numB;
            } else {
                val = String(a[state.sorting.field]).localeCompare(b[state.sorting.field])
            }
        } else {
            val = Number(a[state.sorting.field]) - b[state.sorting.field]
        }
        return state.sorting.direction == "descending" ? val : -val;
    }

    const getPageItems = (items: Open5eItemInfo[]): Open5eItemInfo[] => {
        return items.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
    }

    const buildMenuItems = (items: ICompendiumMenuItem[], level: number = 0): JSX.Element[] => {
        return items.map((item, index) => {
            let selected = state.menu?.title == item.title
            let res = (
                <button 
                    key={`${level}-${index}`} 
                    className={styles.inputCompendiumMenuItem} 
                    value={level.toString()}
                    data={selected ? "selected" : undefined }
                    disabled={state.loading || selected}
                    onClick={() => handleMenuItemCLick(item) }>
                    { item.title }
                </button>
            )
            return (
                item.subItems?.length > 0 ? (
                    <div 
                        key={`${level}-${index}-holder`} 
                        className={styles.inputCompendiumMenuItemHolder}>
                        { res }
                        { buildMenuItems(item.subItems, level + 1) }
                    </div>
                ) : res
            )
        })
    }

    const handleHeaderFieldClick = (index: number) => {
        if (!state.menu.sortFields || !state.menu.sortFields[index]) {
            return;
        }

        let sorting: SortingMethod = {
            field: state.menu.sortFields[index],
            direction: "descending"
        }

        if (state.sorting.field === state.menu.sortFields[index]) {
            switch (state.sorting.direction) {
                case "ascending":
                    sorting.direction = "none"
                    break;
                case "descending":
                    sorting.direction = "ascending"
                    break;
                case "none":
                    sorting.direction = "descending"
                default:
                    break;
            }
        }
        
        if (page != 0) { setPage(0) }
        setState({ ...state, sorting: sorting })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !ref.current.disabled){
            ref.current.click();
            closePopup()
            closePopup()
        }
    }

    const filteredItems = state.loading ? [] : filterItems(state.values)
    const items = state.sorting.direction != "none" 
        ? filteredItems.sort(sortItems)
        : filteredItems
    const numPages = Math.ceil(items.length / itemsPerPage)

    const handlePaginator = (delta: number) => {
        setPage(Math.max(0, Math.min(page + delta, numPages - 1)))
    }

    return (
        <>
            <div className={styles.inputCompendiumArea}>
                <div className={styles.inputHeader}> 
                    <b>{Localization.toText('createFilePopup-importHeader')}</b>
                    <div className={styles.compendiumSpellFilterGroup}> 
                        { state.menu.type == "spells" && spellFilterItems.map((item, index) => (
                            <button 
                                key={index} 
                                className={styles.compendiumSpellFilterGroupItem}
                                onClick={() => handleSpellFilterItemCLick(index)}
                                data={spellFilter[index] ? "selected" : undefined}>
                                { item }
                            </button>
                        ))}
                    </div>
                    <Searchbox 
                        className={styles.inputSearchbox} 
                        value={searchText} 
                        onChange={handleSearchChange}/>
                </div>
                <div className={styles.inputCompendium}>
                    <div className={styles.inputCompendiumMenu}>
                        { buildMenuItems(Open5eCompendiumData) }
                    </div>
                    <div className={styles.inputCompendiumValueList}>
                        <div className={styles.inputCompendiumListHeader}>
                            { state.menu.headers?.map((header, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleHeaderFieldClick(index)}
                                    data={state.menu.sortFields && state.sorting.field == state.menu.sortFields[index] 
                                        ? state.sorting.direction 
                                        : undefined}> 
                                    { header } 
                                </div>
                            ))}
                        </div>
                        { !state.loading && getPageItems(items).map((item) => (
                                <div 
                                    key={item.slug} 
                                    className={styles.inputCompendiumItem} 
                                    onClick={() => handleItemCLick(item)}
                                    data={state.selected?.slug == item.slug ? "selected" : undefined }>
                                    { state.menu.fields.map((field) => (
                                        <div key={field}>{item[field]}</div>
                                    ))}
                                    <button 
                                        className={styles.inputCompendiumItemButton}
                                        onClick={(e) => handleNavigateClick(e, item)}>
                                        <OpenExternalIcon/>
                                    </button>
                                </div>
                            ))
                        }{ !state.loading && items.length > itemsPerPage && (
                            <div className={styles.compendiumPaginator}>
                                <button 
                                    disabled={page == 0} 
                                    onClick={() => handlePaginator(-1)}>
                                    <PrevIcon/>
                                </button>
                                    { `${page + 1} / ${numPages}` }
                                <button
                                    disabled={items.length <= (page + 1) * itemsPerPage} 
                                    onClick={() => handlePaginator(1)}>
                                    <NextIcon/>
                                </button>
                            </div>
                        )}{ state.loading && <Loading/>}
                    </div>
                </div>
            </div>
            <div className={styles.inputRow}>
                <span>{Localization.toText('createFilePopup-fileNamePrompt')}:</span>
                <input 
                    value={name} 
                    onChange={handleChange}
                    onKeyDown={handleInput}
                    placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}>
                <button 
                    ref={ref}
                    onClick={handleImportClick}
                    disabled={!name || state.selected == null}> 
                    { state.selected !== null 
                        ? Localization.toText('createFilePopup-button-import-value', state.selected.name)
                        : Localization.toText('createFilePopup-button-import-value-empty')}
                </button>
            </div>
        </>
    )
}

export default CreateImportContent;