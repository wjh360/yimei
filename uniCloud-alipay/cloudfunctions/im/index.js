// uniCloud-aliyun/functions/sendMessage/index.js
const uniPush = uniCloud.getPushManager({ appId: "__UNI__2E02F3C" });
// 自动创建集合的辅助函数
async function ensurePushCollections() {
	const collections = ["opendb-push-log", "opendb-device"];
	for (const name of collections) {
		try {
			await db.createCollection(name);
			console.log(`集合 ${name} 创建成功`);
		} catch (e) {
			// 已存在会报错，忽略即可
		}
	}
}
exports.main = async (event, context) => {
	const { form, message, title, to } = event;

	await ensurePushCollections(); // 确保集合存在

	const db = uniCloud.database();
	const collection = db.collection("push-clients");

	if (!to) {
		const res = await collection.get();

		// 获取所有的cleientId
		clients = res.data.map((item) => item.clientId);

		if (clients.includes(form)) {
			// 发送消息 剔除掉自己
			clients.splice(clients.indexOf(form), 1);
		}
	} else {
		clients = to;
	}
	console.log("发送给:", to ? to : "所有人");

	if (!title) {
		await imChangeData(); // 更新到数据库
	} // 否则就是普通的消息通知

	return await uniPush.sendMessage({
		push_clientid: clients, // 前端上传的cid
		title: title || "修改工作计划",
		content: message || "你有新的消息",
		payload: {
			action: "chat",
			data: message || "你有新的消息",
		},
	});
};

async function imChangeData(message) {
	// 更新到数据库
	try {
		//解析message
		const data = JSON.parse(message);
		//链接 im-data 表
		const imData = db.collection("im-data");

		// 获取年月 // 2022-08-01=>2022-08

		const yearMonth = data.time.split("-").slice(0, 2).join("-");

		// 查询是否存在
		const res = await imData
			.where({
				time: data.time,
			})
			.get();
		if (res.data.length === 0) {
			//插入数据
			await imData.add({
				...data,
				updateTime: new Date().getTime(),
				yearMonth,
			});
		} else {
			//更新数据
			await imData
				.where({
					time: data.time,
				})
				.update({
					...data,
					updateTime: new Date().getTime(),
					yearMonth,
				});
		}
	} catch (e) {
		console.log(e);
	}
}
