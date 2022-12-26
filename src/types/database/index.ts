type ObjectId = string | import('mongodb').ObjectId
type UserId = string
type DateValue = number
type ErrorMessage = string

interface DBResponse<T> {
    success: boolean
    result: T | string
}

export type {
    ObjectId,
    UserId,
    DateValue,
    ErrorMessage,
    DBResponse
}