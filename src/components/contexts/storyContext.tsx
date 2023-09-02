import React, { useEffect, useMemo, useReducer } from 'react'
import { useRouter } from 'next/router'
import HelpMenu from 'components/storyPage/helpMenu';
import Queue from 'utils/data/queue';
import Communication from 'utils/communication';
import Logger from 'utils/logger';
import Beyond20, { WhisperType } from 'utils/beyond20';
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
    hideRolls: boolean,
    viewMode: boolean
}>

const StoryContext = ({ storyId, fileId, editMode, viewMode, hideRolls, children }: StoryContextProps) => {
    const router = useRouter()
    
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
        helpMenuOpen: false
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

    const provider: StoryContextDispatch = useMemo(() => ({ 
        roll: (collection, method = RollMethod.Normal, source: string) => {
            let result = collection.roll(method, source)
            let event: RollEvent = { result: result, time: Date.now() }
            state.rollHistory.add(event)
            Beyond20.sendRoll(result, hideRolls ? WhisperType.YES : WhisperType.NO)
            dispatch({ type: 'roll', data: event });
        },
        clearRolls: () => dispatch({ type: 'clearRolls', data: null }),
        collapseSidePanel: () => dispatch({ type: 'setSidePanelExpanded', data: false }),
        expandSidePanel: () => dispatch({ type: 'setSidePanelExpanded', data: true })
    }), [state.rollHistory, hideRolls, dispatch])

    return (
        <Context.Provider value={[state, provider]}>
            { !state.loading && state.story && children }
            { state.helpMenuOpen && <HelpMenu/>}
        </Context.Provider>
    )
}

export default StoryContext
