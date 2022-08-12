/**
 * @template T
 * @typedef DispatchAction
 * @property {string} type
 * @property {T} data
 */

/**
 * @typedef StoryContextDispatch
 * @property {(collection: import('utils/data/diceCollection').default) => void} roll
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
 * @property {boolean} editEnabled
 * @property {?Story} story
 * @property {?string} fileId
 * @property {import('utils/data/queue').default} rollHistory
 */

/**
 * @typedef {[ context: StoryContextState, dispatch: StoryContextDispatch ]} StoryContextProvider
 */
