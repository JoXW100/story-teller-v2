import { useEffect, useState } from "react"
import Communication from "utils/communication"
import { arrayUnique, isObjectId } from "utils/helpers"
import Logger from "utils/logger"
import { IFileMetadata } from "types/database/files"
import { FileGetManyMetadataResult, FileGetMetadataResult } from "types/database/responses"
import { ObjectId, ObjectIdText } from "types/database"

type FilesState<T extends IFileMetadata> = [files: FileGetManyMetadataResult<T>, loading: boolean]
type FileState<T extends IFileMetadata> = [file: FileGetMetadataResult<T>, loading: boolean]

type ResolvedIdsCollection<T extends IFileMetadata> = { resolved: FileGetManyMetadataResult<T>, ids: ObjectId[] }
type ProcessFunction<T extends IFileMetadata> = (ids: ObjectIdText[]) => Promise<{ results: FileGetManyMetadataResult<T>, rest: ObjectId[] }>

export const useFiles = <T extends IFileMetadata = IFileMetadata>(fileIDs: ObjectIdText[], func: ProcessFunction<T> = null): FilesState<T> => {
    const [state, setState] = useState<FilesState<T>>([[], true])
    useEffect(() => {
        if (fileIDs && fileIDs.length > 0) {
            new Promise(async (resolve) => {
                let tmp: FileGetMetadataResult<T>
                let { results, rest } = func ? await func(fileIDs) : { results: [], rest: fileIDs as ObjectId[] }
                let { resolved, ids } = rest
                    .reduce<ResolvedIdsCollection<T>>((prev, value) => (
                        (tmp = state[0].find((file) => String(file.id) === String(value)))
                        ? { resolved: [...prev.resolved, tmp], ids: prev.ids }
                        : { ids: [...prev.ids, value], resolved: prev.resolved }
                    ), { resolved: [], ids: [] })

                if (ids.length > 0) {
                    let res = await Communication.getManyMetadata(arrayUnique(ids))
                    if (res.success) {
                        let result = res.result
                        let values = ids.map((id) => result.find((x) => String(x.id) == String(id)))
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

export const useFile = <T extends IFileMetadata>(fileID?: ObjectId): FileState<T> => {
    const [state, setState] = useState<FileState<T>>([null, true])
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