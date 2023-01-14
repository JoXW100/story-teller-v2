import { DBResponse } from "types/database"
import { StoryGetAllResult } from "types/database/stories"

class Communication {

    public static async isConnected(): Promise<boolean> {
        try {
            let data = await fetch('/api/database/isConnected', { method: 'GET' })
            let res: DBResponse<boolean> = await data.json()
            return res.success && res.result
        } catch (error) {
            console.error("Error in Communication.isConnected", error)
            return false
        }
    }

    public static async getAllStories(): Promise<DBResponse<StoryGetAllResult>> {
        try {
            let data = await fetch('/api/database/getAllStories', { method: 'GET' })
            return await data.json()
        } catch (error) {
            console.error("Error in Communication.getAllStories", error)
            return { success: false, result: String(error) }
        }
    }
}

export default Communication