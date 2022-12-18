import '@types/data';

/** @typedef {string} ObjectId */
/** @typedef {number} DateValue */

// -------------------------------------------------
// DBFile structures
// -------------------------------------------------

/**
 * @typedef DBStory
 * @property {ObjectId} _id
 * @property {string} _userId
 * @property {string} name
 * @property {string} desc
 * @property {DateValue} dateCreated
 * @property {DateValue} dateUpdated
 */ 

/**
 * @template {DBContent<any>} T
 * @typedef DBFile
 * @property {ObjectId} _id
 * @property {string} _userId
 * @property {ObjectId} _storyId
 * @property {ObjectId?} _holderId
 * @property {import('@enums/database').FileType} type
 * @property {bool} public
 * @property {T} content
 * @property {DateValue} dateCreated
 * @property {DateValue} dateUpdated
 */ 

// -------------------------------------------------
// DBContent structures
// -------------------------------------------------

/**
 * @template {FileMetadata} T
 * @typedef DBContent
 * @property {string} name
 * @property {T} meta
 */

/**
 * @typedef {Object<string, any>} FileMetadata
 */

/**
 * @private
 * @typedef DocumentContent
 * @property {string} text
 * 
 * @typedef DocumentMetadata
 * @property {string} title
 * @property {string} content
 * 
 * @typedef {DBContent<DocumentMetadata> & DocumentContent} DBDocumentContent
 * 
 * @typedef {DBFile<DBDocumentContent>} DBDocumentFile
 */

/**
 * @private
 * @typedef FolderContent
 * @property {boolean} open
 * 
 * @typedef {none} FolderMetadata
 * 
 * @typedef {DBContent<FolderMetadata> & FolderContent} DBFolderContent
 * 
 * @typedef {DBFile<DBFolderContent>} DBFolderFile
 */

/**
 * @typedef Option
 * @property {string} type
 * @property {number?} value
 */

/**
 * @private
 * @typedef CreatureContent
 * @property {string} text
 * 
 * @typedef CreatureMetadata
 * @property {string} name
 * @property {string} description
 * @property {import('@enums/database').CreatureSize} size
 * @property {import('@enums/database').CreatureType} type
 * @property {import('@enums/database').Alignment} alignment
 * @property {string | ObjectId} portrait
 * @property {number} level
 * @property {Option} ac
 * @property {Option} health
 * @property {Option} initiative
 * @property {Speeds} speed 
 * @property {Attributes} attributes
 * 
 * @typedef {DBContent<CreatureMetadata> & CreatureContent} DBCreatureContent
 * 
 * @typedef {DBFile<DBCreatureContent>} DBCreatureFile
 */

/**
 * @private
 * @typedef CharacterContent
 * @property {string} text
 * 
 * @typedef CharacterMetadata
 * @property {string} name
 * @property {string} description
 * @property {import('@enums/database').Alignment} alignment
 * @property {string | ObjectId} portrait
 * @property {number} level
 * @property {Option} ac
 * @property {Option} health
 * @property {Option} initiative
 * @property {Speeds} speed 
 * @property {Attributes} attributes
 * 
 * @typedef {DBContent<CreatureMetadata> & CreatureContent} DBCreatureContent
 * 
 * @typedef {DBFile<DBCreatureContent>} DBCreatureFile
 */

/**
 * @private
 * @typedef AbilityContent
 * @property {string} text
 * 
 * @typedef AbilityMetadata
 * @property {string} name
 * @property {string} type
 * 
 * @typedef {DBContent<AbilityMetadata> & AbilityContent} DBAbilityContent
 * 
 * @typedef {DBFile<DBAbilityContent>} DBAbilityFile
 */

/**
 * @typedef {DBFile<{}>} DBRootFile
 */

/**
 * @template T
 * @typedef DBResponse
 * @property {boolean} success
 * @property {T | DBErrorMessage} result
 */

/**
 * @typedef {string} DBErrorMessage
 */

// -------------------------------------------------
// File structures
// -------------------------------------------------

/**
 * @typedef StoryData
 * @property {ObjectId} id
 * @property {ObjectId} root
 * @property {string} name
 * @property {string} desc
 * @property {DateValue} dateCreated
 * @property {DateValue} dateUpdated
 */ 

/**
 * @template {FileContent} A
 * @template {FileMetadata} B
 * @typedef FileData
 * @property {ObjectId} id
 * @property {string} name
 * @property {import('@enums/database').FileType} type
 * @property {A} content
 * @property {B} metadata
 */

/**
 * @typedef {FileData<DocumentContent, DocumentMetadata>} DocumentFileData
 */

/**
 * @typedef {FileData<FolderContent, FolderMetadata>} FolderFileData
 */

// -------------------------------------------------
// Content structures
// -------------------------------------------------

/**
 * @typedef FileContent
 * @property {string} name
 */

// -------------------------------------------------
// Update structures
// -------------------------------------------------

/**
 * @typedef DBStoryUpdate
 * @property {?string} name
 * @property {?string} desc
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

export const Types = []