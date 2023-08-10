import type { ObjectId } from "types/database";
import { Open5eFetchType } from "types/open5eCompendium";

abstract class Navigation 
{
    public static storyURL(storyId: ObjectId): URL {
        return new URL(`${location.origin}/story/${storyId}${location.search}`);
    }

    public static fileURL(fileId: ObjectId, storyId: ObjectId | null = null): URL {
        let page = 'story'
        if (!storyId) {
            const expr = /\/([A-z]+)\/([^\/\?]+)/i
            let match = expr.exec(location.pathname);
            page = match[1];
            storyId = match[2];
        }
        if (page === "view")
            return new URL(`${location.origin}/${page}/${fileId}`);
        return new URL(`${location.origin}/${page}/${storyId}/${fileId}${location.search}`);
    }
    
    public static viewURL(fileId: ObjectId): URL {
        return new URL(`${location.origin}/view/${fileId}`);
    }

    public static originURL(): URL {
        return new URL(location.origin);
    }

    public static loginAPI(): string {
        return "/api/auth/login"
    }

    public static logoutAPI(): string {
        return "/api/auth/logout"
    }

    public static editModeURL(editMode: boolean): URL {
        let split = location.search.split(/[\?,] */)
        split = split.filter(x => x && !/edit= *[^, ]+/.test(x))
        split.push('edit=' + editMode);
        return new URL(location.origin + location.pathname + '?' + split.join(','))
    }

    public static settingsURL(): URL {
        return new URL(location.origin + '/settings?return=' + location.pathname + location.search)
    }

    public static settingsReturnURL(returnURL: string): URL {
        return new URL(location.origin + returnURL)
    }

    public static open5eURL(type: Open5eFetchType, itemId: string): URL {
        return new URL(`https://open5e.com/${type}/${itemId}`)
    }
}

export default Navigation;