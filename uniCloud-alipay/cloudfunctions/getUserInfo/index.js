// uniCloud-aliyun/cloudfunctions/wxLogin/index.js
"use strict";

const db = uniCloud.database();
const usersCollection = db.collection("users");

exports.main = async (event, context) => {
	const { token } = event;

	if (!token) {
		return { success: false, errMsg: "缺少token参数" };
	}

	try {
		// 步骤2：在数据库中查找或创建用户
		const userRecord = await usersCollection.where({ token }).get();

		// 步骤3：返回用户信息和token
		let userInfo = {};

		try {
			userInfo = userRecord.data[0];
		} catch (error) {
			userInfo = null;
		}

		return {
			success: true,
			userInfo,
			token,
		};
	} catch (error) {
		return { success: false, errMsg: error.message };
	}
};
