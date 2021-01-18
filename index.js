const {load_video, process_video, manifest_up, Keyspace, DB} = require('./src/index')

const mod = async(_resolution)=>{
    try {
         //find a job, find video of which require processing in respective resolution
        const video = await load_video()
        if(video === null) throw Error("No video Found")
        const {raw_file_name, video_id} = video
        console.log(9, video);
        //raw_file_name is the local path of the raw video file loaded in temp/ dir of project repo
        //video_id is the unique _id of the video, which requires processing

        //start the job, process the raw video file
        const result = await process_video(raw_file_name, _resolution)

        //create manifest of the chunks present in temp dir
        const manifest = await manifest_up()

        console.log(19, manifest);   
    } catch (e) {
        console.log(e);
    }

    //Shut database
    await Keyspace.close()
    await DB.mongodb_client.close()
}

//unit tests
mod('144')
.then(r=>{
    //console.log(r);
})
.catch(r=>{
    console.log(r);
})