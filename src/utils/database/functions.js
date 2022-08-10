import '@types/database'

/**
 * @param {*} value 
 * @returns {DBResponse}
 */
export const success = (value) => {
    return { success: true, result: value }
}

/**
 * @param {* | null} value 
 * @returns {DBResponse}
 */
export const failure = (value = null) => {
    return { success: false, result: value }
}