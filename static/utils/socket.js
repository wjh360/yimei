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

//判断登录 没有登录 终止操作 弹窗提示登录
uni.$isLogin = function () {
	if (!uni.getStorageSync("token")) {
		uni.showModal({
			title: "提示",
			content: "登录后才能进行操作",
			showCancel: true,
			confirmText: "去登录",
			cancelText: "再看看",
			success: async (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: "/pages/login/index",
					});
				}
			},
		});
		throw new Error("未登录，操作终止");
	}
};

//上传文件方法
uni.$uploadFile = async function (postData) {
	let fileExt = postData.fileExt || postData.filePath.split(".").pop();

	if (!fileExt || !postData.filePath) return;
	let fileType = postData.fileType || "image";
	try {
		// 上传文件到云存储
		const uploadResult = await uniCloud.uploadFile({
			filePath: postData.filePath,
			cloudPath: `${fileType}/${Date.now()}.${fileExt}`,
			fileType: fileType,
		});

		// 调用云函数获取公开可访问的URL
		const { result } = await uniCloud.callFunction({
			name: "uploadFile",
			data: {
				fileID: uploadResult.fileID,
			},
		});

		if (result.code === 0) {
			console.log("Public URL:", result.data.publicURL);
			postData.success && postData.success(result.data.publicURL);
		} else {
			throw new Error(result.message);
		}
	} catch (error) {
		console.error("Upload failed:", error);
		uni.showToast({
			title: "上传失败，请重试",
			icon: "none",
		});
	}
};

//判断是否拥有某个权限
uni.$pw = function (permission) {
	if (!permission) return false;
	let userInfo = uni.getStorageSync("userInfo");
	return userInfo && userInfo[permission];
};

// 颜色合集
uni.$colors = [
	"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
	"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
	"linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
	"linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
	"linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
	"linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
	"linear-gradient(135deg, #66eaa3 0%, #5c6907 100%)",
	"linear-gradient(135deg, #0b9811 0%, #00f2fe 100%)",
	"linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
	"linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)",
	"linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
	"linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
	"linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
	"linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)",
	"linear-gradient(135deg, #9890e3 0%, #b1f4cf 100%)",
];
