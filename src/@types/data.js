// ------------------------------------------
// File templates
// ------------------------------------------

/**
 * @template {string} A
 * @template B
 * @typedef Template
 * @property {A} type
 * @property {B} params
 * @property {[Object<string, any>]?} conditions
 * @property {[EditorTemplate<any>]?} content
 */

/**
 * @template {EditorTemplateParams} T
 * @typedef {Template<import('@enums/data').EditInputType, T>} EditorTemplate
 */

/**
 * @template {any} T
 * @typedef {Template<import('@enums/data').RendererCommand, T>} RendererTemplate
 */

/**
 * @typedef EditorTemplateParams
 * @property {string} label
 */

/**
 * @typedef InputParams
 * @property {string} label
 * @property {string} key
 */

/**
 * @template {string} T
 * @typedef EnumParams
 * @property {string} label
 * @property {string} key
 * @property {string} type
 * @property {T} default
 * 
 * @typedef {EditorTemplate<EditorTemplateParams & EnumParams<any>>} EnumTemplate
 */

/**
 * @template {string} T
 * @typedef SelectionParams
 * @property {string} label
 * @property {string} key
 * @property {string} enum
 * @property {string} type
 * @property {string} inputType
 * @property {T} default
 * 
 * @typedef {EditorTemplate<EditorTemplateParams & SelectionParams<any>>} SelectionTemplate
 */

/**
 * @typedef ListParams
 * @property {string} label
 * @property {string} key
 * @property {string} type
 * @property {any} default
 * 
 * @typedef {EditorTemplate<EditorTemplateParams & ListParams>} ListTemplate
 */

/**
 * @template {string} T
 * @typedef OptionParams
 * @property {string} label
 * @property {string} key
 * @property {string} enum
 * @property {string} type
 * 
 * @typedef {EditorTemplate<EditorTemplateParams & OptionParams<any>>} OptionTemplate
 */

/**
 * @typedef NumberParams
 * @property {string} label
 * @property {string} key
 * @property {bool} allowNegative
 * @property {bool} allowFloat
 * 
 * @typedef {EditorTemplate<EditorTemplateParams & TextareaParams>} NumberParams
 */

/**
 * @typedef {InputParams} GroupParams
 * 
 * @typedef {EditorTemplate<EditorTemplateParams & GroupParams>} GroupTemplate
 */

/**
 * @typedef {InputParams} TextParams
 * 
 * @typedef {EditorTemplate<EditorTemplateParams & TextareaParams>} TextareaTemplate
 */


/**
 * @typedef {InputParams} TextareaParams
 * 
 * @typedef {EditorTemplate<EditorTemplateParams & TextareaParams>} TextareaTemplate
 */

/**
 * @typedef FileTemplate
 * @property {EditorTemplate<any>} editor
 * @property {RendererTemplate<any>} renderer
 */

// ------------------------------------------
// Localization
// ------------------------------------------

/**
 * @typedef TextData
 * @property {string} language
 * @property {string} icon
 * @property {Object.<string, string>} content
 */

/**
 * @typedef {Object.<string, TextData>} LocalizationTextData
 */


// -----------------------------------------
// Creature properties
// -----------------------------------------

/**
 * @typedef Attributes
 * @property {number} str
 * @property {number} dex
 * @property {number} con
 * @property {number} int
 * @property {number} wis
 * @property {number} cha
 */

/**
 * @typedef Speeds
 * @property {number?} walk
 * @property {number?} burrow
 * @property {number?} climb
 * @property {number?} fly
 * @property {number?} hover
 * @property {number?} swim
 */