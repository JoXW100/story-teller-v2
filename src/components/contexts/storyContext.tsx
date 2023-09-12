import React, { useEffect, useMemo, useReducer, useRef } from 'react'
import { useRouter } from 'next/router'
import HelpMenu from 'components/storyPage/helpMenu';
import Queue from 'utils/data/queue';
import Communication from 'utils/communication';
import Logger from 'utils/logger';
import Beyond20 from 'utils/beyond20';
import { RollEvent, StoryContextProvider, StoryContextState, StoryContextDispatchAction, StoryContextDispatch } from 'types/context/storyContext';
import { DBResponse, ObjectId } from 'types/database';
import { RollMethod } from 'types/dice';
import { IStoryData } from 'types/database/stories';
;

export const Context: React.Context<StoryContextProvider> = React.createContext([null, null])

type StoryContextProps = React.PropsWithChildren<{
    storyId: ObjectId,
    fileId: ObjectId,
    editMode: boolean,
    viewMode: boolean
}>

const StoryContext = ({ storyId, fileId, editMode, viewMode, children }: StoryContextProps) => {
    const router = useRouter()
    const downloadRef = useRef<HTMLAnchorElement>(null)
    
    const reducer = (state: StoryContextState, action: StoryContextDispatchAction): StoryContextState => {
        Logger.log("storyContext", action.type)
        switch (action.type) {
            case 'init':
                if (viewMode)
                    return { ...state, loading: false, story: {} }
                if (storyId && !state.story) {
                    Communication.getStory(storyId)
                    .then((res: DBResponse<IStoryData>) => {
                        if (!res.success) {
                            throw new Error(res.result as string)
                        }
                        dispatch({ type: 'initSet', data: res })
                    })
                }
                return state
            case 'initSet':
                if (action.data.success && action.data.result) {
                    return { 
                        ...state, 
                        loading: false, 
                        story: action.data.result,
                        fileId: fileId ?? null,
                        editEnabled: editMode
                    }
                }
                router.push('../');
                return state
            case 'setFile': 
                return action.data !== state.fileId 
                    ? { ...state, fileId: action.data ?? null }
                    : state
            case 'setEditMode': 
                return action.data !== state.editEnabled 
                    ? { ...state, editEnabled: action.data }
                    : state
            case 'roll':
                return { ...state }
            case 'clearRolls':
                state.rollHistory.modify((event) => {
                    return { ...event, time: 0 }
                })
                return { ...state }
            case 'setSidePanelExpanded':
                return { ...state, sidePanelExpanded: action.data }
            case 'setLocalFiles':
                return { ...state, localFiles: action.data.files, localFilesHasChanged: action.data.changed }
            case 'saveLocalFiles':
                if (downloadRef.current) {
                    let content = JSON.stringify(state.localFiles)
                    let download = "data:text/json;charset=utf-8," + encodeURIComponent(content)
                    downloadRef.current.setAttribute("href", download)
                    downloadRef.current.setAttribute("download", "backup.localResources")
                    downloadRef.current.click()
                    return { ...state, localFilesHasChanged: false }
                }
                return state
            default:
                return state
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        editEnabled: true,
        sidePanelExpanded: true,
        story: null,
        fileId: null,
        rollHistory: new Queue<RollEvent>(10),
        helpMenuOpen: false,
        localFiles: {},
        localFilesHasChanged: false
    })

    useEffect(() => {
        if (state.loading) {
            dispatch({ type: 'init', data: null })
        } else if (state.fileId !== fileId && state.story) {
            dispatch({ type: 'setFile', data: fileId })
        } else if (state.editEnabled !== editMode && state.story && state.fileId) {
            dispatch({ type: 'setEditMode', data: editMode })
        }
    }, [storyId, fileId, editMode]);

    // Prevent leaving page with unsaved changes
    useEffect(() => {
        if (window) {
            window.onbeforeunload = (e : BeforeUnloadEvent) => {
                if (state.localFilesHasChanged) {
                    e.preventDefault();
                    e.returnValue = "";
                }
            };
        }
        return () => window && (window.onbeforeunload = null);
    }, [state.localFilesHasChanged])

    const provider = useMemo<StoryContextDispatch>(() => ({ 
        roll: (collection, method = RollMethod.Normal, source: string) => {
            let result = collection.roll(method, source)
            let event: RollEvent = { result: result, time: Date.now() }
            state.rollHistory.add(event)
            Beyond20.sendRoll(result)
            dispatch({ type: 'roll', data: event });
        },
        clearRolls: () => dispatch({ type: 'clearRolls', data: null }),
        collapseSidePanel: () => dispatch({ type: 'setSidePanelExpanded', data: false }),
        expandSidePanel: () => dispatch({ type: 'setSidePanelExpanded', data: true }),
        setLocalFiles: (files, localChanged = true) => dispatch({ type: 'setLocalFiles', data: { files: files, changed: localChanged } }),
        saveLocalFiles: () => dispatch({ type: 'saveLocalFiles', data: null })
    }), [state.rollHistory, dispatch])

    return (
        <Context.Provider value={[state, provider]}>
            { !state.loading && state.story && children }
            { state.helpMenuOpen && <HelpMenu/>}
            {<a ref={downloadRef} style={{ display: "none" }}/> }
        </Context.Provider>
    )
}

export default StoryContext
