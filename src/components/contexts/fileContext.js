import React, { useEffect, useReducer } from 'react'
import { useRouter } from 'next/router'
import '@types/fileContext'
import RequestQueue from 'utils/requestQueue'

/** @type {React.Context<FileContextProvider>} */
export const Context = React.createContext({})

/**
 * @param {{ fileId: string, children: JSX.Element }}
 */
const FileContext = ({ fileId, children }) => {
    const router = useRouter()
    
    const fetchFile = (fileId) => {
        fetch('/api/database/getFile?fileId=' + fileId)
        .then((res) => res.json())
        .then((res) => {
            if (res.success) {
                dispatch({ type: 'initSet', data: res })
                return;
            }
            throw new Error(res.result)
        })
        .catch(console.error)
    }

    const setFileText = (fileId, text) => {
        fetch('/api/database/setFileText', {
            method: 'PUT',
            body: JSON.stringify({ 
                fileId: fileId,
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
                fetchFile(fileId)
                return state; 

            case 'initSet':
                if (action.data.success) {
                    return  { 
                        ...state, 
                        loading: false, 
                        file: action.data.result
                    };
                }
                router.push('../');
                return state

            case 'setText':
                if (state.file) {
                    state.queue.addRequest(setFileText, state.file.id, action.data);
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
        editEnabled: true,
        file: null,
        queue: new RequestQueue()
    })

    useEffect(() => { fileId && dispatch({ type: 'init' }) }, [fileId])
    
    return (
        <Context.Provider value={[state, {
            setText: (text) => dispatch({ type: 'setText', data: text })
        } ]}>
            { (!fileId || !state.loading) && children }
        </Context.Provider>
    )
}

export default FileContext
