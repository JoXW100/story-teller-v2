
/**
 * @typedef CreateFileResponse
 * @property {InputType} type
 * @property {*} data
 */

/**
 * @typedef {(response: CreateFileResponse) => void} CreateFileCallback
 */

/** @enum {string} */
export const InputType = {
    File: "file",
    Upload: "upload",
    Folder: "folder"
}