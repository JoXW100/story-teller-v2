import React, { useEffect, useReducer } from 'react'
import RequestQueue from 'utils/data/requestQueue'
import '@types/fileContext'

/** @type {React.Context<FileContextProvider>} */
export const Context = React.createContext({})


/**
 * @param {{ 
 *  storyId: import('@types/database').ObjectId, 
 *  fileId: import('@types/database').ObjectId, 
 *  children: JSX.Element 
 * }}
 * @returns {JSX.Element}
 */
const FileContext = ({ storyId, fileId, children }) => {

    const fetchFile = (storyId, fileId) => {
        fetch(`/api/database/getFile?storyId=${storyId}&fileId=${fileId}`)
        .then((res) => res.json())
        .then((res) => {
            dispatch({ type: 'initSet', data: res })
            if (!res.success)
                throw new Error(res.result)
        })
        .catch(console.error)
    }

    const setFileText = (storyId, fileId, text) => {
        fetch('/api/database/setFileText', {
            method: 'PUT',
            body: JSON.stringify({ 
                fileId: fileId,
                storyId: storyId,
                text: text
            })
        })
        .then((res) => res.json())
        .then((res) => !res.success && console.warn(res.result))
        .catch(console.error);
    }

    /**
     * @param {FileContextState} state
     * @param {DispatchAction} action
     * @returns {FileContextState}
     */
    const reducer = (state, action) => {
        switch (action.type) {
            case 'init':
                if (state.fetching)
                    return state;

                if (!fileId) 
                    return { 
                        ...state, 
                        loading: false, 
                        fetching: false, 
                        fileSelected: false, 
                        file: null 
                    }

                fetchFile(storyId, fileId)
                return { 
                    ...state, 
                    fileSelected: Boolean(fileId), 
                    fetching: Boolean(fileId) 
                }

            case 'initSet':
                return {
                    ...state,
                    loading: false, 
                    fetching: false,
                    file: action.data.success ? action.data.result : null
                }

            case 'setText':
                if (state.file) {
                    state.queue.addRequest(setFileText, storyId, state.file.id, action.data);
                    return  { 
                        ...state,
                        file: {
                            ...state.file,
                            content: {
                                ...state.file.content,
                                text: action.data
                            }
                        }
                    };
                }

            default:
                return state
        }
    }

    /** @type {[state: FileContextState, dispatch: React.Dispatch<DispatchAction>]} */
    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        fetching: false,
        fileSelected: false,
        file: null,
        queue: new RequestQueue()
    })

    useEffect(() => { dispatch({ type: 'init' }) }, [fileId])
    
    return (
        <Context.Provider value={[state, {
            setText: (text) => dispatch({ type: 'setText', data: text })
        } ]}>
            { !state.loading && children }
        </Context.Provider>
    )
}

export default FileContext
