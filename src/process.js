const mongodb = require('mongodb')
const { exec } = require('child_process')
const fs = require('fs/promises')
/**
 * @param {string} raw_file_name 
 * @param {mongodb.ObjectId} video_id 
 * @param {'144'|'360'|'720'} _resolution 
 */
function process_video(raw_file_name, _resolution) {
    return new Promise(async (resolve, rejects)=>{
        const command = await fs.readFile(`sh/ffmpeg_${_resolution}.sh`, 'utf8')
        const childp = exec(command.replace('<raw_file_name>', raw_file_name) , (err, res)=>{
            if(err){rejects(err); return}
            resolve(res)
        })
    })
}

//unit tests
/*
process_video('temp/raw.webm', '144')
.then((res)=>{console.log(res)})
.catch((e)=>console.log(e))
*/
/*
process_video('temp/raw.webm', '360')
.then((res)=>{console.log(res)})
.catch((e)=>console.log(e))
*/
/*
process_video('temp/raw.webm', '720')
.then((res)=>{console.log(res)})
.catch((e)=>console.log(e))
*/