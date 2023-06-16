type ObjectId = string | import('mongodb').ObjectId
type UserId = string
type DateValue = number
type ErrorMessage = string

type DBResponse<T> = {
    success: true
    result: T
} | {
    success: false
    result: ErrorMessage
}

export type {
    ObjectId,
    UserId,
    DateValue,
    ErrorMessage,
    DBResponse
}