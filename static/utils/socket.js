// 挂载u-notify快捷方法
uni.$notify = function (options = {}) {
	let base = {
		type: "primary",
		color: "#000",
		bgColor: "rgb(255 255 255 / 60%)",
		message: "Hi uView",
		duration: 1000 * 2,
		fontSize: 14,
		safeAreaInsetTop: true,
	};
	const pages = getCurrentPages();
	const page = pages[pages.length - 1];
	let uNotify = page && page.$vm && page.$vm.$refs.uNotify;
	if (uNotify) {
		try {
			uNotify.close();
		} catch (e) {
			console.log(e);
		}
		uNotify.show({ ...base, ...options });
	}
};

// 发送消息
uni.$sendMessage = function (msg, title) {
	let userInfo = uni.getStorageSync("userInfo") || {};
	msg.nickName = userInfo.nickName || "匿名用户";
	uniCloud.callFunction({
		name: "im",
		data: {
			message: JSON.stringify(msg),
			form: uni.getStorageSync("cid") || "anonymous",
			title,
			to: msg.to, // 发送给谁  不传则广播
		},
		success: (res) => {
			console.log("消息发送成功:", res);
		},
		fail: (err) => {
			console.error("消息发送失败:", err);
		},
	});
};
