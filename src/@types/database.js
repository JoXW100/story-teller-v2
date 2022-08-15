
/**
 * @typedef {string} ObjectId
 */

/**
 * @template T
 * @typedef DBResponse
 * @property {boolean} success
 * @property {T} result
 */


/**
 * @typedef DBStory
 * @property {ObjectId} _id
 * @property {string} name
 * @property {string} desc
 * @property {number} dateCreated
 * @property {number} dateUpdated
 */ 

/**
 * @typedef DBStoryUpdate
 * @property {?string} name
 * @property {?string} desc
 */

/**
 * @template T
 * @typedef DBFile
 * @property {ObjectId} _id
 * @property {ObjectId} _storyId
 * @property {ObjectId} _holderId
 * @property {import('@enums/database').FileType} type
 * @property {T} content
 * @property {number} dateCreated
 * @property {number} dateUpdated
 */

/**
 * @typedef DBDocumentContent
 * @property {string} name
 * @property {string} text
 * @property {Object<string,any>} meta
 */

/**
 * @typedef DBFolderContent
 * @property {string} name
 */

/**
 * @typedef StructureFile
 * @property {string} id
 * @property {string} holderId
 * @property {import('@enums/database').FileType} type
 * @property {string} name
 * @property {bool} open
 * @property {?[StructureFile]} children
 */

/**
 * @template T
 * @typedef File<T>
 * @property {ObjectId} id
 * @property {import('@enums/database').FileType} type
 * @property {string} name
 * @property {T} content
 */

