import React, { useEffect, useReducer } from 'react'
import Localization from 'utils/localization'
import Storage from 'utils/storage'
import Palettes from 'data/palettes'
import { DispatchAction } from 'types/context'
import { AppContextProvider, AppContextState } from 'types/context/appContext'

export const Context: React.Context<AppContextProvider> = React.createContext([null, null])

const AppContext = ({ children }: React.PropsWithChildren<{}>) => {
    /** Sets the global palette color variables */
    const setPalette = (palette: string) => {
        if (palette && typeof window !== "undefined") {
            Object.keys(Palettes[palette].colors).forEach((color) => {
                document.documentElement.style.setProperty(`--color-${color}`, 
                    Palettes[palette]?.colors[color] ?? "#ffffff")
            });
        }
    }

    /** Determines the correct action and executes it */
    const reducer = (state: AppContextState, action: DispatchAction<any>): AppContextState => {
        switch (action.type) {
            case 'init':
                Localization.initialize();
                return state.loading 
                    ? { ...state, loading: false, palette: Storage.get("palette") ?? "cobalt" }
                    : state
            case 'setPalette':
                Storage.set("palette", action.data)
                return { ...state, palette: action.data }
            default:
                return state
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        palette: "cobalt"
    })

    useEffect(() => { state.loading && dispatch({ type: 'init', data: null }) }, [])
    setPalette(state.palette)

    return (
        <Context.Provider value={[ state, {
            setPalette: (palette: string) => dispatch({ type: 'setPalette', data: palette }) 
        }]}
        >
            { !state.loading && children }
        </Context.Provider>
    )
}

export default AppContext
