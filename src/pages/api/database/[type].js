import { FileType } from "@enums/database";
import Database from "utils/database/database";
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { failure, success } from "utils/database/functions";

export default withApiAuthRequired(async function handler(req, res) {
    const { user } = getSession(req, res);
    const { type, ...params } = req.query;
    const userId = user.sub;

    if (!userId) {
        return res.status(404).json(failure("Could not parse user id"));
    }

    if (!Database.isConnected) {
        let result = await Database.connect();
        if (!result.success) {
            return res.status(400).json(failure("Not connected to database"));
        }
    }

    let body;
    switch (req.method) {
        case 'GET':
            switch (type) {
                case 'isConnected':
                    return res.status(200).json(success(Database.isConnected));

                case 'getAllStories':
                    return res.status(200).json(await Database.stories.getAll(userId));

                case 'getStory':
                    return res.status(200).json(await Database.stories.get(userId, params.storyId));

                case 'getFile':
                    return res.status(200).json(await Database.files.get(userId, params.storyId, params.fileId));
                
                case 'getMetadata':
                    return res.status(200).json(await Database.files.getMetadata(userId, params.storyId, params.fileId));

                case 'getManyMetadata':
                    return res.status(200).json(await Database.files.getManyMetadata(userId, params.storyId, params.fileIds));

                case 'getFileStructure':
                    return res.status(200).json(await Database.files.getStructure(userId, params.storyId));

                default:
                    return res.status(400).json(failure("Missing"));
            }
        case 'PUT':
            body = JSON.parse(req.body)
            switch (type) {
                case 'connect':
                    return res.status(200).json(await success(Database.isConnected));

                case 'addStory':
                    return res.status(200).json(await Database.stories.add(userId, body.name, body.desc));

                case 'updateStory':
                    return res.status(200).json(await Database.stories.update(userId, body.storyId, body.update));
                
                case 'addFile':
                    return res.status(200).json(await Database.files.add(userId, body.storyId, body.holderId, body.type, fileToContent(body)));

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

                default:
                    return res.status(400).json(failure("Missing"));
            }
        case 'DELETE':
            body = JSON.parse(req.body)
            switch (type) {
                case 'deleteStory':
                    return res.status(200).json(await Database.stories.delete(userId, body.storyId));

                case 'deleteFile':
                    return res.status(200).json(await Database.files.delete(userId, body.storyId, body.fileId));

                default:
                    return res.status(400).json(failure("Missing"));
            }
        default:
            return res.status(400).json(failure("Missing"));
    }
});

const fileToContent = (data) => {
    switch (data.type) {
        case FileType.Document:
        case FileType.Creature:
        case FileType.Ability:
            return { name: data.name, text: "", metadata: {} };
        case FileType.Folder:
            return { name: data.name, open: false };
        default:
            return {};
    }
}