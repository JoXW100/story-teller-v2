import { DBResponse, ObjectId } from "types/database"
import { FileAddCopyResult, FileAddResult, FileDeleteFromResult, FileGetManyMetadataResult, FileGetResult, FileGetStructureResult, FileMetadata, FileMoveResult, FileRenameResult, FileSetPropertyResult, FileStorage, FileType } from "types/database/files"
import { Story, StoryAddResult, StoryDeleteResult, StoryGetAllResult, StoryGetResult, StoryUpdateResult } from "types/database/stories"

type FetchMethod = 'GET' | 'PUT' | 'DELETE'
type FetchParams = Record<string, string | number | Object>
export type Open5eFetchType = "spells" | "monsters"

export interface Open5eResponse<T> {
    readonly count: number
    readonly next: string | null
    readonly previous: string | null
    readonly results: T[]
}

class Communication {
    private static readonly root = "/api/database/";
    private static readonly open5eRoot = "https://api.open5e.com/"

    public static async isConnected(): Promise<boolean> {
        let res = await this.databaseFetch<boolean>('isConnected', 'GET')
        return res.success && res.result
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

    public static async updateStory(storyId: ObjectId, update: Partial<Story>): Promise<DBResponse<StoryUpdateResult>> {
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

    public static async addFileFromData(storyId: ObjectId, holderId: ObjectId, name: string, type: FileType, data: FileMetadata): Promise<DBResponse<FileAddResult>> {
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

    public static async setFileText(storyId: ObjectId, fileId: ObjectId, text: string): Promise<DBResponse<FileSetPropertyResult>> {
        return await this.databaseFetch<FileSetPropertyResult>('setFileText', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            text: text
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

    public static async setFileMetadata(storyId: ObjectId, fileId: ObjectId, metadata: FileMetadata): Promise<DBResponse<FileSetPropertyResult>> {
        return await this.databaseFetch<FileSetPropertyResult>('setFileMetadata', 'PUT', {
            storyId: storyId,
            fileId: fileId,
            metadata: metadata
        })
    }

    public static async setFileStorage(storyId: ObjectId, fileId: ObjectId, storage: FileStorage): Promise<DBResponse<FileSetPropertyResult>> {
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
                case 'DELETE':
                    data = await fetch(this.root + type, { 
                        method: method, 
                        body: JSON.stringify(params) 
                    })
                    break
                case 'GET':
                default:
                    let url: string = Object.keys(params ?? []).reduce((prev, key, index) => (
                        prev + `${index == 0 ? '?' : '&'}${key}=${params[key]}`
                    ), this.root + type)
                    data = await fetch(url, { method: method })
                    break
            }
            return await data.json() as DBResponse<T>
        } catch (error) {
            console.error("Error in Communication." + type, params, error)
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
                console.error("Error in Communication.open5eFetchAll/" + type, query, fields, error)
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
            console.error("Error in Communication.open5eFetchOne/" + type, id, error)
            return null
        }
    }
}

export default Communication