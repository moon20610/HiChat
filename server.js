var http=require("http");
var fs=require("fs");
var path=require("path");
var httpServer=http.createServer(function(req,res){
	//设置允许跨域的域名，*代表允许任意域名跨域
	res.setHeader("Access-Control-Allow-Origin","*");
	
	//console.log(req.url);
	router(req.url,req,res);
}).listen("9090",function(){
	console.log("服务器已经启动,请访问HiChat");
})

function router(url,req,res){
	console.log(url)
	//先从requrl中获取到后缀名 获取到的后缀名都是.js .css .png这种类型
	var type = path.extname(req.url).slice(1, req.url.length);
	
	if(type=="html"){
		var path1=path.join(__dirname,url);
	}else{
		var path1=path.join(__dirname,"public",type,url);
	}
	//console.log(path1)
	//console.log(path1);
	var file=fs.readFile(path1,function(err,buffer){
		res.end(buffer)
	})
}

var socket=require("socket.io");

io=socket.listen(httpServer);

//创建一个数组用于存放浏览器发送过来的用户名
var arr=[];

var bool=true;

io.on("connection",function(client){
	console.log("WebSocket连接已建立~");
	
	//每次连接上服务器时，先将arr数组发给浏览器
	//让浏览器自行检查nickname
	client.emit("arr",arr);
	
	//统计在线人数：监听浏览器发送过来的nickname
	client.on("nickname",function(data){
		//console.log("服务器从浏览器接收信息~")；

		//将这个不重复昵称存入数组
		arr.push(data);
			
		//将这个昵称添加为该连接的一个属性，用作每个用户的唯一标识
		client.nickname=data;
			
		//此时再将arr数组长度发送给浏览器，即为在线人数
		io.sockets.emit("onlinemsg",arr.length,data);
			
		//console.log("此时是第一个人登陆~",arr.length);
	});
	
	//当有人下线的时候，这个client连接就会断开，此时则需要提示下线信息
	//此时需要监听socket的连接状态
	client.on("disconnect",function(){
		console.log("有用户下线了~")
		console.log(arr);
		//当有用户下线时，向浏览器发送一个系统消息提示用户下线
		//console.log("有用户下线了~");
		arr.map(function(item,index){
			if(item==client.nickname){
				//当有一个用户下线的时候，disconnect事件就会被触发一次
				//此时就将arr数组长度减1，同时将该用户的昵称从数组中删除,
				arr.splice(index,index+1);
			}
		})
		//console.log(arr);
		io.sockets.emit("left",client.nickname,arr.length);
	})
	
	//监听用户发送的聊天消息
	client.on("send",function(data){
		console.log("用户发消息到服务器了");
		
		io.sockets.emit("backmsg",data,client.nickname);
		//client.broadcast.emit("backmsg",data,client.nickname);
	
	})
	
	//监听用户上传的图片
	client.on("img",function(imgurl){
		//将图片和昵称返回给浏览器
		io.sockets.emit("backimg",imgurl,client.nickname);
		console.log(imgurl);
	}) 
	 




})