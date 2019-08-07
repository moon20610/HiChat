window.onload = function() {
	var vm = new Vue({
		el: "#HiChat",
		data: {},
		methods: {
			login: function() {
				debugger
				console.log(event)
				var bool = true;

				console.log(arrname.length);
				//对于昵称的要求是：用户设置的昵称必须是唯一不能重复并且不能为空的
				//这样能够避免重名聊天混乱和统计在线人数
				//当用户点击“OK”时，浏览器将用户名发送到服务器端，进行管理
				var nicknamedata = $("#nickname").val();
				//当nickname不为空时，发送给服务器
				if (!nicknamedata) {
					//当用户未输入昵称时
					alert("昵称不能为空");
				} else {
					if (arrname.length > 0) {
						console.log(arrname);
						//当超过1个用户登录时，检查Nick是否重复
						arrname.map(function(item, index) {
							//此时当arrname数组为空的时候，不会执行map方法
							console.log("map");

							//此时检查Nick是否有重复：
							if (item == nicknamedata) {
								console.log(arrname, nicknamedata);
								bool = false;

							}
						})

						if (!bool) {
							console.log(bool);
							//此时Nick有重复
							alert("该昵称已被占用~");
							$("#nickname").focus();
							$("#nickname").val("");
							return false;
						} else {
							//此时没有任何一个nick重复
							socket.emit("nickname", nicknamedata);

							$("#login").css("display", "none");
						}



					} else {
						console.log(arrname);
						//此时第一个用户还没有登录成功，所以arrname.lenght为0
						//不许要验证Nick重复问题：
						socket.emit("nickname", nicknamedata, function() {
							console.log("浏览器发送昵称给服务器~")
						});

						$("#login").css("display", "none");
					}
				}
			}
		}
	})

	//当页面刚刚加载出来的时候,就会向服务器发送websocket连接请求
	//当页面刚刚加载出来,还没有连接成功时,显示"connect to server "
	var arrname = [];

	var bool = true;

	//var socket=io.connect("ws://10.11.1.32:8082")
	var socket=io.connect("ws://localhost:9090")
	//var socket = io.connect("ws://192.168.8.144:9090")

	//	var socket=io.connect("ws://fe80::2179:e296:3d8e:49f%3")

	socket.on("connect", function(e) {
		console.log("浏览器成功连接");

		//当连接成功时,修改#login_text的文本内容，显示#suc
		$("#loginText").html("Your nickname");
		$("#suc").css("display", "block");

		//socket.io在客户端的connect连接事件中貌似没有事件对象
		//console.log(e);

		socket.on("arr", function(data) {
			arrname = data;
		})

		//登录时“OK”的点击事件：
		// $("#login button").click(function(){})




		//监听服务器发送过来的相关上线信息
		socket.on("onlinemsg", function(num, name) {
			//将在线人数数据在相应div中显示
			$(".num").html(num + "  user online");
			//同时在屏幕上显示XXX上线了
			$("#show").append(`<p class="showChild">系统消息: ${name} 上线~</p>`);
			console.log("浏览器接收服务器发过来的信息~");
		})


		socket.on("left", function(leftname, count) {
			//console.log("收到了来自服务器的下线信息~")
			$("#show").append(`<p class="showChild">系统消息: ${leftname} 下线了~</p>`);
			//下线时更新在线人数
			//将在线人数数据在相应div中显示
			$(".num").html(count + "  user online");
		})




		//实现发送消息的功能
		//当用户点击“send”时，
		$(".send").click(function() {
			var msg = $("textarea").val();
			//当用户输入内容不为空时把消息发给服务器
			if (!msg) {
				//此时输入框内容为空
				//让输入框重新获取焦点即可
				//$("textarea")[0].focus();
			} else {
				socket.emit("send", msg);
			}

			//清空输入框
			$("textarea").val("");
		})


		socket.on("backmsg", function(msg, nickname) {
			//插入到屏幕中
			//用户发送的消息用div，系统消息用p

			console.log("浏览器端的onbackmsg被触发了~");

			$("#show").append(`<div class="showChild">${nickname}说: ${msg}</div>`);
		})


	})



	//clear的点击事件：
	$(".clear").click(function() {
		//清空聊天屏幕
		$("#show").html("");
	});

	//image的点击事件：发送上传图片功能：
	$(".sendimage").change(function(event) {

		//此时input[type=file]有一个内置对象files
		//$("input[type=file]")[0].files
		//files[0]表示当前用户上传的文件
		//此时input[type=file].val()也可以获取到当前上传的文件


		//先将图片转换为base64格式字符串
		//先保证用户上传了图片，不能为空
		//console.log($(event.target).val());

		if (!$(event.target).val()) {
			//此时input内容为空：没有上传文件
			//继续让这个input获取到焦点
			$(event.target).focus();
		} else {
			//此时用户已经成功上传了图片
			var read = new FileReader();
			//调用FileReader实例对象read的readAsDataURL()方法将图片转换为base64格式的字符串
			/* 之后我们可以在JavaScript代码中使用FileReader来将图片读取为base64格式的字符串形式进行发送。
			   而base64格式的图片直接可以指定为图片的src，
			   这样就可以将图片用img标签显示在页面了。
			 */
			read.readAsDataURL(event.target.files[0]);
			//console.log(event.target.files[0]) 这个对象时正常存在的
			// console.log(FileReader); FileReader是js的原生对象

			/* 注：FileReader对象的方法都是没有返回值的，需要用事件来监听，获取值 */
			read.onload = function() {
				//read.result 就是这个方法的返回值
				var imgurl = this.result;

				//需要把当前上传的图片消息发送给服务器，
				//服务器再广播给所有用户
				socket.emit("img", imgurl);
			}

		}

	})

	socket.on("backimg", function(imgurl, name) {
		console.log("我要展示图片了~");
		//将图片消息进行展示：
		//此时展示图片不能将图片按照原尺寸进行显示
		//不然可能会导致图片过大，在屏幕显示不全，出错
		//需要进行压缩显示     <img src=${imgurl} alt='我是图片'/>
		//console.log(imgurl);
		$("#show").append(`<div class="imgDiv showChild">${name}:<img src=${imgurl} class="img"/></div>`)

		//此时点击事件的位置：必须放在插入图片元素之后
		//由于发送到屏幕上的图片是处于压缩状态的
		//所以当用户点击图片时，应当将图片放大显示
		$(".img").click(function() {
			console.log("a.click");
			console.log($(event.target));
			/* layer.open({
						type: 1,
						title: false,
	
						
						skin: 'layui-layer-nobg', //没有背景色
						shadeClose: true,
						content: $(event.target)
					}); */

			//相册层
			/* $.getJSON('test/photos.json?v='+new Date, function(json){
				layer.open({
					type:1,
					content:$(".test")
				});
			});*/


		})

	})



	//发送表情功能：
	//当点击emoji时，弹出表情容器
	$(".emoji").click(function() {
		$(".emojiWrap").css("display", "block")
	})


	//改变屏幕个字体颜色功能 
	//当input[type=color]的值改变的时候，
	$("input[type=color]").change(function() {
		var color = $("input[type=color]").val();
		//获取input[type=color]的值，也就是用户选择的颜色
		//将这个颜色设置给#show中的子元素字体的颜色即可
		$("#show").children().css({
			"color": color
		})
	})





}
