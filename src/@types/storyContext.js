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
 * @typedef Story
 * @property {string} id
 * @property {string} root
 * @property {string} name
 * @property {string} desc
 * @property {number} dateCreated
 * @property {number} dateUpdated
 */

/**
 * @typedef StoryContextState
 * @property {boolean} loading
 * @property {?Story} story
 * @property {?string} fileId
 */

/**
 * @typedef {[ context: StoryContextState, dispatch: ContextDispatch ]} StoryContextProvider
 */
