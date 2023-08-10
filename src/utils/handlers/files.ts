import { useEffect, useState } from "react"
import { ObjectId } from "types/database"
import { FileGetManyMetadataResult, FileGetMetadataResult, FileMetadata } from "types/database/files"
import Communication from "utils/communication"
import { arrayUnique, isObjectId } from "utils/helpers"
import Logger from "utils/logger"

type ResolvedIdsCollection<T extends FileMetadata> = { resolved: FileGetManyMetadataResult<T>, ids: string[] }
type ProcessFunction<T extends FileMetadata> = (ids: ObjectId[]) => Promise<{ results: FileGetManyMetadataResult<T>, rest: ObjectId[] }>

export const useFiles = <T extends FileMetadata>(fileIDs?: ObjectId[], func: ProcessFunction<T> = null): [FileGetManyMetadataResult<T>, boolean] => {
    const [state, setState] = useState<[FileGetManyMetadataResult<T>, boolean]>([[], true])
    useEffect(() => {
        if (fileIDs && fileIDs.length > 0) {
            new Promise(async (resolve) => {
                let { results, rest } = func ? await func(fileIDs) : { results: [], rest: fileIDs }
                let { resolved, ids } = rest
                    .map((x) => String(x).trim())
                    .reduce<ResolvedIdsCollection<T>>((prev, value) => (
                        state[0].some((x) => String(x.id) == value)
                        ? { resolved: [...prev.resolved, state[0].find((file) => String(file.id) === value)], ids: prev.ids }
                        : { ids: [...prev.ids, value], resolved: prev.resolved }
                    ), { resolved: [], ids: [] })

                if (ids.length > 0) {
                    let res = await Communication.getManyMetadata(arrayUnique(ids))
                    if (res.success) {
                        let result = res.result
                        let values = ids.map((id) => result.find((x) => String(x.id) == id))
                        resolve([...results, ...resolved, ...values])
                    } else {
                        Logger.warn("useFiles", res.result);
                        resolve([...results, ...resolved])
                    }
                }
                resolve([...results, ...resolved])
            })
            .then((res: FileGetManyMetadataResult<T>) => {
                setState([res.sort((a,b) => String(a.id).localeCompare(String(b.id))), false])
            })
            .catch((e) => Logger.throw("useFiles", e))
        } else {
            setState([[], false])
        }
    }, [fileIDs])

    return state
}

export const useFile = <T extends FileMetadata>(fileID?: ObjectId): [FileGetMetadataResult<T>, boolean] => {
    const [state, setState] = useState<[FileGetMetadataResult<T>, boolean]>([null, true])
    useEffect(() => {
        if (fileID && isObjectId(fileID)) {
            new Promise<FileGetMetadataResult>(async (resolve) => {
                let res = await Communication.getMetadata(fileID)
                if (res.success) {
                    resolve(res.result)
                } else {
                    Logger.warn("useFile", res.result);
                    resolve(null)
                }
            })
            .then((res: FileGetMetadataResult<T>) => {
                setState([res, false])
            })
            .catch((e) => Logger.throw("useFiles", e))
        } else {
            setState([null, false])
        }
    }, [fileID])

    return state
}

export type {
    ProcessFunction
}