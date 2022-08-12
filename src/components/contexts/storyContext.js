import React, { useEffect, useReducer } from 'react'
import { useRouter } from 'next/router'
import { RollMethod } from '@enums/data';
import Queue from 'utils/data/queue';
import 'utils/data/queue';
import '@types/storyContext'

/** @type {React.Context<StoryContextProvider>} */
export const Context = React.createContext({})

/**
 * @param {{ storyId: string, fileId: ?string, children: JSX.Element }}
 */
const StoryContext = ({ storyId, fileId, editMode, children }) => {
    const router = useRouter()
    const fetchStory = (storyId) => {
        fetch('/api/database/getStory?storyId=' + storyId)
        .then((res) => res.json())
        .then((res) => {
            if (res.success) {
                dispatch({ type: 'initSet', data: res })
                return;
            }
            throw new Error(res.result)
        })
        .catch((error) => {
            console.error(error);
            dispatch({ type: 'initSet', data: { success: false }})
        })
    }

    /**
     * @param {StoryContextState} state
     * @param {DispatchAction} action
     * @returns {StoryContextState}
     */
    const reducer = (state, action) => {
        switch (action.type) {
            case 'init':
                !state.story && fetchStory(storyId)
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
                return { ...state, fileId: action.data ?? null }
            
            case 'setEditMode': 
                return { ...state, editEnabled: action.data }
                
            case 'roll':
                return { ...state };

            default:
                return state
        }
    }

    /** @type {[state: StoryContextState, dispatch: React.Dispatch<DispatchAction>]} */
    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        editEnabled: true,
        story: null,
        fileId: null,
        rollHistory: new Queue(10)
    })

    useEffect(() => storyId && dispatch({ type: 'init' }), [storyId]);
    useEffect(() => storyId && dispatch({ type: 'setFile', data: fileId }), [fileId]);
    useEffect(() => storyId && dispatch({ type: 'setEditMode', data: editMode }), [editMode]);

    return (
        <Context.Provider value={[state, { 
            roll: (collection, method = RollMethod.Normal) => { 
                state.rollHistory.add({ result: collection.roll(method), time: Date.now() })
                dispatch({ type: 'roll' });
            }
        }]}>
            { !state.loading && state.story && children }
        </Context.Provider>
    )
}

export default StoryContext
