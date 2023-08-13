
export type Enum = Record<string, string | number | symbol>
export type Collection = Record<string, any>
export type KeysOf<T> = { [K in keyof T]: T[K] | string | {} }
export type KeysOfTwo<T1, T2> = KeysOf<T1> | { [K in Exclude<keyof T2, keyof T1>]: 0 }