import React, { useEffect, useReducer } from 'react'
import Localization from 'utils/localization'
import Storage from 'utils/storage'
import Palettes from 'data/palettes'
import { AppContextDispatchAction, AppContextProvider, AppContextState, ViewMode } from 'types/context/appContext'

export const Context: React.Context<AppContextProvider> = React.createContext([null, null])

const AppContext = ({ children }: React.PropsWithChildren<{}>) => {
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
    const reducer = (state: AppContextState, action: AppContextDispatchAction): AppContextState => {
        switch (action.type) {
            case 'init':
                Localization.initialize();
                return state.loading 
                    ? { 
                        ...state, 
                        loading: false, 
                        palette: Storage.get("palette") ?? "cobalt",
                        viewMode: Storage.get("viewMode") ?? ViewMode.SplitView,
                        enableSyntaxHighlighting: Storage.get("enableSyntaxHighlighting") ?? true,
                        enableRowNumbers: Storage.get("enableRowNumbers") ?? true,
                        enableColorFileByType: Storage.get("enableColorFileByType") ?? true,
                        enableAutomaticLineBreak: Storage.get("enableAutomaticLineBreak") ?? false
                    } : state
            case 'setPalette':
                Storage.set("palette", action.data)
                return { ...state, palette: action.data }
            case 'setViewMode':
                Storage.set("viewMode", action.data)
                return { ...state, viewMode: action.data }
            case 'setEnableSyntaxHighlighting':
                Storage.set("enableSyntaxHighlighting", action.data)
                return { ...state, enableSyntaxHighlighting: action.data }
            case 'setEnableRowNumbers':
                Storage.set("enableRowNumbers", action.data)
                return { ...state, enableRowNumbers: action.data }
            case 'setEnableColorFileByType':
                Storage.set("enableColorFileByType", action.data)
                return { ...state, enableColorFileByType: action.data }
            case 'setEnableAutomaticLineBreak':
                Storage.set("enableColorFileByType", action.data)
                return { ...state, enableAutomaticLineBreak: action.data }
            default:
                return state
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        palette: "cobalt",
        viewMode: ViewMode.SplitView,
        enableSyntaxHighlighting: true,
        enableRowNumbers: true,
        enableColorFileByType: true,
        enableAutomaticLineBreak: false
    })

    useEffect(() => { state.loading && dispatch({ type: 'init', data: null }) }, [])
    setPalette(state.palette)

    return (
        <Context.Provider value={[ state, {
            setPalette: (palette: string) => dispatch({ type: 'setPalette', data: palette }),
            setViewMode: (mode: ViewMode) => dispatch({ type: 'setViewMode', data: mode }),
            setEnableSyntaxHighlighting: (isEnabled: boolean) => dispatch({ type: 'setEnableSyntaxHighlighting', data: isEnabled }),
            setEnableRowNumbers: (isEnabled: boolean) => dispatch({ type: 'setEnableRowNumbers', data: isEnabled }),
            setEnableColorFileByType: (isEnabled: boolean) => dispatch({ type: 'setEnableColorFileByType', data: isEnabled }),
            setEnableAutomaticLineBreak: (isEnabled: boolean) => dispatch({ type: 'setEnableAutomaticLineBreak', data: isEnabled }),
        }]}>
            { !state.loading && children }
        </Context.Provider>
    )
}

export default AppContext
