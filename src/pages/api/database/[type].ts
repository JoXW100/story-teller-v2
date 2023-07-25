import Database, { failure, success }  from "utils/database/database";
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from "next";
import { DBContent, FileMetadata, FileType } from "types/database/files";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>): Promise<void> => {
    const { user } = getSession(req, res);
    const { type, ...params } = req.query;
    const userId = user.sub;

    try {
        if (!userId) {
            return res.status(404).json(failure("Could not parse user id"));
        }
    
        if (!Database.isConnected) {
            let result = await Database.connect();
            if (!result.success) {
                return res.status(400).json(failure("Not connected to database"));
            }
        }
    
        switch (req.method) {
            case 'GET':
                switch (type) {
                    case 'isConnected':
                        return res.status(200).json(success(Database.isConnected));
    
                    case 'getAllStories':
                        return res.status(200).json(await Database.stories.getAll(userId));
    
                    case 'getStory':
                        return res.status(200).json(await Database.stories.get(userId, params.storyId as string));
    
                    case 'getFile':
                        return res.status(200).json(await Database.files.get(userId, params.fileId as string));
                    
                    case 'getMetadata':
                        return res.status(200).json(await Database.files.getMetadata(userId, params.fileId as string));
    
                    case 'getManyMetadata':
                        return res.status(200).json(await Database.files.getManyMetadata(userId, params.fileIds as string));
    
                    case 'getFileStructure':
                        return res.status(200).json(await Database.files.getStructure(userId, params.storyId as string));
    
                    default:
                        return res.status(400).json(failure("Missing"));
                }
            case 'PUT':
                var body: Record<string, any> = JSON.parse(req.body)
                switch (type) {
                    case 'connect':
                        return res.status(200).json(await success(Database.isConnected));
    
                    case 'addStory':
                        return res.status(200).json(await Database.stories.add(userId, body.name, body.desc));
    
                    case 'updateStory':
                        return res.status(200).json(await Database.stories.update(userId, body.storyId, body.update));
                    
                    case 'addFile':
                        return res.status(200).json(await Database.files.add(userId, body.storyId, body.holderId, body.type, fileToContent(body)));
    
                    case 'addFileFromData':
                        return res.status(200).json(await Database.files.add(userId, body.storyId, body.holderId, body.type, fileToContent(body, body.data)));

                    case 'addFileCopy':
                        return res.status(200).json(await Database.files.addCopy(userId, body.storyId, body.holderId, body.fileId, body.name));
                        
                    case 'renameFile':
                        return res.status(200).json(await Database.files.rename(userId, body.storyId, body.fileId, body.name));
                    
                    case 'moveFile':
                        return res.status(200).json(await Database.files.move(userId, body.storyId, body.fileId, body.targetId));
    
                    case 'setFileState':
                        return res.status(200).json(await Database.files.setOpenState(userId, body.storyId, body.fileId, body.state));
    
                    case 'setFileText':
                        return res.status(200).json(await Database.files.setText(userId, body.storyId, body.fileId, body.text));
    
                    case 'setFileMetadata':
                        return res.status(200).json(await Database.files.setMetadata(userId, body.storyId, body.fileId, body.metadata));
                    
                    case 'setFileStorage':
                        return res.status(200).json(await Database.files.setStorage(userId, body.storyId, body.fileId, body.storage));
                    
                    default:
                        return res.status(400).json(failure("Missing"));
                }
            case 'DELETE':
                switch (type) {
                    case 'deleteStory':
                        return res.status(200).json(await Database.stories.delete(userId, params.storyId as string));
    
                    case 'deleteFile':
                        return res.status(200).json(await Database.files.delete(userId, params.storyId as string, params.fileId as string));
    
                    default:
                        return res.status(400).json(failure("Missing"));
                }
            default:
                return res.status(400).json(failure("Missing"));
        }
    } catch (error) {
        console.error(error)
        return res.status(400).json(failure(error.message));
    }
}

const fileToContent = (data: Record<string, string>, metadata: FileMetadata = {}): DBContent<FileMetadata, any> => {
    switch (data.type) {
        case FileType.Document:
        case FileType.Creature:
        case FileType.Ability:
        case FileType.Character:
        case FileType.Spell:
        case FileType.Encounter:
            return { name: data.name, text: "", metadata: metadata };
        case FileType.Folder:
            return { name: data.name, open: false };
        default:
            throw new Error("File type not recognized")
    }
}

export default withApiAuthRequired(handler);