const {DB, Keyspace} = require('./db')
const mongodb = require('mongodb')
const fs = require('fs/promises')
const mime_to_ext = require('./mime_to_ext')

/**
 * @param {'144'|'360'|'720'} _resolution - '144'|'360'|'720'
 * @type {function(_resolution)}
 * @returns {Promise<{
            _id: mongodb.ObjectId,
            title: string,
            upload_time: number,
            upload_id: mongodb.ObjectId,
            stream_manifest: {"144":null, "360":null, "720":null}
        }|null>}
 */
async function load_manifest(_resolution){
    try{
        const videos_collection = (await DB.mongodb_video_system()).collection('videos')
        var match_param = {}, update_param = {}
        match_param[`stream_manifest.${_resolution}`] = null
        update_param['$set'] = {}
        update_param['$set'][`stream_manifest.${_resolution}`] = { expire_at: Date.now()+60_000*60*2 }
        
        const result = await videos_collection.findOneAndUpdate(
            match_param,
            update_param
        )
        return result.value? {
            _id: result.value._id,
            title: result.value.title,
            upload_time: result.value.upload_time,
            upload_id: result.value.upload_id,
            stream_manifest: result.value.stream_manifest
        }:null

    }catch(e){
        throw e
    }
}
/**
 * @param {mongodb.ObjectId|string} video_upload_id - ObjectID of the video file
 * @type {function(video_upload_id)}
 * @returns {Promise<{
        _id: mongodb.ObjectId,
        user_id: string,
        name: string,
        size: number,
        mime_type: string,
        upload_size: number,
        upload_end: boolean,
        chunks: [
            {
                object_id: string,
                slice_start: number,
                size: number
            }
        ]
    }>}
 */
async function load_video_file_manifest(video_upload_id){
    try {
        const videos_collection = (await DB.mongodb_video_system()).collection('video_uploads')

        const result = await videos_collection.findOne(
            {_id:mongodb.ObjectId(video_upload_id)}
        )

        return result

    } catch (e) {
        throw e
    }
}
/**
 * @type {function(video_upload_id)}
 * @param {string} video_upload_id 
 * @returns {Promise<{raw_file_name:string}>}
 */
async function load_video_file(video_upload_id){
    try{
        const temp_files = await fs.readdir("./temp")
        for (const i in temp_files) {
            await fs.unlink("./temp/"+temp_files[i])
        }
    }catch(e){
        console.log(e);
    }
    
    const file_manifest = await load_video_file_manifest(video_upload_id)
    const raw_file_name = "temp/raw"+mime_to_ext(file_manifest.mime_type)
    await fs.writeFile( raw_file_name, Buffer.from(''))
    for(const i in file_manifest.chunks){
        const chunk = file_manifest.chunks[i]
        const result = await Keyspace.client().execute(
            Keyspace.COMMANDS.GET_PUBLIC_OBJECT,
            [chunk.object_id]
        )
        await fs.appendFile(raw_file_name, result.rows[0].data)
        console.log(result.rows[0].data.length)
    }
    await Keyspace.close()
    await DB.mongodb_client.close()
    return {raw_file_name}
}
/**
 * @type {function():Promise<{raw_file_name, video_id: mongodb.ObjectId}>}
 */
async function load_video(){
    const video_id = await load_manifest('144')
    if(video_id === null) return null
    const {raw_file_name} = await load_video_file(video_id.upload_id.toString())
    return {raw_file_name, video_id: video_id._id}
}

module.exports = {load_video}

//unit tests
/*
load_manifest('144')
.then((res)=>{
    console.log(res);
})
.catch(err=>{
    console.log(err);
})
*/
/*
load_video_file_manifest("5fdf0655034dc94dc44c4594")
.then((res)=>{
    console.log(res);
})
.catch(err=>{
    console.log(err);
})
*/
/*
load_video_file("5fdf0655034dc94dc44c4594")
.then((res)=>{
    console.log(res);
})
.catch(err=>{
    console.log(err);
})
*/

load_video()
.then((res)=>{
    console.log(res);
})
.catch(err=>{
    console.log(err);
})

