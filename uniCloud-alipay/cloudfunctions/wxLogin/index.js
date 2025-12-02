// uniCloud-aliyun/cloudfunctions/wxLogin/index.js
"use strict";

const db = uniCloud.database();
const usersCollection = db.collection("users");

exports.main = async (event, context) => {
	const { avatarUrl, nickName, cid, openid, session_key } = event;

	//走这个接口 说明就是新用户 需要创建记录

	try {
		let userId, token;
		const now = Date.now();
		// 新用户：创建记录
		userId = generateUserId();
		token = generateToken(openid, userId);

		await usersCollection.add({
			_id: userId,
			openid,
			sessionKey: session_key,
			avatarUrl: avatarUrl || "/static/default-avatar.png",
			nickName: nickName || "微信用户",
			createTime: now,
			lastLoginTime: now,
			token,
			cid,
		});

		// 步骤3：返回用户信息和token
		const userInfo = await usersCollection
			.where({ openid })
			.field({
				_id: true,
				nickName: true,
				avatarUrl: true,
				openid: true,
				lastLoginTime: true,
			})
			.get();

		return {
			success: true,
			userInfo: userInfo.data[0],
			token,
		};
	} catch (error) {
		console.error("登录失败:", error);
		return { success: false, errMsg: error.message };
	}
};

// 生成用户ID
function generateUserId() {
	return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

// 生成Token（可使用uni-id的token生成模块）
function generateToken(openid, userId) {
	// 简单实现，生产环境建议使用更安全的加密方式
	const crypto = require("crypto");
	return crypto
		.createHash("md5")
		.update(openid + userId + Date.now() + "your-secret-key")
		.digest("hex");
}
