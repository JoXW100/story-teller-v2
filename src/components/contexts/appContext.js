import React, { useEffect, useReducer } from 'react'
import Localization from 'classes/localization'
import Storage from 'classes/storage'
import Palettes from 'data/palettes'
import '@types/appContext'

/** @type {React.Context<AppContextProvider>} */
export const Context = React.createContext({})

/**
 * @param {{ children: JSX.Element }}
 */
const AppContext = ({ children }) => {
    /**
     * @description Sets the global palette color variables
     * @param {string} palette 
     */
    const setPalette = (palette) => {
        if (typeof window !== "undefined") {
            Object.keys(Palettes[palette].colors).forEach((color) => {
                document.documentElement.style.setProperty(`--color-${color}`, 
                    Palettes[palette].colors[color])
            });
        }
    }

    /**
     * @description Determines the correct action and executes it
     * @param {AppContextState} state The current diagram state
     * @param {DispatchAction} action The object containing the action type and
     * any necessary data
     * @returns {AppContextState} The updated state
     */
    const reducer = (state, action) => {
        switch (action.type) {
            case 'init':
                Localization.initialize();
                return { ...state, loading: false, palette: Storage.get("palette") }
            case 'setPalette':
                Storage.set("palette", action.data)
                return { ...state, palette: action.data }
            default:
                return state
        }
    }

    /** @type {[state: AppContextState, dispatch: React.Dispatch<DispatchAction>]} */
    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        palette: "cobalt"
    })

    useEffect(() => { state.loading && dispatch({ type: 'init' }) }, [])
    setPalette(state.palette)

    return (
        <Context.Provider value={[ state, { 
            /** @param {string} palette */
            setPalette: (palette) => dispatch({ type: 'setPalette', data: palette }) 
        }]}
        >
            { !state.loading && children}
        </Context.Provider>
    )
}

export default AppContext
