const dic = {
    "video/webm":".webm"
}

/**
 * @param {string} mime_type 
 * @type {function(mime_type):string}
 */
module.exports = function (mime_type){
    return dic[mime_type]
}