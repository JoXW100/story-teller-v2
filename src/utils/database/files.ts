import { ObjectId, Collection, Db } from "mongodb";
import { failure, success } from "./database";
import Logger from 'utils/logger';
import { FileStructure, FileType, DBContent, FileMetadata, DBFile, FileAddResult, FileGetResult, FileGetMetadataResult, FileGetManyMetadataResult, FileDeleteResult, FileDeleteFromResult, FileRenameResult, FileMoveResult, FileSetPropertyResult, FileGetStructureResult, FileStorage, FileAddCopyResult, FileConvertResult } from "types/database/files";
import { DBResponse } from "types/database";

interface StructureCollection {
    root: FileStructure
    files: Record<string, FileStructure>
}

class FilesInterface
{
    private collection: Collection<DBFile<FileMetadata, FileStorage>>;

    /** Creates a new DBRequestInterface */
    constructor(database: Db) {
        this.collection = database.collection('files');
    }

    /** Adds a file to the database */
    async add(userId: string, storyId: string, holderId: string | null, type: FileType, content: DBContent<any, any>): Promise<DBResponse<FileAddResult>> {
        if (type !== FileType.Folder)
            content.metadata = content.metadata ?? {}
        try {
            let date = Date.now();
            var file: DBFile<FileMetadata> = {
                _userId: userId,
                _storyId: new ObjectId(storyId),
                _holderId: holderId && new ObjectId(holderId),
                type: type,
                content: content,
                dateCreated: date,
                dateUpdated: date
            }
            let result = await this.collection.insertOne(file)
            return success(result.insertedId);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Adds a copy of a file to the database */
    async addCopy(userId: string, storyId: string, holderId: string | null, fileId: string, name: string): Promise<DBResponse<FileAddCopyResult>> {
        try {
            let date = Date.now();
            let result = (await this.collection.aggregate([
                { $match: {
                    _userId: userId,
                    _id: new ObjectId(fileId),
                    _storyId: new ObjectId(storyId)
                }},
                { $addFields: {
                    _holderId: new ObjectId(holderId),
                    'content.name': name,
                    dateCreated: date,
                    dateUpdated: date
                }},
                { $project: { _id: 0 }},
                { $merge: {
                    into: 'files',
                    whenMatched: 'fail',
                    whenNotMatched: 'insert'
                }}
            ]).toArray())[0];
            Logger.log("files.addCopy", result);
            return success(result != null && result != undefined);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Gets a file from the database */
    async get(userId: string, fileId: string): Promise<DBResponse<FileGetResult>> {
        try {
            let result = (await this.collection.aggregate([
                { $match: {
                    $or: [{ _userId: userId }, { 'content.metadata.public': true }],
                    _id: new ObjectId(fileId)
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    name: '$content.name',
                    type: '$type',
                    isOwner: { $eq: ['$_userId', userId] },
                    content: '$content',
                    metadata: { $ifNull: ['$content.metadata', {}] },
                    storage: { $ifNull: ['$content.storage', {}] }
                }},
                { $limit: 1 },
                { $project: { 'content.metadata': 0 }},
            ]).toArray())[0] as FileGetResult;
            Logger.log('files.get', `${result?.name}${result ? '.' + result.type : ''}`);
            return result 
                ? success(result) 
                : failure("Could not find any matching file");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Gets the metadata from a file in the database */
    async getMetadata(userId: string, fileId: string): Promise<DBResponse<FileGetMetadataResult>> {
        try {
            let result = (await this.collection.aggregate([
                { $match: {
                    $or: [ { _userId: userId}, { 'content.metadata.public': true } ],
                    _id: new ObjectId(fileId)
                }},
                { $project: {
                    _id: 0,
                    type: '$type',
                    metadata: '$content.metadata'
                }},
                { $limit: 1 }
            ]).toArray())[0] as FileGetMetadataResult;
            Logger.log('files.getMetadata', fileId);
            return result ? success(result) : failure("Could not find any matching file");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Gets the metadata from a file in the database */
    async getManyMetadata(userId: string, fileIds: string): Promise<DBResponse<FileGetManyMetadataResult>> {
        try {
            var ids = fileIds?.split(',').map(x => new ObjectId(x)) ?? [];
            if (ids.length < 1)
                return failure("No fileId's provided");
            let result = await this.collection.aggregate([
                { $match: {
                    $or: [ { _userId: userId}, { 'content.metadata.public': true } ],
                    _id: { $in: ids }
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    type: '$type',
                    metadata: '$content.metadata'
                }}
            ]).toArray() as FileGetManyMetadataResult;
            Logger.log('files.getManyMetadata', result?.length ?? 0);
            return result
                ? success(result)
                : failure("Could not find any matching file");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Removes a file from the database */
    async delete(userId: string, storyId: string, fileId: string): Promise<DBResponse<FileDeleteResult>> {
        try {
            let result = await this.collection.deleteOne({
                _id: new ObjectId(fileId),
                _userId: userId,
                _storyId: new ObjectId(storyId)
            })
            var x = result.deletedCount === 1;
            Logger.log('files.delete', x ? fileId : 'Null');
            return x ? success(x) : failure("Could not find file to delete");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Removes matching files from the database */
    async deleteFrom(userId: string, storyId: string): Promise<DBResponse<FileDeleteFromResult>> {
        try {
            let result = await this.collection.deleteMany({
                _userId: userId,
                _storyId: new ObjectId(storyId)
            })
            return success(result.deletedCount > 0);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Changes the filename of a file in the database */
    async convert(userId: string, storyId: string, fileId: string, type: FileType): Promise<DBResponse<FileConvertResult>> {
        try {
            if (!Object.values(FileType).includes(type)) {
                Logger.error('files.convert', type);
                return failure(`${type} is not a valid type`);
            }
            let result = await this.collection.updateOne({
                _id: new ObjectId(fileId),
                _userId: userId,
                _storyId: new ObjectId(storyId)       
            }, { 
                $set: {
                    type: type,
                    dateUpdated: Date.now()
                }
            })
            var x = result.modifiedCount === 1;
            Logger.log('files.convert', x ? type : 'Null');
            return x ? success(x) : failure("Could not find file to rename");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Changes the filename of a file in the database */
    async rename(userId: string, storyId: string, fileId: string, name: string): Promise<DBResponse<FileRenameResult>> {
        try {
            let result = await this.collection.updateOne({
                _id: new ObjectId(fileId),
                _userId: userId,
                _storyId: new ObjectId(storyId)       
            }, { 
                $set: {
                    'content.name': name,
                    dateUpdated: Date.now()
                }
            })
            var x = result.modifiedCount === 1;
            Logger.log('files.rename', x ? name : 'Null');
            return x ? success(x) : failure("Could not find file to rename");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Moves a file in the database from one holder to another */
    async move(userId: string, storyId: string, fileId: string, targetId: string): Promise<DBResponse<FileMoveResult>> {
        try {
            await this.collection.aggregate([
                { $match: { 
                    _userId: userId, 
                    _storyId: new ObjectId(storyId),
                    _id: new ObjectId(fileId) 
                } as Partial<DBFile<any>>},
                { $lookup: {
                    from: 'files',
                    pipeline: [
                        { $match: { 
                            _userId: userId,
                            _storyId: new ObjectId(storyId),
                            _id: new ObjectId(targetId)
                        } as Partial<DBFile<any>>},
                        { $limit: 1 }
                    ],
                    as: 'holder' 
                }},
                { $addFields: {
                    _holderId: { $ifNull: [{ $first: '$holder._id' }, '$_holderId']}
                }},
                { $project: { holder: 0 }},
                { $merge: {
                    into: 'files',
                    whenMatched: 'replace',
                    whenNotMatched: 'discard'
                }}
            ]).toArray()
            Logger.log('files.move', `${fileId} -> ${targetId}`);
            return success(true);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Changes a property of a folder in the database */
    private async setProperty(userId: string, storyId: string, fileId: string, property: string, value: any, fileType?: Record<string, any> | FileType, updateDate: boolean = true): Promise<DBResponse<FileSetPropertyResult>> {
        try {
            var set: Partial<DBFile<any>> = { 
                [`content.${property}`]: value,
                dateUpdated: Date.now()
            };
            if (updateDate) 
                set.dateUpdated = Date.now()

            var query: Record<string, any> = { 
                _userId: userId, 
                _storyId: new ObjectId(storyId),
                _id: new ObjectId(fileId)
            }
            
            if (fileType) {
                query.type = fileType
            }

            let result = await this.collection.updateOne(query, { $set: set })
            var x = result.modifiedCount === 1;
            Logger.log('files.setProperty', x ? `${property}: ${String(value).length > 20 ? '...' : value}` : 'Null');
            return x ? success(x) : failure("Could not find file to change state");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Changes the open state of a folder in the database */
    async setOpenState(userId: string, storyId: string, fileId: string, state: boolean): Promise<DBResponse<FileSetPropertyResult>> {
        return this.setProperty(userId, storyId, fileId, 'open', Boolean(state), FileType.Folder, false);
    }

    /** Changes the text content of a file in the database */
    async setText(userId: string, storyId: string, fileId: string, text: string): Promise<DBResponse<FileSetPropertyResult>> {
        return this.setProperty(userId, storyId, fileId, 'text', String(text), { $ne: FileType.Folder});
    }

    /** Changes the metadata of a file in the database */
    async setMetadata(userId: string, storyId: string, fileId: string, metadata: FileMetadata): Promise<DBResponse<FileSetPropertyResult>> {
        if (typeof metadata !== typeof {})
            return failure('Expected type of metadata, object');
        return this.setProperty(userId, storyId, fileId, 'metadata', metadata);
    }

    /** Changes the metadata of a file in the database */
    async setStorage(userId: string, storyId: string, fileId: string, storage: FileStorage): Promise<DBResponse<FileSetPropertyResult>> {
        if (typeof storage !== typeof {})
            return failure('Expected type of storage, object');
        return this.setProperty(userId, storyId, fileId, 'storage', storage);
    }
    
    /** Gets the file structure of story in the database */
    async getStructure(userId: string, storyId: string): Promise<DBResponse<FileGetStructureResult>> {
        try {
            let result = (await this.collection.aggregate([
                { $match: { 
                    _userId: userId,
                    _storyId: new ObjectId(storyId) 
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    holderId: '$_holderId',
                    type: '$type',
                    name: '$content.name',
                    open: '$content.open'
                }}
            ]).toArray()) as FileStructure[]

            let data = result.reduce((acc, value) => (
                value.type === 'root' 
                    ? { root: value, files: acc.files }
                    : { root: acc.root, files: { [String(value.id)]: value, ...acc.files } }
            ), { root: null, files: {} }) as StructureCollection;

            Object.values(data.files).forEach((file) => {
                var holder = data.files[String(file.holderId)] ?? data.root;
                holder.children = [file, ...holder.children ?? []]
            })
            
            Logger.log("files.getStructure", result.length)
            return success(data.root.children ?? []);
        } catch (error) {
            Logger.throw("FilesInterface.getStructure", error)
            return failure(error.message);
        }
    }
}

export default FilesInterface