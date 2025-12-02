// uniCloud-aliyun/cloudfunctions/wxLogin/index.js
"use strict";

const db = uniCloud.database();
const usersCollection = db.collection("users");

// 小程序凭证（在微信公众平台获取）
const MP_APPID = "wxd54762cf1d4457f8"; // 替换为你的小程序AppID
const MP_SECRET = "ca134f7662e8f9bfcf6f0505a93e53e9"; // 替换为你的AppSecret

//这个接口用于验证用户的openid，并返回用户信息

exports.main = async (event, context) => {
	const { code } = event;

	if (!code) {
		return { success: false, errMsg: "缺少code参数" };
	}

	try {
		// 步骤1：用code换取openid和session_key
		const res = await uniCloud.httpclient.request(
			"https://api.weixin.qq.com/sns/jscode2session",
			{
				method: "GET",
				data: {
					appid: MP_APPID,
					secret: MP_SECRET,
					js_code: code,
					grant_type: "authorization_code",
				},
				dataType: "json",
			}
		);
		console.log("res:", res);
		if (res.status !== 200 || !res.data.openid) {
			return { success: false, errMsg: "获取openid失败" };
		}

		const { openid, session_key } = res.data;

		// 步骤2：在数据库中查找或创建用户
		const userRecord = await usersCollection.where({ openid }).get();

		// 步骤3：返回用户信息和token
		let userInfo = {};
		let token = null;
		try {
			userInfo = userRecord.data[0];
		} catch (error) {
			userInfo = null;
		}

		return {
			success: true,
			userInfo,
			token,
			openid,
			session_key,
		};
	} catch (error) {
		return { success: false, errMsg: error.message };
	}
};
