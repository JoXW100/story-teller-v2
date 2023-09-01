import Logger from "./logger"
import { DBResponse, ObjectId } from "types/database"
import { StoryAddResult, StoryDeleteResult, StoryGetAllResult, StoryGetResult, StoryUpdateResult, FileAddCopyResult, FileAddResult, FileConvertResult, FileDeleteFromResult, FileGetManyMetadataResult, FileGetMetadataResult, FileGetResult, FileGetStructureResult, FileMoveResult, FileRenameResult, FileSetPropertyResult, FileMetadataQueryResult } from "types/database/responses"
import { Open5eFetchType } from "types/open5eCompendium"
import { FileType, IFileData, IFileMetadata, IFileStorage } from "types/database/files"
import { IStory } from "types/database/stories"

type FetchMethod = 'GET' | 'PUT' | 'DELETE'
type FetchParams = Record<string, string | number | Object>
export type ServerMode = "maintenance" | "running" | "failed"

export interface Open5eResponse<T> {
    readonly count: number
    readonly next: string | null
    readonly previous: string | null
    readonly results: T[]
}

abstract class Communication {
    private static readonly _databaseRootURL = "/api/database/"
    private static readonly _serverRootURL = "/api/server";
    private static readonly _open5eRootURL = "https://api.open5e.com/"
    private static cache: Record<string, FileMetadataQueryResult>
    private static updateCache: (value: Record<string, FileMetadataQueryResult>) => void

    public static initialize(cache: Record<string, FileMetadataQueryResult>, updateCache: (value: Record<string, FileMetadataQueryResult>) => void): void {
        this.cache = cache ?? {}
        this.updateCache = updateCache
    }

    public static get cachedEntries(): FileMetadataQueryResult[] {
        return Object.values(this.cache)
    }

    public static async isConnected(): Promise<boolean> {
        let res = await this.databaseFetch<boolean>('isConnected', 'GET')
        return res.success && res.result
    }

    public static async debug(): Promise<DBResponse<any>> {
        return await this.databaseFetch<any>('debug', 'PUT')
    }

    public static async getServerMode(): Promise<ServerMode> {
        try {
            let res = await fetch(`${this._serverRootURL}?query=mode`, { method: 'GET' })
            let message = await res.text()
            if (res.status === 200) {
                Logger.log("getServerMode", message)
                return message as ServerMode
            } else {
                Logger.error("getServerMode", message)
                return "failed"
            }
        } catch (error: unknown) {
            Logger.throw("getServerMode", error)
            return "failed"
        }
    }

    public static async getStory(storyId: ObjectId): Promise<DBResponse<StoryGetResult>> {
        return await this.databaseFetch<StoryGetResult>('getStory', 'GET', {
            storyId: storyId
        })
    }

    public static async getAllStories(): Promise<DBResponse<StoryGetAllResult>> {
        return await this.databaseFetch<StoryGetAllResult>('getAllStories', 'GET')
    }

    public static async addStory(name: string, desc: string): Promise<DBResponse<StoryAddResult>> {
        return await this.databaseFetch<StoryAddResult>('addStory', 'PUT', {
            name: name, 
            desc: desc
        })
    }

    public static async deleteStory(storyId: ObjectId): Promise<DBResponse<StoryDeleteResult>> {
        return await this.databaseFetch<StoryDeleteResult>('deleteStory', 'DELETE', {
            storyId: storyId
        })
    }

    public static async updateStory(storyId: ObjectId, update: Partial<IStory>): Promise<DBResponse<StoryUpdateResult>> {
        return await this.databaseFetch<StoryUpdateResult>('updateStory', 'PUT', {
            storyId: storyId,
            update: update
        })
    }

    public static async getFile(storyId: ObjectId, fileId: ObjectId): Promise<DBResponse<FileGetResult>> {
        let result = await this.databaseFetch<FileGetResult>('getFile', 'GET', {
            storyId: storyId, 
            fileId: fileId
        })

        if (result.success) {
            this.cache[String(result.result.id)] = {
                id: result.result.id,
                type: result.result.type,
                metadata: result.result.metadata
            }
        }

        return result
    }

    public static async getFileStructure(storyId: ObjectId): Promise<DBResponse<FileGetStructureResult>> {
        return await this.databaseFetch<FileGetStructureResult>('getFileStructure', 'GET', {
            storyId: storyId
        })
    }

    public static async getMetadata(fileId: ObjectId, allowedTypes: FileType[] = null): Promise<DBResponse<FileGetMetadataResult>> {
        if (this.cache[String(fileId)] && (!allowedTypes || allowedTypes.includes(this.cache[String(fileId)].type))) {
            return { success: true, result: this.cache[String(fileId)] }
        } else if (this.cache[String(fileId)]) {
            return { success: false, result: "Invalid file type" }
        }

        let result = await this.databaseFetch<FileGetMetadataResult>('getMetadata', 'GET', {
            fileId: fileId,
            allowedTypes: allowedTypes
        })

        if (result.success) {
            this.updateCache({ ...this.cache, [String(result.result.id)]: { ...result.result, date: Date.now() } })
        }

        return result
    }

    public static async getManyMetadata(fileIds: ObjectId[], allowedTypes: FileType[] = null): Promise<DBResponse<FileGetManyMetadataResult>> {
        const { rest, invalid } = fileIds.reduce<{ cached: ObjectId[], invalid: ObjectId[], rest: ObjectId[] }>((prev, value) => (
            this.cache[String(value)] && (!allowedTypes || allowedTypes.includes(this.cache[String(value)].type))
            ? { cached: [...prev.cached, value], invalid: prev.invalid, rest: prev.rest }
            : this.cache[String(value)] 
            ? { cached: prev.cached, invalid: [...prev.invalid, value], rest: prev.rest }
            : { cached: prev.cached, invalid: prev.invalid, rest: [...prev.rest, value] }
        ), { cached: [], invalid: [], rest: [] }) 
        

        let cache = this.cache
        if (rest.length > 0) {
            let result = await this.databaseFetch<FileGetManyMetadataResult>('getManyMetadata', 'GET', {
                fileIds: rest,
                allowedTypes: allowedTypes
            })

            if (result.success) {
                let time = Date.now()
                cache = { ...this.cache }
                result.result.forEach(res => (cache[String(res.id)] = { ...res, date: time }))
                this.updateCache(cache)
            } else {
                return result
            }
        }
        
        return { success: true, result: fileIds.map(id => invalid.includes(id) ? null : cache[String(id)] ) }
    }

    public static async addFile(storyId: ObjectId, holderId: ObjectId, name: string, type: FileType): Promise<DBResponse<FileAddResult>> {
        return await this.databaseFetch<FileAddResult>('addFile', 'PUT', {
            storyId: storyId, 
            holderId: holderId,
            name: name, 
            type: type
        })
    }

    public static async addFileFromData<T extends FileType>(storyId: ObjectId, holderId: ObjectId, name: string, type: T, data: Extract<IFileData, { type: T }>["metadata"] ): Promise<DBResponse<FileAddResult>> {
        return await this.databaseFetch<FileAddResult>('addFileFromData', 'PUT', {
            storyId: storyId, 
            holderId: holderId,
            name: name, 
            type: type,
            data: data
        })
    }

    public static async addFileCopy(storyId: ObjectId, holderId: ObjectId, fileId: ObjectId, name: string): Promise<DBResponse<FileAddCopyResult>> {
        return await this.databaseFetch<FileAddCopyResult>('addFileCopy', 'PUT', {
            storyId: storyId, 
            holderId: holderId,
            fileId: fileId,
            name: name
        })
    }

    public static async deleteFile(storyId: ObjectId, fileId: ObjectId): Promise<DBResponse<FileDeleteFromResult>> {
        if (String(fileId) in this.cache) {
            let newCache = { ...this.cache }
            delete newCache[String(fileId)]
            this.updateCache(newCache)
        }

        return await this.databaseFetch<FileDeleteFromResult>('deleteFile', 'DELETE', {
            storyId: storyId, 
            fileId: fileId 
        })
    }

    public static async convertFile(storyId: ObjectId, fileId: ObjectId, type: FileType): Promise<DBResponse<FileConvertResult>> {
        if (String(fileId) in this.cache) {
            this.updateCache({ ...this.cache, [String(fileId)]: { ...this.cache[String(fileId)], type: type, date: Date.now() }})
        }

        return await this.databaseFetch<FileConvertResult>('convertFile', 'PUT', {
            storyId: storyId, 
            fileId: fileId,
            type: type
        })
    }

    public static async setFileText(storyId: ObjectId, fileId: ObjectId, text: string): Promise<DBResponse<FileSetPropertyResult>> {
        return await this.databaseFetch<FileSetPropertyResult>('setFileText', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            text: text
        })
    }

    public static async setFilePublicState(storyId: ObjectId, fileId: ObjectId, state: boolean): Promise<DBResponse<FileSetPropertyResult>> {
        return await this.databaseFetch<FileSetPropertyResult>('setFilePublicState', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            state: state
        })
    }

    public static async renameFile(storyId: ObjectId, fileId: ObjectId, name: string): Promise<DBResponse<FileRenameResult>> {
        return await this.databaseFetch<FileRenameResult>('renameFile', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            name: name
        })
    }

    public static async moveFile(storyId: ObjectId, fileId: ObjectId, targetId: ObjectId): Promise<DBResponse<FileMoveResult>> {
        return await this.databaseFetch<FileMoveResult>('moveFile', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            targetId: targetId
        })
    }

    public static async setFileState(storyId: ObjectId, fileId: ObjectId, state: boolean): Promise<DBResponse<FileSetPropertyResult>> {
        return await this.databaseFetch<FileSetPropertyResult>('setFileState', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            state: state
        })
    }

    public static async setFileMetadata(storyId: ObjectId, fileId: ObjectId, metadata: IFileMetadata): Promise<DBResponse<FileSetPropertyResult>> {
        let response = await this.databaseFetch<FileSetPropertyResult>('setFileMetadata', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            metadata: metadata
        })
        if (response.success && response.result) {
            this.updateCache({ ...this.cache, [String(fileId)]: {
                ...this.cache[String(fileId)],
                metadata: metadata
            }})
        }
        return response
    }

    public static async setFileStorage(storyId: ObjectId, fileId: ObjectId, storage: IFileStorage): Promise<DBResponse<FileSetPropertyResult>> {
        return await this.databaseFetch<FileSetPropertyResult>('setFileStorage', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            storage: storage
        })
    }

    private static async databaseFetch<T>(type: string, method: FetchMethod, params: FetchParams = null): Promise<DBResponse<T>> {
        try {
            let data: Response = null;
            switch (method) {
                case 'PUT':
                    data = await fetch(this._databaseRootURL + type, { 
                        method: method, 
                        body: JSON.stringify(params) 
                    })
                    break
                case 'DELETE':
                case 'GET':
                default:
                    let url: string = Object.keys(params ?? []).reduce((prev, key, index) => (
                        prev + `${index == 0 ? '?' : '&'}${key}=${params[key]}`
                    ), this._databaseRootURL + type)
                    data = await fetch(url, { method: method })
                    break
            }
            return await data.json() as DBResponse<T>
        } catch (error) {
            Logger.throw("communication.databaseFetch", error)
            return { success: false, result: String(error) }
        }
    }

    public static async open5eFetchAll<T>(type: Open5eFetchType, query?: Record<string, string | number>, fields: string[] = []): Promise<Open5eResponse<T>> {
        return new Promise(async (resolve) => {
            try {
                let limit = 5000;
                let filterQuery = query && Object.keys(query).length > 0 
                    ? Object.keys(query).map((key) => `${key}=${query[key]}`).join('&') + `&limit=${limit}`
                    : `limit=${limit}`;
                let fieldQuery = fields.length > 0 
                    ? `/?fields=${fields.join(',')}&${filterQuery}`
                    : `/?${filterQuery}`
                let data = await fetch(this._open5eRootURL + type + fieldQuery)
                resolve(await data.json() as Open5eResponse<T>)
            } catch (error) {
                Logger.throw("communication.open5eFetchAll", error)
                resolve ({
                    count: 0,
                    next: null,
                    previous: null,
                    results: []
                } satisfies Open5eResponse<T>)
            }
        })
    }

    public static async open5eFetchOne<T>(type: Open5eFetchType, id: string): Promise<T | null> {
        try {
            let data = await fetch(`${this._open5eRootURL}${type}/${id}`)
            let result = await data.json() as T
            return result;
        } catch (error) {
            Logger.throw("communication.open5eFetchOne", error)
            return null
        }
    }
}

export default Communication