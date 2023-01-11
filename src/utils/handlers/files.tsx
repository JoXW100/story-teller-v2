import { useEffect, useState } from "react"
import { DBResponse } from "types/database"
import { FileGetManyMetadataResult, FileMetadata } from "types/database/files"

type ProcessFunction<T extends FileMetadata> = (ids: string[]) => Promise<{ results: FileGetManyMetadataResult<T>, rest: string[] }>

export const useFiles = <T extends FileMetadata>(fileIDs: string[], func: ProcessFunction<T> = null): FileGetManyMetadataResult<T> => {
    const [files, setFiles] = useState<FileGetManyMetadataResult<T>>([])
    useEffect(() => {
        if (fileIDs && fileIDs.length > 0) {
            new Promise(async (resolve) => {
                let { results, rest } = func 
                    ? await func(fileIDs)
                    : { results: [], rest: fileIDs }

                let { resolved, ids } = rest
                    .map((x) => x.trim())
                    .reduce((prev, value) => (
                        files.some((x) => String(x.id) == value)
                        ? { resolved: [...prev.resolved, files.find((file) => String(file.id) === value)], ids: prev.ids }
                        : { ids: [...prev.ids, value], resolved: prev.resolved }
                    ), { resolved: [], ids: [] } as { resolved: FileGetManyMetadataResult, ids: string[] })

                if (ids.length > 0) {
                    let response = await fetch(`/api/database/getManyMetadata?fileIds=${ids}`)
                    let res: DBResponse<FileGetManyMetadataResult> = await response.json()
                    if (res.success) {
                        let values = ids
                            .map((id) => (res.result as FileGetManyMetadataResult)
                            .find((x) => String(x.id) == id))
                        resolve([...results, ...resolved, ...values])
                    } else {
                        console.warn("Failed fetching files", res.result);
                        resolve([...results, ...resolved])
                    }
                }
                resolve([...results, ...resolved])
            })
            .then((res: FileGetManyMetadataResult) => {
                setFiles(res.sort((a,b) => String(a.id).localeCompare(String(b.id))) as any)
            })
            .catch(console.error)
        } else {
            setFiles([])
        }
    }, [fileIDs])

    return files
}

export type {
    ProcessFunction
}