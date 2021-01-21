const mongodb = require('mongodb')
const { exec } = require('child_process')
const fs = require('fs/promises')
/**
 * @param {string} raw_file_name 
 * @param {mongodb.ObjectId} video_id 
 * @param {'144'|'360'|'720'} _resolution 
 * @returns {Promise<string>}
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

/**
 * @description execute ffprobe on video file
 * @param {string} file - file path
 * @returns {Promise<{
                file: string,
                height: number,
                width: number,
                duration: number
            }>}
 */
function probe(file){
    return new Promise(async (resolve, reject)=>{
        const command = await fs.readFile(`sh/ffprobe.sh`, 'utf8') 
        const childp = exec(command.replace('<file>', file) , (err, res)=>{
            if(err){reject(err); return}
            var manifest = {
                file,
                height: Number(res.match(/height\=.*\n/g)[0].match(/\d\d*/g)[0]),
                width: Number(res.match(/width\=.*\n/g)[0].match(/\d\d*/g)[0]),
                duration: res.match(/DURATION\=.*\n/g)[0].match(/\d\d*/g)
            }
            manifest.duration = Number(manifest.duration[0]*60*60) 
                + Number(manifest.duration[1]*60) 
                + Number( `${manifest.duration[2]}.${manifest.duration[3]}`)
            resolve(manifest)
        })
    })
}
/**
 * @param {string} raw_file_name 
 * @returns {Promise<[{
                file: string,
                height: number,
                width: number,
                duration: number
            }]>}
 */
async function manifest_up(raw_file_name = '') {
    const output_files = (await fs.readdir('./temp')).filter(d=>{
        return /^output.*$/.test(d)
    })
    //sort file assending squence
    output_files.sort()
    var chunks = []
    for(const i in output_files){
        chunks.push(await probe(`./temp/${output_files[i]}`))
    }
    return chunks
}

module.exports = {process_video, manifest_up}

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
/*
manifest_up()
.then((res)=>{console.log(res)})
.catch((e)=>console.log(e))
*/
/*
probe('temp/output0.webm')
.then((res)=>{console.log(res);console.log(Date.now());})
.catch((e)=>console.log(e))
*/
/*
manifest_up()
.then((res)=>{
    console.log(res);
})
.catch((e)=>console.log(e))
*/
