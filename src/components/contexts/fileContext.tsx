import React, { useEffect, useMemo, useReducer } from 'react'
import Head from 'next/head'
import { ObjectId } from 'types/database'
import RequestQueue from 'utils/data/requestQueue'
import Communication from 'utils/communication'
import Logger from 'utils/logger'
import { getRelativeMetadata } from 'utils/helpers'
import { FileContextDispatch, FileContextDispatchAction, FileContextProvider, FileContextState } from 'types/context/fileContext'
import { FileGetResult } from 'types/database/responses'
import { IParserMetadata } from 'types/elements'

export const Context: React.Context<FileContextProvider> = React.createContext([null, null])

type FileContextProps = React.PropsWithChildren<{
    storyId?: ObjectId,
    fileId: ObjectId,
    viewMode?: boolean
}>

type FileHeaderProps = React.PropsWithoutRef<{
    file: FileGetResult
}>

const fileReducer = (state: FileContextState, action: FileContextDispatchAction): FileContextState => {
    Logger.log("fileContext", action.type);
    switch (action.type) {
        case 'init':
            if (state.fetching)
                return state;
            if (!action.data.file) 
                return { 
                    ...state,
                    loading: false, 
                    fetching: false, 
                    fileSelected: false, 
                    story: action.data.story,
                    file: null,
                    editFilePages: []
                }
            if (action.dispatch) {
                Communication.getFile(action.data.story, action.data.file).then((res) => {
                    action.dispatch({ type: 'initSet', data: res })
                })
            } else {
                Logger.error("fileContext.init", "missing: action.dispatch");
                throw new Error("missing dispatch");
            }
            return { 
                ...state, 
                story: action.data.story,
                fileSelected: Boolean(action.data), 
                fetching: Boolean(action.data) 
            }

        case 'initSet':
            if (action.data.success) {
                let file = action.data.result
                if (file) {
                    file.metadata = file.metadata ? file.metadata : {}
                }
                return {
                    ...state,
                    loading: false, 
                    fetching: false,
                    file: file,
                    editFilePages: []
                }
            } 
            return {
                ...state,
                loading: false, 
                fetching: false,
                file: null,
                editFilePages: []
            }

        case 'setText':
            if (state.file) {
                state.queue.addRequest(() => {
                    Communication.setFileText(state.story, state.file.id, action.data).then((res) => {
                        if (!res.success) {
                            Logger.error("fileContext.setText", res.result);
                        }
                    })
                }, "text");
                return  { 
                    ...state,
                    file: {
                        ...state.file,
                        content: { ...state.file.content, text: action.data },
                    }
                };
            }
            return state;
        
        case 'setMetadata':
            if (state.file && action.data?.key) {
                let data: IParserMetadata = { ...state.file.metadata }
                getRelativeMetadata(data, state.editFilePages)[action.data.key] = action.data.value
                let { $vars, $queries, ...rest} = data;

                state.queue.addRequest(() => {
                    Communication.setFileMetadata(state.story, state.file.id, rest).then((res) => {
                        if (!res.success) {
                            Logger.error("fileContext.setMetadata", res.result);
                        }
                    })
                }, "metadata");
                return { 
                    ...state, 
                    file: { ...state.file, metadata: data } 
                }
            }
            return state

        case 'setStorage':
            if (state.file && action.data?.key) {
                let data = { 
                    ...state.file.storage, 
                    [action.data.key]: action.data.value 
                }
                state.queue.addRequest(() => {
                    Communication.setFileStorage(state.story, state.file.id, data).then((res) => {
                        if (!res.success) {
                            Logger.error("fileContext.setStorage", res.result);
                        }
                    })
                }, "storage");
                return { 
                    ...state, 
                    file: { ...state.file, storage: data } 
                }
            }
            return state

        case 'setViewMode':
            if (state.viewMode != action.data) {
                return { ...state, viewMode: action.data }
            }
            return state
        
        case 'openTemplatePage':
            if (action.data) {
                return { ...state, editFilePages: [...state.editFilePages, action.data ]}
            }
            return state;
            
        case 'closeTemplatePage':
            if (action.data > 0 && state.editFilePages.length - action.data >= 0) {
                return { ...state, editFilePages: state.editFilePages.slice(0, - action.data - 1)}
            }
            return state;

        default:
            return state
    }
}

const FileContext = ({ storyId, fileId, viewMode = false, children }: FileContextProps): JSX.Element => {
    const [state, dispatch] = useReducer(fileReducer, {
        loading: true,
        fetching: false,
        fileSelected: false,
        viewMode: viewMode,
        file: null,
        editFilePages: [],
        story: storyId,
        queue: new RequestQueue()
    })

    useEffect(() => { dispatch({ type: 'init', data: { story: storyId, file: fileId }, dispatch: dispatch }) }, [storyId, fileId])
    useEffect(() => { dispatch({ type: 'setViewMode', data: viewMode }) }, [viewMode])
    
    const memoizedDispatch = useMemo<FileContextDispatch>(() => ({
        setText: (text) => dispatch({ type: 'setText', data: text }),
        setMetadata: (key, value) => dispatch({ type: 'setMetadata', data: { key: key, value: value } }),
        setStorage: (key, value) => dispatch({ type: 'setStorage', data: { key: key, value: value } }),
        openTemplatePage: (page) => dispatch({ type: 'openTemplatePage', data: page }),
        closeTemplatePage: (num = 1) => dispatch({ type: 'closeTemplatePage', data: num })
    }), [dispatch])

    return (
        <Context.Provider value={[state, memoizedDispatch]}>
            { !state.loading && <FileHeader file={state.file}/>}
            { !state.loading && children }
        </Context.Provider>
    )
}

const FileHeader = ({ file }: FileHeaderProps): JSX.Element => {
    let file_title = file?.metadata?.name
    file_title = (file_title ? file_title + " - " : "") + "Story Teller 2"
    let file_description = file?.metadata?.description ?? "Create your own story!"

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
