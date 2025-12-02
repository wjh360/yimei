export default {
	methods: {
		// 发送消息
		sendMessage(msg) {
			let userInfo = uni.getStorageSync("userInfo") || {};
			msg.nickName = userInfo.nickName || "匿名用户";
			uniCloud.callFunction({
				name: "im",
				data: {
					message: JSON.stringify(msg),
					form: uni.getStorageSync("cid") || "anonymous",
				},
				success: (res) => {
					console.log("消息发送成功:", res);
				},
				fail: (err) => {
					console.error("消息发送失败:", err);
				},
			});
		},
	},
};
