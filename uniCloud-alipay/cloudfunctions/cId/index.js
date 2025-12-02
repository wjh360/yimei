// uniCloud-aliyun/cloudfunctions/registerClient/index.js
const db = uniCloud.database();

exports.main = async (event, context) => {
	const { clientId, userId } = event;
	//判断是否存在
	const res = await db.collection("push-clients").where({ clientId }).get();
	if (res.data.length > 0) {
		return { success: true };
	}

	// 将cid存储到数据库
	await db.collection("push-clients").add({
		clientId,
		userId: userId || "anonymous", // 个人小程序可能无法获取openid
		createTime: Date.now(),
	});

	return { success: true };
};
