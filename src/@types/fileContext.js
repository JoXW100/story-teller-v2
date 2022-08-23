import '@types/database';

/**
 * @template T
 * @typedef DispatchAction
 * @property {string} type
 * @property {T} data
 */

/**
 * @typedef FileContextDispatch
 * @property {(text: string) => void} setText
 * @property {(key: string, value: any) => void} setMetadata
 */

/**
 * @typedef FileContextState
 * @property {boolean} loading
 * @property {boolean} fetching
 * @property {boolean} fileSelected
 * @property {import('@types/database').FileData<any, any>} file
 * @property {import('utils/data/requestQueue').default} queue
 */

/**
 * @typedef {[ context: FileContextState, dispatch: FileContextDispatch ]} FileContextProvider
 */
