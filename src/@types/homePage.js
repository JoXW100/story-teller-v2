
/**
 * @typedef StoryCardData
 * @property {import('mongodb').ObjectId} _id
 * @property {string} type
 * @property {string} name
 * @property {string} desc
 * @property {string} author
 * @property {number} dateCreated
 * @property {number} dateUpdated
 */

/**
 * @typedef HomePageState
 * @property {boolean} loading
 * @property {boolean} connected
 * @property {[StoryCardData]} cards
 * @property {PageStatus} status
 */

/** @enum {number} */
export const PageStatus = {
    Loading: 0,
    Select: 1,
    Create: 2,
    Connecting: 3,
    NoConnection: 4
}
