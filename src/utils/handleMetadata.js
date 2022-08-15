import { useEffect, useState } from 'react';

/**
 * 
 * @param {string} storyId 
 * @param {string} fileId 
 * @param {()} callback 
 */
const fetchMetadata = (storyId, fileId, callback) => {
    fetch(`/api/database/getMetadata?storyId=${storyId}&fileId=${fileId}`)
    .then((res) => res.json())
    .then((res) => {
        callback(res)
        if (!res.success)
            throw new Error(res.result)
    })
    .catch(console.error)
}

/**
 * 
 * @returns {[loaded: boolean, metadata: Object<string, any>]}
 */
const useMetadata = (storyId, fileId) => {
    const [state, setState] = useState({
        loaded: false,
        fetching: false,
        file: null
    });
    
    useEffect(() => { 
        if (fileId && !state.fetching) {
            fetchMetadata(storyId, fileId, (res) => {
                setState((state) => ({ 
                    ...state, 
                    loaded: true,
                    fetching: false, 
                    file: res.success ? res.result : null
                }))
            });
            setState((state) => ({ ...state, fetching: true }))
        }
        else if (state.file) {
            setState((state) => ({ ...state, file: null }))
        }
    }, [fileId]);
    
    return [
        state.loaded && !state.fetching,
        state.file?.metadata ?? null
    ]
}

export {
    useMetadata
}