import React, { useEffect, useReducer } from 'react'
import Head from 'next/head'
import RequestQueue from 'utils/data/requestQueue'
import Communication from 'utils/communication'
import { ObjectId } from 'types/database'
import { FileContextDispatchAction, FileContextProvider, FileContextState } from 'types/context/fileContext'
import { FileGetResult } from 'types/database/files'
import { FileMetadata } from 'types/database/files'

export const Context: React.Context<FileContextProvider> = React.createContext([null, null])

type FileContextProps = React.PropsWithChildren<{
    storyId?: ObjectId,
    fileId: ObjectId,
    viewMode?: boolean
}>

type FileHeaderProps = React.PropsWithoutRef<{
    file: FileGetResult
}>

const FileContext = ({ storyId, fileId, viewMode = false, children }: FileContextProps): JSX.Element => {
    const reducer = (state: FileContextState, action: FileContextDispatchAction): FileContextState => {
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
                Communication.getFile(storyId, fileId).then((res) => {
                    dispatch({ type: 'initSet', data: res })
                })
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
                    state.queue.addRequest(() => {
                        Communication.setFileText(storyId, state.file.id, action.data)
                    }, "text");
                    return  { 
                        ...state,
                        file: {
                            ...state.file,
                            content: { ...state.file.content, text: action.data }
                        }
                    };
                }
                return state;
            
            case 'setMetadata':
                if (state.file && action.data?.key) {
                    let data = { 
                        ...state.file.metadata, 
                        [action.data.key]: action.data.value 
                    } as FileMetadata
                    delete data.$vars;
                    delete data.$queries;
                    state.queue.addRequest(() => {
                        Communication.setFileMetadata(storyId, state.file.id, data)
                    }, "metadata");
                    return { 
                        ...state, 
                        file: { ...state.file, metadata: data } 
                    }
                }

            case 'setStorage':
                if (state.file && action.data?.key) {
                    let data = { 
                        ...state.file.storage, 
                        [action.data.key]: action.data.value 
                    }
                    state.queue.addRequest(() => {
                        Communication.setFileStorage(storyId, state.file.id, data)
                    }, "storage");
                    return { 
                        ...state, 
                        file: { ...state.file, storage: data } 
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
        viewMode: viewMode,
        file: null,
        queue: new RequestQueue()
    })

    useEffect(() => { dispatch({ type: 'init', data: fileId }) }, [fileId])
    
    return (
        <Context.Provider value={[state, {
            setText: (text) => dispatch({ type: 'setText', data: text }),
            setMetadata: (key, value) => dispatch({ type: 'setMetadata', data: { key: key, value: value } }),
            setStorage: (key, value) => dispatch({ type: 'setStorage', data: { key: key, value: value } })
        }]}>
            { !state.loading && <FileHeader file={state.file}/>}
            { !state.loading && children }
        </Context.Provider>
    )
}

const FileHeader = ({ file }: FileHeaderProps): JSX.Element => {
    let file_title = file?.metadata?.title ?? file?.metadata?.name
    file_title = (file_title ? file_title + " - " : "") + "Story Teller 2"
    let file_description = file?.metadata?.content ?? file?.metadata?.description ?? "Create your own story!"

    return file && (
        <Head>
            <title key="title">{file_title}</title>
            <meta key="description" name="description" content={file_description}/>
            <meta key="og:title" property="og:title" content={file_title}/>
            <meta key="og:description" property="og:description" content={file_description}/>
        </Head>
    )
        
}

export default FileContext
