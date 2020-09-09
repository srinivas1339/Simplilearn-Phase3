var express=require("express");
var path=require("path");
var bodyParser=require("body-parser");
var http=require("http");
var socketio=require("socket.io");
var queryString=require("querystring");
var userObj=require("./utils/usersInfo");
var messageObj=require("./utils/messageManagement");
const messageManagement = require("./utils/messageManagement");

const PORT=4000;

var app=express();
const server=http.createServer(app);
var io=socketio(server);

app.use(express.static(path.join(__dirname,"public")))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


app.get("/",(request,response)=>{
    var fileUrl=path.join(__dirname,"public","index.html");
    response.sendFile(fileUrl);
})

app.post("/home",(request,response)=>{
    var username=request.body.username;
    var roomName=request.body.roomName;
    var temp=queryString.stringify({username:username,roomName:roomName});
    response.redirect("/chat?"+temp);
})

app.get("/chat",(request,response)=>{
    var fileUrl=path.join(__dirname,"public","chat.html");
    response.sendFile(fileUrl);
    
})

io.on("connection",(socket)=>{
    socket.on("joinRoom",(data)=>{
        socket.join(data.roomName);
        console.log(data);
        var obj={username:data.username,message:" has joined the room",roomName:data.roomName};
        userObj.newUserJoin(socket.id,data.username,data.roomName);
        messageObj.postMessage(obj);
        socket.emit("welcomeUser","Welcome to the Room");
        
        socket.to(data.roomName).broadcast.emit("modifyUserJoinMessage",obj);
        
        userObj.getAllUsers(data.roomName,(p1)=>{
            if(p1.length == 0)
            {
                console.log("Error in retrieving the docs");
            }
            else{
                var userArr=p1.map(item=>item.userName);

                console.log("In getAllUsers",userArr);
                io.to(data.roomName).emit("modifyUsersList",userArr);
            }

        });
        
    })

    socket.on("disconnect",()=>{
        console.log("User has left the room");
        userObj.removeUser(socket.id,socket);
        
       /*  var tempUser=userObj.getUser(socket.id);
        if(tempUser)
        {
            var deleteFlag=userObj.removeUser(socket.id);
            if(deleteFlag)
            {
                var obj={username:tempUser.userName,message:"has left the room",roomName:tempUser.roomName};
                messageObj.postMessage(obj);
                socket.to(tempUser.roomName).broadcast.emit("modifyUserJoinMessage",obj);
                var userArr=userObj.getAllUsers(tempUser.roomName);
                io.to(tempUser.roomName).emit("modifyUsersList",userArr);
            }
            
        } */
        
    })
    socket.on("message",(obj)=>{
        console.log("Message received",obj);
        messageObj.postMessage(obj);
        io.to(obj.roomName).emit("chatMessage",obj);
        console.log("All messages",messageObj.getAllMessages());
        console.log("All users in the room:");
        


        //socket.emit("chatMessage",obj);
    })

})

server.listen(PORT,(err)=>{
    if(!err)
    {
        console.log(`Server started at PORT ${4000}`);
    }
})