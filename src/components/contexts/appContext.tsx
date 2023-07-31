import React, { useEffect, useReducer } from 'react'
import Localization from 'utils/localization'
import Storage from 'utils/storage'
import Palettes from 'data/palettes'
import { AppContextDispatchAction, AppContextProvider, AppContextState, ViewMode } from 'types/context/appContext'

export const Context: React.Context<AppContextProvider> = React.createContext([null, null])

const DefaultPalette: string = Object.keys(Palettes)[0];

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
                var palette = Storage.getString("palette");
                Localization.initialize();
                return state.loading 
                    ? { 
                        ...state, 
                        loading: false, 
                        palette: Object.keys(Palettes).includes(palette) ? palette : DefaultPalette,
                        viewMode: Storage.getString("viewMode") as ViewMode ?? ViewMode.SplitView,
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

    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        palette: "cobalt",
        viewMode: ViewMode.SplitView,
        enableSyntaxHighlighting: true,
        enableRowNumbers: true,
        enableColorFileByType: true,
        automaticLineBreak: 0
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
            setAutomaticLineBreak: (count: number) => dispatch({ type: 'setAutomaticLineBreak', data: count }),
        }]}>
            { !state.loading && children }
        </Context.Provider>
    )
}

export default AppContext
