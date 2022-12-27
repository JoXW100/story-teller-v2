import React, { useEffect, useReducer } from 'react'
import { DBResponse, ObjectId } from 'types/database'
import { DispatchAction } from 'types/context'
import { FileContextProvider, FileContextState } from 'types/context/fileContext'
import RequestQueue from 'utils/data/requestQueue'
import { FileGetResult, FileSetPropertyResult } from 'types/database/files'

export const Context: React.Context<FileContextProvider> = React.createContext([null, null])

type FileContextProps = React.PropsWithChildren<{
    storyId?: ObjectId,
    fileId: ObjectId
}>

const FileContext = ({ storyId, fileId, children }: FileContextProps): JSX.Element => {

    const fetchFile = (storyId: ObjectId, fileId: ObjectId) => {
        fetch(`/api/database/getFile?storyId=${storyId}&fileId=${fileId}`)
        .then((res) => res.json())
        .then((res: DBResponse<FileGetResult>) => {
            dispatch({ type: 'initSet', data: res })
            if (!res.success)
                throw new Error(res.result as string)
        })
        .catch(console.error)
    }
    
    const setFileText = (storyId: ObjectId, fileId: ObjectId, text: string) => {
        fetch('/api/database/setFileText', {
            method: 'PUT',
            body: JSON.stringify({ 
                fileId: fileId,
                storyId: storyId,
                text: text
            })
        })
        .then((res) => res.json())
        .then((res: DBResponse<FileSetPropertyResult>) => {
            if (!res.success)
                console.warn(res.result as string)
        })
        .catch(console.error);
    }
    
    const setFileMetadata = (storyId: ObjectId, fileId: ObjectId, metadata: string) => {
        fetch('/api/database/setFileMetadata', {
            method: 'PUT',
            body: JSON.stringify({ 
                fileId: fileId,
                storyId: storyId,
                metadata: metadata
            })
        })
        .then((res) => res.json())
        .then((res: DBResponse<FileSetPropertyResult>) => {
            if (!res.success)
                console.warn(res.result as string)
        })
        .catch(console.error);
    }

    const reducer = (state: FileContextState, action: DispatchAction<any>): FileContextState => {
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
                var file = action.data.success ? action.data.result : null
                if (file) {
                    file.metadata = file.metadata ? file.metadata : {}
                }
                return {
                    ...state,
                    loading: false, 
                    fetching: false,
                    file: file
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