var mongoClient=require("mongodb").MongoClient;
var messageObj=require("./messageManagement");

const users=[];
function newUserJoin(id,userName,roomName)
{
    var user={id,userName,roomName};
    users.push(user);
    mongoClient.connect("mongodb://localhost:27017/",{useUnifiedTopology:true},(err,dbHost)=>{
    if(err)
    {
        console.log("Error connecting to server");
    }
    else{
        var db=dbHost.db("slDb");
        db.collection("users",(err,coll)=>{
            if(err)
            {
                console.log("Error connecting to the finding the collection");
            }
            else{

                coll.insertOne(user);
            }
    
        });
    }
    
})

}

function getAllUsers(roomName,returnResult)
{
    mongoClient.connect("mongodb://localhost:27017/",{useUnifiedTopology:true},(err,dbHost)=>{
        if(err)
        {
            console.log("Error connecting to server",err);
        }
        else{
            var db=dbHost.db("slDb");
            db.collection("users",(err,coll)=>{
                if(err)
                {
                    console.log("Error connecting to database and collection",err);
                    returnResult([]);
                }
                else
                {
                    coll.find({roomName:roomName}).toArray((err,dataArr)=>{
                        if(err)
                        {
                            console.log("Error in the find users",err);
                            returnResult([]);

                        }
                        else
                        {
                            console.log("Users in particular room",dataArr);
                            returnResult(dataArr);
                        }
                    });
                }
            });

        }
    })
    
   // var usersByRoom=users.filter(item=> item.roomName == roomName);
    //return usersByRoom;
}

function getUser(id)
{
    mongoClient.connect("mongodb://localhost:27017/",{useUnifiedTopology:true},(err,dbHost)=>{
        if(err)
        {
            console.log("Error connecting to server");
        }
        else{
            var db=dbHost.db("slDb");
            db.collection("users",(err,coll)=>{
                if(err)
                {
                    console.log("Error connecting to the finding the collection");
                }
                else{
    
                    coll.findOne({id:id},(err,res)=>{
                        if(err)
                        {
                            console.log("Cannot find user");
                        }
                        else{
                            console.log("Output of find",res);
                            return res;
                        }
                    })
                }
        
            });
        }
        
    })
    
    


    /*var pos=users.findIndex(item => item.id == id)
    if(pos>=0)
    {
        return users[pos];
    }
    else
    {
        return null;
    }*/


}

function removeUser(socketId,socket)
{
    mongoClient.connect("mongodb://localhost:27017/",{useUnifiedTopology:true},(err,dbHost)=>{
    if(err)
    {
        console.log("Error connecting to server");

    }
    else
    {
        db=dbHost.db("slDb");
        db.collection("users",(err,coll)=>{
            if(err)
            {
                console.log("Error connecting to the collection");
            }
            else
            {
                coll.findOneAndDelete({id:socketId},(err,result)=>{
                    if(err)
                    {
                        console.log("Error during deletion",err);
                    }
                    else{
                        console.log("Deleted doc:",result.value);
                        var tempUser=result.value;
                        var obj={username:tempUser.userName,message:"has left the room",roomName:tempUser.roomName};
                        messageObj.postMessage(obj);
                        socket.to(tempUser.roomName).broadcast.emit("modifyUserJoinMessage",obj);
                        
                        getAllUsers(tempUser.roomName,(p1)=>{
                            if(p1.length == 0)
                            {
                                console.log("Error in retrieving the docs");
                            }
                            else{
                                var userArr=p1.map(item=>item.userName);
                
                                console.log("In romoveUser",userArr);
                                socket.to(tempUser.roomName).broadcast.emit("modifyUsersList",userArr);
                                //io.to(data.roomName).emit("modifyUsersList",userArr);
                            }
                
                        });
                        


                        
                    }
                });
            }

        })
    }
});


}

module.exports={newUserJoin,getAllUsers,getUser,removeUser}