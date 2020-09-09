var chatForm=document.getElementById("chatForm");
var chatMessage=document.getElementById("txtChatMessage");
var chatMessagesDiv=document.getElementById("chatMessagesDiv");
var participantsList=document.getElementById("participantsList");

var userObj=Qs.parse(location.search,{ignoreQueryPrefix:true});
console.log("Username",userObj.username);
var username=userObj.username;
var roomName=userObj.roomName;

const socket=io();
socket.emit("joinRoom",{username:username,roomName:roomName});
socket.on("welcomeUser",(msg)=>{
    chatMessage.innerHTML+=msg;
})
socket.on("chatMessage",(obj)=>{
    chatMessagesDiv.scrollTop=chatMessagesDiv.scrollHeight;
    console.log("Inside chat message func",obj);
    formatMessage(obj);
})

socket.on("modifyUserJoinMessage",(obj)=>{
    var paraElement=document.createElement("p");
    var str=obj.username+" "+obj.message;
    var pTextNode=document.createTextNode(str);
    paraElement.appendChild(pTextNode);
    chatMessagesDiv.appendChild(paraElement);


})

socket.on("modifyUsersList",(usersArr)=>{
    participantsList.innerHTML="";
    for(var i=0;i<usersArr.length;i++)
    {
        var liElement=document.createElement("li");
        var user = usersArr[i];
        var liTextNode=document.createTextNode(user);
        liElement.appendChild(liTextNode);
        participantsList.appendChild(liElement);


    }

})

function formatMessage(obj)
{
    var paraElement=document.createElement("p");
    var str=obj.username+" : "+obj.message;
    var pTextNode=document.createTextNode(str);
    paraElement.appendChild(pTextNode);
    chatMessagesDiv.appendChild(paraElement);

    return str;
}

function sendMessageEventHandler()
{
    socket.emit("message",{message:chatMessage.value,username:username,roomName:roomName});
}