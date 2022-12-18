
class Navigation 
{
    /**
     * @static
     * @param {string} storyId 
     * @returns {URL}
     */
    static StoryURL(storyId) {
        return new URL(`${location.origin}/story/${storyId}${location.search}`);
    }

    /**
     * @static
     * @param {string} fileId 
     * @param {string?} storyId 
     * @returns {URL}
     */
    static FileURL(fileId, storyId = undefined) {
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
    
    /**
     * @static
     * @param {string} fileId 
     * @returns {URL}
     */
    static ViewURL(fileId) {
        return new URL(`${location.origin}/view/${fileId}`);
    }

    /**
     * @static
     * @returns {URL}
     */
    static OriginURL() {
        return new URL(location.origin);
    }

    /**
     * @static
     * @param {boolean} editMode
     * @returns {URL}
     */
    static EditModeURL(editMode) {
        var search = location.search;
        var split = search.split(/[\?,] */)
        split = split.filter(x => x && !/edit= *[^, ]+/.test(x))
        split.push('edit=' + editMode);
        return new URL(location.origin + location.pathname + '?' + split.join(','))
    }

    /**
     * @static
     * @returns {URL}
     */
    static SettingsURL() {
        return new URL(location.origin + '/settings?return=' 
            + location.pathname + location.search)
    }

    /**
     * @static
     * @param {string} returnURL
     * @returns {URL}
     */
     static SettingsReturnURL(returnURL) {
        return new URL(location.origin + returnURL)
    }
}

export default Navigation;