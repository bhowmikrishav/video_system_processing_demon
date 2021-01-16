const dic = {
    "video/webm":".webm",
    "video/mp4":".mp4",
    "video/MP2T":".ts",
    "video/quicktime":".mov",
    "video/x-msvideo":".avi",
    "video/ogg":".ogg"
}

/**
 * @param {string} mime_type 
 * @type {function(mime_type):string}
 */
module.exports = (mime_type) => dic[mime_type]