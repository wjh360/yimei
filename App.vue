<script>
export default {
	data() {
		return {};
	},
	onLaunch: function () {
		console.log("App Launch");

		// 全局错误处理
		const oldError = console.error;
		console.error = function (...args) {
			// 打印原始错误
			oldError.apply(console, args);

			// 处理特定类型的错误
			const errorStr = args[0]?.toString() || "";
			if (errorStr.includes("unbind download url")) {
				console.log("检测到文件URL绑定错误，尝试重新加载...");
				// 可以在这里添加重试逻辑
			}
		};

		// 配置全局的请求错误处理
		uni.addInterceptor("uploadFile", {
			fail(err) {
				console.error("文件上传失败:", err);
				return err;
			},
		});

		uni.addInterceptor("request", {
			fail(err) {
				console.error("请求失败:", err);
				return err;
			},
		});
		// #ifdef MP-WEIXIN
		// 处理未捕获的Promise错误
		uni.onUnhandledRejection(({ reason, promise }) => {
			console.log("检测到未处理的Promise错误:");
			console.log("错误原因:", reason);

			// 如果是网络请求相关错误，尝试重新连接
			if (reason?.errMsg?.includes("request:fail")) {
				console.log("网络请求失败，请检查网络连接");
			}
		});
		// #endif

		// 监听网络状态变化
		uni.onNetworkStatusChange(function (res) {
			console.log(
				"网络状态变化：",
				res.isConnected ? "已连接" : "未连接"
			);
			if (!res.isConnected) {
				uni.showToast({
					title: "网络连接已断开",
					icon: "none",
				});
			}
		});

		let generateBusinessId = function (prefix = "") {
			const timestamp = Date.now().toString(36);
			const random = Math.random().toString(36).substr(2, 8);
			const suffix = Math.random().toString(36).substr(2, 4);

			return `${prefix}_${timestamp}_${random}_${suffix}`.toUpperCase();
		};
		//创建全局唯一随机标识
		let randomId =
			uni.getStorageSync("randomId") || generateBusinessId("wxghtId_");
		uni.setStorageSync("randomId", randomId);
		console.log("当前全局唯一标识：", randomId);

		uni.getPushClientId({
			success: (res) => {
				const cid = res.cid;
				console.log("客户端推送标识:", cid);
				uni.setStorageSync("cid", cid);
				// 将cid上传到你的后端服务器
				uniCloud.callFunction({
					name: "cId",
					data: {
						clientId: cid,
						// 个人小程序只能获取到匿名ID
						userId: randomId,
					},
					success: (res) => {
						console.log("CID上传成功:", res);
					},
					fail: (err) => {
						console.error("CID上传失败:", err);
					},
				});
			},
			fail: (err) => {
				console.error("获取推送标识失败:", err);
			},
		});
		// 监听推送消息（这就是小程序端的"WebSocket"）
		uni.onPushMessage((res) => {
			// 处理实时数据
			const data = res.data;

			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			let echoData = {};
			try {
				echoData = JSON.parse(data.content);
			} catch (error) {
				console.error("JSON解析失败:", error);
			}
			console.log("收到推送消息:", echoData);
			let that = page && page.$vm;
			if (!that) return;
			switch (data.title) {
				case "修改工作计划":
					uni.$notify({
						message: `${echoData.nickName || "匿名用户"} 修改 ${
							echoData.time
						} 计划`,
					});
					that.clearLoadData && that.clearLoadData(echoData); //收到消息后，处理的数据函数 存在才执行
					break;
				case "用户权限修改":
					uni.$notify({
						message: echoData.message,
					});
					that.clearLoadData && that.clearLoadData(echoData); //收到消息后，处理的数据函数 存在才执行
					break;

				default:
					uni.$notify({
						message: echoData.message,
					});
					break;
			}
		});
	},
	onShow: function () {
		console.log("App Show");
	},
	onHide: function () {
		console.log("App Hide");
	},
	// 全局错误处理
	onError: function (err) {
		console.log("App全局错误:", err);
	},
};
</script>

<style lang="scss">
/* 引入uView主题文件 */
@import "uview-ui/theme.scss";

/* 引入uView基础样式 */
@import "uview-ui/index.scss";

/* 引入全局样式 */
@import "@/static/styles/global.scss";

/* 您的自定义样式 */
body {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
		"Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
		"Helvetica Neue", sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	background-color: $background-color;
	color: $text-color;
}

.page-container {
	min-height: 100vh;
	padding: 20px;
}

.card {
	@include glass-effect;
	@include card-shadow;
	padding: 20px;
	margin-bottom: 20px;
}

.gradient-button {
	background: linear-gradient(
		135deg,
		$primary-color 0%,
		$secondary-color 100%
	);
	color: white;
	border: none;
	padding: 12px 24px;
	border-radius: 25px;
	font-weight: bold;
	transition: all 0.3s ease;

	&:active {
		transform: translateY(2px);
	}
}

.input-field {
	background-color: rgba(241, 245, 249, 0.6);
	border-radius: 12px;
	padding: 12px 16px;
	transition: all 0.3s ease;

	&:hover,
	&:focus {
		background-color: rgba(241, 245, 249, 0.9);
	}
}

.animate-fade-in-up {
	animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
