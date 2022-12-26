import type { ObjectId } from "types/database";

class Navigation 
{
    static storyURL(storyId: ObjectId): URL {
        return new URL(`${location.origin}/story/${storyId}${location.search}`);
    }

    static fileURL(fileId: ObjectId, storyId: ObjectId | null = null): URL {
        var page = 'story'
        if (!storyId) {
            const expr = /\/([A-z]+)\/([^\/\?]+)/i
            var match = expr.exec(location.pathname);
            page = match[1];
            storyId = match[2];
        }
        if (page === "view")
            return new URL(`${location.origin}/${page}/${fileId}`);
        return new URL(`${location.origin}/${page}/${storyId}/${fileId}${location.search}`);
    }
    
    static viewURL(fileId: ObjectId): URL {
        return new URL(`${location.origin}/view/${fileId}`);
    }

    static originURL(): URL {
        return new URL(location.origin);
    }

    static editModeURL(editMode: boolean): URL {
        var split = location.search.split(/[\?,] */)
        split = split.filter(x => x && !/edit= *[^, ]+/.test(x))
        split.push('edit=' + editMode);
        return new URL(location.origin + location.pathname + '?' + split.join(','))
    }

    static settingsURL(): URL {
        return new URL(location.origin + '/settings?return=' + location.pathname + location.search)
    }

    static settingsReturnURL(returnURL: string): URL {
        return new URL(location.origin + returnURL)
    }
}

export default Navigation;