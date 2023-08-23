import React, { useEffect, useMemo, useReducer, useState } from 'react'
import Localization from 'utils/localization'
import Communication from 'utils/communication'
import Storage from 'utils/storage'
import Logger from 'utils/logger'
import Palettes from 'data/palettes'
import { AppContextDispatch, AppContextDispatchAction, AppContextProvider, AppContextState, ViewMode } from 'types/context/appContext'
import { FileMetadataQueryResult } from 'types/database/responses'

export const Context: React.Context<AppContextProvider> = React.createContext([null, null])

const DefaultPalette: string = Object.keys(Palettes)[0];

/** Sets the global palette color variables */
const setPalette = (palette: string) => {
    if (palette && typeof window !== "undefined" && Palettes[palette]) {
        Object.keys(Palettes[palette].colors).forEach((color) => {
            document.documentElement.style.setProperty(`--color-${color}`, 
                Palettes[palette]?.colors[color] ?? "#ffffff")
        });
    }
}


/** Determines the correct action and executes it */
const appReducer = (state: AppContextState, action: AppContextDispatchAction): AppContextState => {
    Logger.log("appContext", action.type);
    switch (action.type) {
        case 'init':
            return state.loading 
                ? { 
                    ...state, 
                    loading: false, 
                    palette: Storage.getKeyOf("palette", Palettes) ?? DefaultPalette,
                    viewMode: Storage.getEnum("viewMode", ViewMode) ?? ViewMode.SplitView,
                    enableSyntaxHighlighting: Storage.getBoolean("enableSyntaxHighlighting") ?? true,
                    enableRowNumbers: Storage.getBoolean("enableRowNumbers") ?? true,
                    enableColorFileByType: Storage.getBoolean("enableColorFileByType") ?? true,
                    automaticLineBreak: Storage.getInt("automaticLineBreak") ?? 0
                } satisfies AppContextState : state
        case 'setPalette':
            Storage.setString("palette", action.data)
            return { ...state, palette: action.data }
        case 'setViewMode':
            Storage.setString("viewMode", action.data)
            return { ...state, viewMode: action.data }
        case 'setEnableSyntaxHighlighting':
            Storage.setBoolean("enableSyntaxHighlighting", action.data)
            return { ...state, enableSyntaxHighlighting: action.data }
        case 'setEnableRowNumbers':
            Storage.setBoolean("enableRowNumbers", action.data)
            return { ...state, enableRowNumbers: action.data }
        case 'setEnableColorFileByType':
            Storage.setBoolean("enableColorFileByType", action.data)
            return { ...state, enableColorFileByType: action.data }
        case 'setAutomaticLineBreak':
            Storage.setInt("automaticLineBreak", action.data)
            return { ...state, automaticLineBreak: action.data }
        default:
            return state
    }
}

const getCommunicationCacheEntries = (): Record<string, FileMetadataQueryResult> => {
    let storedCache = Storage.getObject<Record<string, FileMetadataQueryResult>>("communicationCache")
    if (storedCache) {
        // Delete old items
        let date = new Date()
        date.setMonth(date.getMonth() - 2)
        let time = date.getTime()
        
        for (var key in storedCache) {
            if (storedCache[key].date < time) {
                Storage.delete(key)
                delete storedCache[key]
            }
        }
    }
    return storedCache ?? {}
}

const AppContext = ({ children }: React.PropsWithChildren<{}>) => {
    const [communicationCache, setCommunicationCache] = useState<Record<string, FileMetadataQueryResult>>(null)
    const [state, dispatch] = useReducer(appReducer, {
        loading: true,
        palette: DefaultPalette,
        viewMode: ViewMode.SplitView,
        enableSyntaxHighlighting: true,
        enableRowNumbers: true,
        enableColorFileByType: true,
        automaticLineBreak: 0
    })

    useEffect(() => { 
        Localization.initialize();
        state.loading && dispatch({ type: 'init', data: null, dispatch: dispatch }) 
    }, [])

    useEffect(() => { 
        if (communicationCache === null) {
            setCommunicationCache(getCommunicationCacheEntries())
        } else {
            Storage.setObject("communicationCache", communicationCache)
            Communication.initialize(communicationCache, setCommunicationCache)
        }
    }, [communicationCache])

    useEffect(() => setPalette(state.palette), [state.palette])

    const memoizedDispatch = useMemo<AppContextDispatch>(() => ({
        setPalette: (palette: string) => dispatch({ type: 'setPalette', data: palette }),
        setViewMode: (mode: ViewMode) => dispatch({ type: 'setViewMode', data: mode }),
        setEnableSyntaxHighlighting: (isEnabled: boolean) => dispatch({ type: 'setEnableSyntaxHighlighting', data: isEnabled }),
        setEnableRowNumbers: (isEnabled: boolean) => dispatch({ type: 'setEnableRowNumbers', data: isEnabled }),
        setEnableColorFileByType: (isEnabled: boolean) => dispatch({ type: 'setEnableColorFileByType', data: isEnabled }),
        setAutomaticLineBreak: (count: number) => dispatch({ type: 'setAutomaticLineBreak', data: count }),
        clearCommunicationCache: () => setCommunicationCache({})
    }), [dispatch])

    return (
        <Context.Provider value={[ state, memoizedDispatch]}>
            { !state.loading && children }
        </Context.Provider>
    )
}

export default AppContext
