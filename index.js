const {load_video, process_video, manifest_up, Keyspace, DB, upload_chunks, update_manifest} = require('./src/index')

const mod = async(_resolution)=>{
    try {
         //find a job, find video of which require processing in respective resolution
        const video = await load_video()
        if(video === null) throw Error("No video Found")
        const {raw_file_name, video_id, user_id} = video
        console.log(9, video);
        //raw_file_name is the local path of the raw video file loaded in temp/ dir of project repo
        //video_id is the unique _id of the video, which requires processing

        //start the job, process the raw video file
        const result = await process_video(raw_file_name, _resolution)

        //create manifest of the chunks present in temp dir
        const chunk_manifest = await manifest_up()
        //console.log(19, chunk_manifest, result); 
        
        //upload video sengments as object to DB
        const upload_manifest = await upload_chunks(chunk_manifest, video_id.toString(), user_id.toString())

        //update video document in videos colletion for resolution: _resolution
        await update_manifest(video_id, _resolution, upload_manifest)
        
    } catch (e) {
        console.log(e);
    }

    //Shut database
    await Keyspace.close()
    await DB.mongodb_client.close()
}

module.exports = mod

//unit tests
console.log(Date.now());
mod('144')
.then(r=>{
    //console.log(r);
    console.log(Date.now());
})
.catch(r=>{
    console.log(r);
})