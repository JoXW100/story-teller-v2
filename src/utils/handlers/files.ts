import { useEffect, useState } from "react"
import Communication from "utils/communication"
import { arrayUnique, isObjectId } from "utils/helpers"
import Logger from "utils/logger"
import { FileType, IFileData, IFileMetadata } from "types/database/files"
import { FileGetManyDataResult, FileGetManyMetadataResult, FileGetMetadataResult } from "types/database/responses"
import { ObjectId, ObjectIdText } from "types/database"

type FilesState<T extends IFileMetadata> = [files: FileGetManyMetadataResult<T>, loading: boolean]
type FilesDataState<T extends IFileData> = [files: FileGetManyDataResult<T>, loading: boolean]
type FileState<T extends IFileMetadata> = [file: FileGetMetadataResult<T>, loading: boolean]
type ProcessFunction<T extends IFileMetadata> = (ids: ObjectIdText[]) => Promise<{ results: FileGetManyMetadataResult<T>, rest: ObjectId[] }>

export const useFiles = <T extends IFileMetadata = IFileMetadata>(fileIDs: ObjectIdText[], allowedTypes?: FileType[], func?: ProcessFunction<T>): FilesState<T> => {
    const [state, setState] = useState<FilesState<T>>([[], true])
    useEffect(() => {
        if (fileIDs && fileIDs.length > 0) {
            new Promise(async (resolve) => {
                let { results, rest } = func ? await func(fileIDs) : { results: [], rest: fileIDs as ObjectId[] }
                if (rest.length > 0) {
                    let res = await Communication.getManyData(arrayUnique(rest), allowedTypes)
                    if (res.success) {
                        let result = res.result
                        let values = rest.map((id) => result.find((x) => String(x?.id) == String(id)))
                        resolve([...results, ...values])
                    } else {
                        Logger.warn("useFiles", res.result);
                        resolve([...results])
                    }
                }
                resolve([...results])
            })
            .then((res: FileGetManyMetadataResult<T>) => {
                setState([res, false])
            })
            .catch((e) => Logger.throw("useFiles", e))
        } else {
            setState([[], false])
        }
    }, [fileIDs])

    return state
}

export const useDataFiles = <T extends IFileData = IFileData>(fileIDs: ObjectId[], allowedTypes?: FileType[]): FilesDataState<T> => {
    const [state, setState] = useState<FilesDataState<T>>([[], true])
    useEffect(() => {
        if (fileIDs && fileIDs.length > 0) {
            new Promise(async (resolve) => {
                let res = await Communication.getManyData(arrayUnique(fileIDs), allowedTypes)
                if (res.success) {
                    let result = res.result
                    let values = fileIDs.map((id) => result.find((x) => String(x?.id) == String(id)))
                    resolve(values)
                } else {
                    Logger.warn("useFiles", res.result);
                }
                resolve([])
            })
            .then((res: FileGetManyDataResult<T>) => {
                setState([res, false])
            })
            .catch((e) => Logger.throw("useFiles", e))
        } else {
            setState([[], false])
        }
    }, [fileIDs])

    return state
}

export const useFile = <T extends IFileMetadata>(fileID?: ObjectId, allowedTypes?: FileType[]): FileState<T> => {
    const [state, setState] = useState<FileState<T>>([null, true])
    useEffect(() => {
        if (fileID && isObjectId(fileID)) {
            new Promise(async (resolve) => {
                let res = await Communication.getMetadata(fileID, allowedTypes)
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