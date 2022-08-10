import React, { useEffect, useReducer } from 'react'
import Localization from 'classes/localization'
import '@types/appContext'

/** @type {React.Context<AppContextProvider>} */
export const Context = React.createContext({})

/**
 * @param {{ children: JSX.Element }}
 */
const AppContext = ({ children }) => {

    /**
     * @description Determines the correct action and executes it
     * @param {AppContextState} state The current diagram state
     * @param {DispatchAction} action The object containing the action type and
     * any necessary data
     * @returns {AppContextState} The updated state
     */
    const reducer = (state, action) => {
        console.log("reducer", action)
        switch (action.type) {
            case 'init':
                Localization.initialize();
                return { ...state, loading: false }
                
            default:
                return state
        }
    }

    /** @type {[state: AppContextState, dispatch: React.Dispatch<DispatchAction>]} */
    const [state, dispatch] = useReducer(reducer, {
        loading: true
    })

    useEffect(() => state.loading && dispatch({ type: 'init' }), [])

    return (
        <Context.Provider value={[ state, {} ]}>
            { !state.loading && children}
        </Context.Provider>
    )
}

export default AppContext
