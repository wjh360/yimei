// uniCloud-aliyun/cloudfunctions/wxLogin/index.js
"use strict";

const db = uniCloud.database();
const usersCollection = db.collection("users");

exports.main = async (event, context) => {
	try {
		// 步骤2：在数据库中查找或创建用户
		const userRecord = await usersCollection.get();

		return {
			success: true,
			data: userRecord.data || [],
		};
	} catch (error) {
		return { success: false, errMsg: error.message };
	}
};
