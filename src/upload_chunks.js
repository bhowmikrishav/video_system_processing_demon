const {Keyspace} = require('./db')
const fs = require('fs/promises')

/**
 * @param {[{file: string, height: number, width: number, duration: number}]} chunk_manifest 
 * @param {string} video_id 
 * @param {string} user_id 
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
        console.log(result);
        manifest.chunks.push(
            {
                object_id, height: chunk.height, width: chunk.width,
                start_time:manifest.duration,
                end_time:( manifest.duration += chunk.duration ),
                byte_length:blob.byteLength
            }
        )
    }
    return manifest
}

//unit tests
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