const dic = {
    "video/webm":".webm"
}

/**
 * @param {string} mime_type 
 * @type {function(mime_type):string}
 */
module.exports = (mime_type) => dic[mime_type]