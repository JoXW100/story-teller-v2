/**
 * @template T
 * @typedef DispatchAction
 * @property {string} type
 * @property {T} data
 */

/**
 * @typedef ContextDispatch
 * @property {() => void} init
 */

/**
 * @typedef AppContextState
 * @property {boolean} loading
 */

/**
 * @typedef {[ data: AppContextState, dispatch: ContextDispatch ]} AppContextProvider
 */
