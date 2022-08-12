/**
 * @template T
 * @typedef DispatchAction
 * @property {string} type
 * @property {T} data
 */

/**
 * @typedef FileContextDispatch
 * @property {(text: string) => void} setText
 */

/**
 * @typedef FileContextState
 * @property {FileState} state
 * @property {import('@types/database').File<*>} file
 * @property {import('utils/data/requestQueue').default} queue
 */

/**
 * @typedef {[ context: FileContextState, dispatch: FileContextDispatch ]} FileContextProvider
 */
