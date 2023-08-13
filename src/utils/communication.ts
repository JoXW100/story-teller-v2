import Logger from "./logger"
import { DBResponse, ObjectId } from "types/database"
import { StoryAddResult, StoryDeleteResult, StoryGetAllResult, StoryGetResult, StoryUpdateResult, FileAddCopyResult, FileAddResult, FileConvertResult, FileDeleteFromResult, FileGetManyMetadataResult, FileGetMetadataResult, FileGetResult, FileGetStructureResult, FileMoveResult, FileRenameResult, FileSetPropertyResult } from "types/database/responses"
import { Open5eFetchType } from "types/open5eCompendium"
import { FileType, IFileData, IFileMetadata, IFileStorage } from "types/database/files"
import { IStory } from "types/database/stories"

type FetchMethod = 'GET' | 'PUT' | 'DELETE'
type FetchParams = Record<string, string | number | Object>
export type ServerMode = "maintenance"|"running"|"failed"

export interface Open5eResponse<T> {
    readonly count: number
    readonly next: string | null
    readonly previous: string | null
    readonly results: T[]
}

abstract class Communication {
    private static readonly _databaseRootURL = "/api/database/";
    private static readonly _serverRootURL = "/api/server";
    private static readonly open5eRoot = "https://api.open5e.com/"

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
        return await this.databaseFetch<FileGetResult>('getFile', 'GET', {
            storyId: storyId, 
            fileId: fileId
        })
    }

    public static async getFileStructure(storyId: ObjectId): Promise<DBResponse<FileGetStructureResult>> {
        return await this.databaseFetch<FileGetStructureResult>('getFileStructure', 'GET', {
            storyId: storyId
        })
    }

    public static async getMetadata(fileId: ObjectId): Promise<DBResponse<FileGetMetadataResult>> {
        return await this.databaseFetch<FileGetMetadataResult>('getMetadata', 'GET', {
            fileId: fileId
        })
    }

    public static async getManyMetadata(fileIds: ObjectId[]): Promise<DBResponse<FileGetManyMetadataResult>> {
        return await this.databaseFetch<FileGetManyMetadataResult>('getManyMetadata', 'GET', {
            fileIds: fileIds
        })
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
        return await this.databaseFetch<FileDeleteFromResult>('deleteFile', 'DELETE', {
            storyId: storyId, 
            fileId: fileId 
        })
    }

    public static async convertFile(storyId: ObjectId, fileId: ObjectId, type: FileType): Promise<DBResponse<FileConvertResult>> {
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
        return await this.databaseFetch<FileSetPropertyResult>('setFileMetadata', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            metadata: metadata
        })
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
                let data = await fetch(this.open5eRoot + type + fieldQuery)
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
            let data = await fetch(`${this.open5eRoot}${type}/${id}`)
            let result = await data.json() as T
            return result;
        } catch (error) {
            Logger.throw("communication.open5eFetchOne", error)
            return null
        }
    }
}

export default Communication