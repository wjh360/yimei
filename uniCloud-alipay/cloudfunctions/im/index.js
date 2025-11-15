// 云函数入口：websocket/index.js
'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const {
		action,
		roomId,
		userId,
		msgList,
		gerenjifen
	} = event; // 前端发过来的 JSON
	const collection = db.collection('message');
	// 处理不同的动作
	let existingRoom = await collection.where({
		roomId
	}).get();

	// //  创建聊天室
	if (action === 'createRoom') {
		// 检查聊天室是否已存在

		console.log(existingRoom.data);
		if (existingRoom.data.length > 0) {
			// 聊天室已存在，加入聊天室
			// 添加用户到已存在的聊天室 的用户列表中 判断是否已存在
			if (!existingRoom.data[0].users.some(user => user.userId === userId)) {
				await collection.doc(existingRoom.data[0]._id).update({
					users: db.command.push({
						userId,
						gerenjifen: 0, // 用户积分
					}),
				});
			}

			//获取当前聊天室的人数

			existingRoom = await collection.where({
				roomId
			}).get();


			return {
				code: 0,
				message: '加入成功',

				data: existingRoom.data[0]
			};
		} else {
			// 创建聊天室
			const result = await collection.add({
				roomId,
				users: [{
					userId,
					gerenjifen: 0, // 用户积分
				}],
				messages: [],
				jifen: 0,
				from: userId,

			});
			//10小时后删除房间
			setTimeout(() => {
				uniCloud.callFunction({
					name: 'im',
					data: {
						action: 'deleteRoom',
						roomId,
					}
				});

			}, 10 * 60 * 60 * 1000); // 10小时 = 10 * 60 * 60 * 1000 毫秒


			return {
				code: 0,
				message: '创建成功',
				data: result
			};
		}

	}



	//离开聊天室
	if (action === 'deleteRoom') {
		// 检查聊天室是否存在
		const existingRoom = await collection.where({
			roomId
		}).get();

		await collection.doc(existingRoom.data[0]._id).remove();
		return {
			code: 0,
			message: '聊天室已删除',
		};
	}


	//获取聊天室信息
	if (action === 'getInfo') {
		// 检查聊天室是否存在
		const existingRoom = await collection.where({
			roomId
		}).get();

		return {
			code: 0,
			message: '查询成功',
			data: existingRoom.data[0]
		};
	}

	//更新聊天室信息
	if (action === 'update') {
		// 检查聊天室是否存在

		const existingRoom = await collection.where({
			roomId
		}).get();


		// 更新个人积分 查找用户users中对应的userId
		const userIndex = existingRoom.data[0].users.findIndex(user => user.userId === userId);
		existingRoom.data[0].users[userIndex].gerenjifen += gerenjifen;

		//循环计算所有的个人积分 相加小于0的部分就是积分池的积分
		let all = 0
		for (let i = 0; i < existingRoom.data[0].users.length; i++) {
			all += existingRoom.data[0].users[i].gerenjifen;
		}
		existingRoom.data[0].jifen = all < 0 ? -all : 0;

		existingRoom.data[0].messages = msgList;

		console.log(msgList);



		await collection.doc(existingRoom.data[0]._id).update({
			users: existingRoom.data[0].users,
			jifen: existingRoom.data[0].jifen,
			messages: existingRoom.data[0].messages,
		});



		const newRoomInfo = await collection.where({
			roomId
		}).get();


		return {
			code: 0,
			message: '更新成功',
			data: newRoomInfo.data[0]
		};
	}

	if (action === 'updateMsg') {

		existingRoom.data[0].messages = msgList;
		if (msgList.length <= 0) {
			//清除积分
			existingRoom.data[0].jifen = 0;
			existingRoom.data[0].users.forEach(user => {
				user.gerenjifen = 0;
			});
		}
		await collection.doc(existingRoom.data[0]._id).update({
			messages: existingRoom.data[0].messages,
			jifen: existingRoom.data[0].jifen,
			users: existingRoom.data[0].users,

		});
		return {
			code: 0,
			message: '更新成功',
		};
	}





};
