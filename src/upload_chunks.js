const {Keyspace, DB} = require('./db')
const fs = require('fs/promises')
const mongodb = require('mongodb')

/**
 * @param {[{file: string, height: number, width: number, duration: number}]} chunk_manifest 
 * @param {string} video_id 
 * @param {string} user_id 
 * @returns {Promise<{
            user_id: string,
            video_id: string,
            duration: 5.005,
            chunks: [
                {
                object_id: '7ddef420-5baf-11eb-89dd-44efea16efd3|3529',
                height: 144,
                width: 346,
                start_time: 0,
                end_time: 5.005,
                byte_length: 159794
                }
            ]
        }>}
 */
async function upload_chunks(chunk_manifest, video_id, user_id) {
    /** @type {{
     *  video_id: string,
     *  duration: number,
     *  chunks: [{object_id:string, start_time:number, end_time:number, byte_length:number}]
     * }} 
     */
    var manifest = {
        user_id,
        video_id,
        duration:0,
        chunks: []
    }
    for (const i in chunk_manifest) {
        const chunk = chunk_manifest[i]
        const blob = await fs.readFile(chunk.file)
        const object_id = Keyspace.mk_unique_id()
        const result = await Keyspace.client().execute(
            Keyspace.COMMANDS.INSERT_PUBLIC_OBJECT,
            [user_id, object_id, blob]
        )
        //console.log(result);
        manifest.chunks.push(
            {
                object_id, height: chunk.height, width: chunk.width,
                start_time:manifest.duration,
                end_time:( manifest.duration = chunk.duration ),
                byte_length:blob.byteLength
            }
        )
    }
    return manifest
}

/**
 * 
 * @param {mongodb.ObjectId|string} video_id 
 * @param {144|360|720} _resolution 
 * @param {*} upload_manifest 
 */
async function update_manifest(video_id, _resolution, upload_manifest) {
    const videos_collection = (await DB.mongodb_video_system()).collection('videos')
    const match = {
        _id: mongodb.ObjectId(video_id)
    }
    const update_set = {
        "$set": {}
    }
    update_set["$set"][`stream_manifest.${_resolution}`] = upload_manifest
    const result = await videos_collection.findOneAndUpdate(
        match,
        update_set
    )
    return result
}

module.exports = {upload_chunks, update_manifest}

//unit tests
/*
upload_chunks([
    {
      file: './temp/output0.webm',
      height: 144,
      width: 346,
      duration: 5.005
    }
], '123', '123')
.then((res)=>{
    console.log(res);
})
.catch(err=>{
    console.log(err);
})
*/