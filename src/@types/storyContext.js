/**
 * @template T
 * @typedef DispatchAction
 * @property {string} type
 * @property {T} data
 */

/**
 * @typedef StoryContextDispatch
 * @property {(
 *      collection: import('utils/data/diceCollection').default, 
 *      method: import('@enums/data').RollMethod
 *  ) => void} roll
 * @property {() => void} openHelpMenu
 * @property {() => void} closeHelpMenu
 */

/**
 * @typedef StoryContextState
 * @property {boolean} loading
 * @property {boolean} editEnabled
 * @property {boolean} filePublished
 * @property {?import('@types/database').StoryData} story
 * @property {?ObjectId} fileId
 * @property {import('utils/data/queue').default} rollHistory
 */

/**
 * @typedef {[ context: StoryContextState, dispatch: StoryContextDispatch ]} StoryContextProvider
 */
