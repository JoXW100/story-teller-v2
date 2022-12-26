import React, { useEffect, useReducer } from 'react'
import { useRouter } from 'next/router'
import { RollEvent, RollMethod } from 'types/dice';
import Queue from 'utils/data/queue';
import HelpMenu from 'components/storyPage/helpMenu';
import { StoryData, StoryContextProvider, StoryContextState } from 'types/context/storyContext';
import { DBResponse, ObjectId } from 'types/database';
import { DispatchAction } from 'types/context';

export const Context: React.Context<StoryContextProvider> = React.createContext([null, null])

type StoryContextProps = React.PropsWithChildren<{
    storyId: ObjectId,
    fileId: ObjectId,
    editMode: boolean,
    viewMode: boolean
}>

const StoryContext = ({ storyId, fileId, editMode, viewMode, children }: StoryContextProps) => {
    const router = useRouter()
    
    const fetchStory = (storyId: ObjectId) => {
        fetch('/api/database/getStory?storyId=' + storyId)
        .then((res) => res.json())
        .then((res: DBResponse<StoryData>) => {
            if (!res.success) {
                throw new Error(res.result as string)
            }
            dispatch({ type: 'initSet', data: res })
        })
        .catch((error) => {
            console.error(error);
            dispatch({ type: 'initSet', data: { success: false }})
        })
    }
    
    const reducer = (state: StoryContextState, action: DispatchAction<any>) => {
        switch (action.type) {
            case 'init':
                if (viewMode)
                    return { ...state, loading: false, story: {} }
                storyId && !state.story && fetchStory(storyId)
                return state; 

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
                state.rollHistory.add(action.data)
                return { ...state };

            case 'clearRolls':
                state.rollHistory.modify((event) => {
                    return { ...event, time: 0 }
                })
                return { ...state };
            
            case 'setHelpOpen':
                return state.helpMenuOpen == action.data 
                    ? state
                    : { ...state, helpMenuOpen: action.data }

            default:
                return state
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        editEnabled: true,
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
        }else if (state.editEnabled !== editMode && state.story && state.fileId) {
            dispatch({ type: 'setEditMode', data: editMode })
        }
    }, [storyId, fileId, editMode]);

    return (
        <Context.Provider value={[state, { 
            roll: (collection, method = RollMethod.Normal) => {
                let event: RollEvent = { result: collection.roll(method), time: Date.now() }
                dispatch({ type: 'roll', data: event });
            },
            openHelpMenu: () => dispatch({ type: 'setHelpOpen', data: true }),
            closeHelpMenu: () => dispatch({ type: 'setHelpOpen', data: false }),
            clearRolls: () => dispatch({ type: 'clearRolls', data: null }),
        }]}>
            { !state.loading && state.story && children }
            { state.helpMenuOpen && <HelpMenu/>}
        </Context.Provider>
    )
}

export default StoryContext
