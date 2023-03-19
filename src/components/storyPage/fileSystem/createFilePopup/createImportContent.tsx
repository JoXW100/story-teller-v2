import { useEffect, useState } from "react"
import Link from "next/link";
import OpenExternalIcon from '@mui/icons-material/OpenInNewSharp';
import { closePopup } from "components/common/popupHolder";
import Searchbox from "components/common/searchbox";
import Loading from "components/common/loading";
import { CreateContentProps } from ".";
import { open5eCreatureImporter, open5eSpellImporter } from "importers/open5eImporter";
import Localization from "utils/localization";
import Communication, { Open5eFetchType } from "utils/communication";
import { FileMetadata, FileType } from "types/database/files";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/storyPage/createFilePopup.module.scss';
import Navigation from "utils/navigation";

interface ImportContentState {
    menu: CompendiumMenuItem
    values: Open5eItemInfo[]
    selected: Open5eItemInfo | null
    loading: boolean
}

interface Open5eItemInfo {
    slug: string
    name: string
    level_int?: number
}

interface CompendiumMenuItem {
    title: string
    type: Open5eFetchType
    fields: string[]
    headers: string[]
    query?: Record<string, string | number>
    subItems?: CompendiumMenuItem[]
}

const menuItems = require('data/open5eCompendiumMenu.json') as CompendiumMenuItem[]
const spellFilterItems = ["Cantrip", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const itemsPerPage = 100

const CreateImportContent = ({ callback }: CreateContentProps): JSX.Element => {
    const [name, setName] = useState("")
    const [searchText, setSearchText] = useState("")
    const [spellFilter, setSpellFilter] = useState(Array.from({length: 10}, () => true))
    const [page, setPage] = useState<number>(0)
    const [state, setState] = useState<ImportContentState>({
        menu: menuItems[0],
        values: [],
        selected: null,
        loading: true
    })
    
    useEffect(() => {
        setState({ ...state, loading: true, values: [] })
        Communication.open5eFetchAll<Open5eItemInfo>(state.menu.type, state.menu.query, ["slug", "level_int", ...state.menu.fields])
        .then((res) => {
            setPage(0)
            setState({ 
                ...state, 
                loading: false, 
                values: res.results
            })
        })
    }, [state.menu])

    const handleImportClick = () => {
        if (state.selected != null) {
            var importer: Promise<FileMetadata>
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
            .catch(console.error)
            closePopup()
        }
    }

    const handleItemCLick = (item: Open5eItemInfo) => {
        if (name.length == 0) {
            setName(item.name)
        }
        setState({ ...state, selected: item })
    }

    const handleMenuItemCLick = (item: CompendiumMenuItem) => {
        setState({ ...state, menu: item, selected: null })
    }

    const handleSpellFilterItemCLick = (index: number) => {
        let filter = [...spellFilter]
        filter[index] = !filter[index]
        setSpellFilter(filter)
        setPage(0)
    }

    const handleNavigateClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: Open5eItemInfo) => {
        e.stopPropagation();
        window.open(Navigation.open5eURL(state.menu.type, item.slug))
    }

    const handleSearchChange = (newValue: string) => {
        setPage(0)
        setSearchText(newValue)
    }

    const filterItems = (items: Open5eItemInfo[]): Open5eItemInfo[] => {
        let res = items.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))
        if (state.menu.type == "spells") {
            res = res.filter((item) => spellFilter[item.level_int])
        }
        return res
    }

    const getPageItems = (items: Open5eItemInfo[]): Open5eItemInfo[] => {
        return items.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
    }

    const buildMenuItems = (items: CompendiumMenuItem[], level: number = 0): JSX.Element[] => {
        return items.map((item, index) => {
            let res = (
                <div 
                    key={`${level}-${index}`} 
                    className={styles.inputCompendiumMenuItem} 
                    value={level.toString()}
                    data={state.menu?.title == item.title ? "selected" : undefined }
                    onClick={() => handleMenuItemCLick(item) }>
                    { item.title }
                </div>
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

    const items = state.loading ? [] : filterItems(state.values)
    const numPages = Math.ceil(items.length / itemsPerPage)

    const handlePaginator = (delta: number) => {
        setPage(Math.max(0, Math.min(page + delta, numPages - 1)))
    }

    return (
        <>
            <div className={styles.inputCompendiumArea}>
                <div className={styles.inputHeader}> 
                    {Localization.toText('createFilePopup-importHeader')}
                    { state.menu.type == "spells" &&
                        <div className={styles.compendiumSpellFilterGroup}> 
                            { spellFilterItems.map((item, index) => (
                                <div 
                                    key={index} 
                                    className={styles.compendiumSpellFilterGroupItem}
                                    onClick={() => handleSpellFilterItemCLick(index)}
                                    data={spellFilter[index] ? "selected" : undefined}>
                                    { item }
                                </div>
                            ))}
                        </div>
                    }
                    <Searchbox className={styles.inputSearchbox} value={searchText} onChange={handleSearchChange}/>
                </div>
                <div className={styles.inputCompendium}>
                    <div className={styles.inputCompendiumMenu}>
                        { buildMenuItems(menuItems) }
                    </div>
                    <div className={styles.inputCompendiumValueList}>
                        <div className={styles.inputCompendiumListHeader}>
                            { state.menu.headers?.map((header, index) => (
                                <div key={index}> { header } </div>
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
                                <button disabled={page == 0} onClick={() => handlePaginator(-1)}>
                                    {Localization.toText('createFilePopup-compendiumPaginatorPrev')}
                                </button>
                                    { `${page + 1} / ${numPages}` }
                                <button
                                    disabled={items.length <= (page + 1) * itemsPerPage} 
                                    onClick={() => handlePaginator(1)}>
                                    {Localization.toText('createFilePopup-compendiumPaginatorNext')}
                                </button>
                            </div>
                        )}{ state.loading && <Loading/>}
                    </div>
                </div>
            </div>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-fileNamePrompt')}:</div>
                <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}>
                <div 
                    className={styles.button}
                    onClick={handleImportClick}
                    disabled={!name || state.selected == null}
                > 
                    { state.selected !== null 
                        ? Localization.toText('createFilePopup-button-import-value', state.selected.name)
                        : Localization.toText('createFilePopup-button-import-value-empty')}
                </div>
            </div>
        </>
    )
}

export default CreateImportContent;