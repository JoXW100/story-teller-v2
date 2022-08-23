import React, { useEffect, useReducer } from 'react'
import RequestQueue from 'utils/data/requestQueue'
import '@types/fileContext'
import '@types/database'

/** @type {React.Context<import('@types/fileContext').FileContextProvider>} */
export const Context = React.createContext({})

/**
 * @param {{ storyId: ObjectId, fileId: ObjectId, children: JSX.Element }}
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
    
    const setFileMetadata = (storyId, fileId, metadata) => {
        fetch('/api/database/setFileMetadata', {
            method: 'PUT',
            body: JSON.stringify({ 
                fileId: fileId,
                storyId: storyId,
                metadata: metadata
            })
        })
        .then((res) => res.json())
        .then((res) => !res.success && console.warn(res.result))
        .catch(console.error);
    }

    /**
     * @param {import('@types/fileContext').FileContextState} state
     * @param {DispatchAction<any>} action
     * @returns {import('@types/fileContext').FileContextState}
     */
    const reducer = (state, action) => {
        switch (action.type) {
            case 'init':
                if (state.fetching)
                    return state;

                if (!action.data) 
                    return { 
                        ...state, 
                        loading: false, 
                        fetching: false, 
                        fileSelected: false, 
                        file: null 
                    }

                fetchFile(storyId, action.data)
                return { 
                    ...state, 
                    fileSelected: Boolean(action.data), 
                    fetching: Boolean(action.data) 
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
                    state.queue.addRequest(setFileText, "text", storyId, state.file.id, action.data);
                    return  { 
                        ...state,
                        file: {
                            ...state.file,
                            content: { ...state.file.content, text: action.data }
                        }
                    };
                }
            
            case 'setMetadata':
                if (state.file && action.data?.key) {
                    var data = { 
                        ...state.file.metadata, 
                        [action.data.key]: action.data.value 
                    }
                    state.queue.addRequest(setFileMetadata, "metadata", storyId, state.file.id, data);
                    return { 
                        ...state, 
                        file: { 
                            ...state.file, 
                            metadata: data
                        } 
                    }
                }

            default:
                return state
        }
    }

    /** 
     * @type {[
     *      state: import('@types/fileContext').FileContextState, 
     *      dispatch: React.Dispatch<DispatchAction<any>>
     *  ]}
     */
    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        fetching: false,
        fileSelected: false,
        file: null,
        queue: new RequestQueue()
    })

    useEffect(() => { dispatch({ type: 'init', data: fileId }) }, [fileId])
    
    return (
        <Context.Provider value={[state, {
            setText: (text) => dispatch({ type: 'setText', data: text }),
            setMetadata: (key, value) => dispatch({ type: 'setMetadata', data: { key: key, value: value } })
        } ]}>
            { !state.loading && children }
        </Context.Provider>
    )
}

export default FileContext
