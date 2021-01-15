const mongodb = require('mongodb')
const mongodb_config = require('../manifest/mongodb_config.json')
const os = require('os')

class DB{
    /**
     * @returns {Promise<mongodb.Db>}
     */
    static async mongodb_video_system(){
        if(DB.mongodb_client.isConnected()) return DB.mongodb_client.db(mongodb_config.video_system.name)
        await DB.mongodb_client.connect()
        return DB.mongodb_client.db(mongodb_config.video_system.name)
    }
}
/** @type {mongodb.MongoClient} */
DB.mongodb_client = new mongodb.MongoClient(
    mongodb_config.video_system.uri,
    mongodb_config.video_system.config
);

const cassandra = require('cassandra-driver');
 
const cassandra_client = new cassandra.Client(require('../manifest/cassandra_config.json'));

cassandra_client.on('error', (err)=>console.log(err))
  
class Keyspace{
    static client(){return cassandra_client}
    /**
     * @returns {string} - `${cassandra.types.TimeUuid.now()}|${process.pid}`
     */
    static mk_unique_id(){
        return `${cassandra.types.TimeUuid.now()}|${process.pid}`;
        //return `${os.hostname()}|${os.uptime()}|${process.pid}|${mongodb.ObjectId().toString()}`
    }
    static async close(){
        await cassandra_client.shutdown()
    }
}
Keyspace.COMMANDS = {};
Keyspace.COMMANDS['INSERT_PUBLIC_OBJECT'] = `
    INSERT INTO public_objects ( user_id, id, data) VALUES ( ?, ?, ?)
`;
Keyspace.COMMANDS['GET_PUBLIC_OBJECT'] = `
    SELECT * FROM public_objects WHERE id = ?
`;
Keyspace.COMMANDS['DELETE_PUBLIC_OBJECT'] = (object_ids)=>{
    const list = object_ids.map((v)=>{return `'${v}'`}).join(',')
    return `
        DELETE FROM public_objects WHERE id IN (${list})
    `
}



module.exports = {DB, Keyspace}