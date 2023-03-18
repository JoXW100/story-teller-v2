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
    loading: boolean,
    count: number
    next: string | null
    prev: string | null
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

const CreateImportContent = ({ callback }: CreateContentProps): JSX.Element => {
    const [name, setName] = useState("")
    const [searchText, setSearchText] = useState("")
    const [spellFilter, setSpellFilter] = useState(Array.from({length: 10}, () => true))
    const [state, setState] = useState<ImportContentState>({
        menu: menuItems[0],
        values: [],
        count: 0,
        next: null,
        prev: null,
        selected: null,
        loading: true
    })
    
    useEffect(() => {
        setState({ ...state, loading: true, values: [], count: 0, next: null, prev: null })
        Communication.open5eFetchAll<Open5eItemInfo>(state.menu.type, state.menu.query, ["slug", "level_int", ...state.menu.fields])
        .then((res) => setState({ 
            ...state, 
            loading: false, 
            values: res.results, 
            count: res.count, 
            next: res.next, 
            prev: res.previous 
        }))
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
    }

    const handleNavigateClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: Open5eItemInfo) => {
        e.stopPropagation();
        window.open(Navigation.open5eURL(state.menu.type, item.slug))
    }

    const filterItems = (items: Open5eItemInfo[]) => {
        let res = items.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))
        if (state.menu.type == "spells") {
            res = res.filter((item) => spellFilter[item.level_int])
        }
        return res
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
                    <Searchbox className={styles.inputSearchbox} value={searchText} onChange={setSearchText}/>
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
                        { !state.loading && filterItems(state.values).map((item) => (
                            <div 
                                key={item.slug} 
                                className={styles.inputCompendiumItem} 
                                onClick={(e) => handleItemCLick(item)}
                                data={state.selected?.slug == item.slug ? "selected" : undefined }>
                                { state.menu.fields.map((field) => (
                                    <div key={field}> { item[field] } </div>
                                ))}
                                <button 
                                    className={styles.inputCompendiumItemButton}
                                    onClick={(e) => handleNavigateClick(e, item)}>
                                    <OpenExternalIcon/>
                                </button>
                            </div>
                        ))}
                        { state.loading && <Loading/>}
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
                        ? Localization.toText('createFilePopup-button-import-value').replace("@1", state.selected.name)
                        : Localization.toText('createFilePopup-button-import-value-empty')}
                </div>
            </div>
        </>
    )
}

export default CreateImportContent;