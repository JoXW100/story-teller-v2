
/**
 * @template T
 * @typedef EditorTemplate<T>
 * @property {import('@enums/editor').EditInputType} type
 * @property {T} params
 * @property {[EditorTemplate]} children
 */

/**
 * @typedef GroupTemplateParams
 * @property {string} label 
 * @property {boolean} open
 * @property {boolean} fill 
 */

/**
 * @typedef TextTemplateParams
 * @property {string} label 
 * @property {string} key
 */

/**
 * @typedef TextareaTemplateParams
 * @property {string} label 
 * @property {string} key
 */