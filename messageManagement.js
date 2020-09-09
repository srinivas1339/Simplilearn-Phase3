var mongoClient=require("mongodb").MongoClient;




messagesArr=[];

function postMessage(obj)
{
    //messagesArr.push(obj);
    mongoClient.connect("mongodb://localhost:27017/",{useUnifiedTopology:true},(err,dbHost)=>{
        if(err)
        {
            console.log("Error connecting to the server");
        }
        else
        {
            db=dbHost.db("slDb");
            db.collection("message",(err,coll)=>{
                if(err)
                {
                    console.log("error connecting to the collection");
                }
                else
                {
                    coll.insertOne(obj);
                }
            })
        }
    })

}

function getAllMessages()
{
    return messagesArr;
}

module.exports={postMessage,getAllMessages}