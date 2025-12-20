<template>
	<view class="login-container">
		<view class="overlay"></view>
		<view class="content">
			<view class="logo-section">
				<view class="logo-container">
					<image :src="baseImg" mode="aspectFit" class="logo"></image>
				</view>
				<text class="app-name">卿呀</text>
			</view>

			<view class="login-section" :class="{ 'form-visible': showForm }">
				<view class="login-card" v-if="!showForm">
					<!-- <view class="welcome-text">欢迎使用</view> -->
					<view class="login-btn" @click="handleLogin">
						<text>快捷登录</text>
					</view>
				</view>

				<!-- 用户信息表单（初始隐藏） -->
				<view class="user-form" v-if="showForm">
					<view class="form-title">完善个人信息</view>
					<view class="avatar-section">
						<button
							class="avatar-btn"
							open-type="chooseAvatar"
							@chooseavatar="onChooseAvatar"
						>
							<image
								:src="avatarUrl || baseImg"
								mode="aspectFill"
								class="avatar-image"
							/>
							<text class="avatar-hint">点击选择头像</text>
						</button>
					</view>
					<view class="input-section">
						<input
							class="nickname-input"
							type="nickname"
							v-model="nickName"
							placeholder="请输入昵称"
						/>
					</view>
					<view class="submit-btn" @click="submitLogin"
						>确认登录</view
					>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
// pages/login/login.vue
export default {
	data() {
		return {
			showForm: false,
			avatarUrl: "",
			nickName: "",
			code: "",
			openid: "",
			session_key: "",
			baseImg:
				"https://env-00jxtjtj8hsd.normal.cloudstatic.cn/c8656bb3-c4b7-4b0b-ae03-366577e1af35.png",
		};
	},
	onShow() {
		// 检查是否已经登录
		const token = uni.getStorageSync("token");
		if (token) {
			uni.redirectTo({
				url: "/pages/home/home",
			});
		}
	},
	methods: {
		// 点击登录按钮
		async handleLogin() {
			// 步骤1：获取微信登录凭证code
			const loginRes = await uni.login({
				provider: "weixin",
			});
			console.log("登录凭证：", loginRes[1]);
			let data = loginRes[1] || {};

			if (data.errMsg !== "login:ok") {
				uni.showToast({ title: "登录失败", icon: "none" });
				return;
			}
			uni.showLoading({ title: "登录中..." });
			const userData = await uniCloud.callFunction({
				name: "checkOppenId",
				data: { code: data.code },
			});
			let userInfo = userData.result.userInfo;
			if (userInfo) {
				uni.hideLoading();
				// 判断用户是否已经绑定微信
				uni.setStorageSync("userInfo", userInfo);
				uni.setStorageSync("token", userInfo.token);

				console.log("user ", userInfo.cid);
				console.log("cur ", uni.getStorageSync("cid"));
				//userInfo.cid 转为数组
				let cidArr = userInfo.cid.split(",");
				let currCid = uni.getStorageSync("cid");
				//判断当前用户是否已经存在
				if (cidArr.indexOf(currCid) === -1) {
					cidArr.push(currCid);
					console.log("cidArr ", cidArr);
					// 更新用户的cid列表
					const asd = await uniCloud.callFunction({
						name: "updateUserInfo",
						data: {
							user: {
								...userInfo,
								cid: cidArr.join(","),
							},
						},
					});

					console.log("update ", asd);
				}
				uni.showToast({ title: "登录成功" });
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
				return;
			} else {
				this.openid = userData.result.openid;
				this.session_key = userData.result.session_key;
			}
			uni.hideLoading();

			// 步骤2：获取用户头像昵称（微信新规范：必须使用button触发）
			// 个人小程序只能使用头像昵称填写，不能主动获取
			this.getUserProfile(data.code);
		},

		// 获取用户信息（微信要求：必须使用<button open-type="chooseAvatar">）
		getUserProfile(code) {
			uni.showModal({
				title: "授权提示",
				content: "需要您的头像和昵称完成登录",
				success: (res) => {
					if (res.confirm) {
						// 这里引导用户填写昵称和选择头像
						// 使用 <input type="nickname"> 和 <button open-type="chooseAvatar">
						console.log("用户同意授权", code);
						this.code = code;
						this.showUserInfoForm(code);
					}
				},
			});
		},

		// 显示用户信息表单（头像+昵称）
		showUserInfoForm(code) {
			this.showForm = true;
		},

		// 选择头像
		onChooseAvatar(e) {
			this.avatarUrl = e.detail.avatarUrl;
			// 上传头像到后台
			// this.uploadAvatar(e.detail.avatarUrl);
			console.log("用户选择头像：", e);
			uni.$uploadFile({
				filePath: e.detail.avatarUrl,
				success: async (fileUrl) => {
					this.avatarUrl = fileUrl;
				},
			});
		},

		// 提交登录
		async submitLogin() {
			if (!this.nickName.trim()) {
				uni.showToast({ title: "请输入昵称", icon: "none" });
				return;
			}

			// 如果头像还未上传完成，等待上传完成
			if (this.avatarUrl && this.avatarUrl.startsWith("http://tmp/")) {
				uni.showToast({ title: "头像上传中，请稍候", icon: "none" });
				return;
			}

			uni.showLoading({ title: "登录中..." });
			console.log("提交登录：", this.code);

			try {
				// 调用云函数
				const res = await uniCloud.callFunction({
					name: "wxLogin",
					data: {
						// code: this.code,
						openid: this.openid,
						session_key: this.session_key,
						avatarUrl: this.avatarUrl,
						nickName: this.nickName,
						cid: uni.getStorageSync("cid"),
					},
				});

				if (res.result.success) {
					// 保存用户信息到本地
					uni.setStorageSync("userInfo", res.result.userInfo);
					uni.setStorageSync("token", res.result.token);

					uni.showToast({ title: "登录成功" });
					setTimeout(() => {
						uni.navigateBack();
					}, 1000);
				} else {
					uni.showToast({
						title: res.result.errMsg || "登录失败",
						icon: "none",
					});
				}
			} catch (err) {
				console.error(err);
				uni.showToast({ title: "登录异常", icon: "none" });
			} finally {
				uni.hideLoading();
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.login-container {
	position: relative;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	// background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	z-index: 1;
}

.content {
	position: relative;
	z-index: 3;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 40rpx;
	height: 100%;
	flex: 1;
}

.logo-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 100rpx;
	animation: fadeInDown 0.8s ease-out;

	.logo-container {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		//background: #fff;
		box-shadow: 0 8rpx 16rpx rgba(102, 126, 234, 0.3);
		margin-bottom: 30rpx;
		overflow: hidden;

		.logo {
			width: 120rpx;
			height: 120rpx;
		}
	}

	.app-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
}

.login-section {
	width: 100%;
	max-width: 600rpx;
	transition: all 0.5s ease;

	&.form-visible {
		animation: fadeIn 0.5s ease-out;
	}
}

.login-card {
	// background-color: rgba(255, 255, 255, 0.8);
	border-radius: 20rpx;
	// padding: 60rpx 40rpx;
	// box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
	// border: 1px solid rgba(255, 255, 255, 0.3);
	animation: fadeInUp 0.8s ease-out;

	.welcome-text {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		margin-bottom: 60rpx;
	}

	.login-btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #07c160 0%, #06ae56 100%);
		color: white;
		border-radius: 100rpx;
		padding: 25rpx;
		font-size: 32rpx;
		font-weight: bold;
		box-shadow: 0 8rpx 16rpx rgba(7, 193, 96, 0.3);
		transition: all 0.3s ease;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 8rpx rgba(7, 193, 96, 0.2);
		}

		text {
			margin-left: 16rpx;
		}
	}
}

.user-form {
	background-color: rgba(255, 255, 255, 0.8);
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.3);

	.form-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		margin-bottom: 60rpx;
	}

	.avatar-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;

		.avatar-btn {
			position: relative;
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			overflow: hidden;
			background-color: #f5f5f5;
			border: none;
			padding: 0;
			margin: 0;

			.avatar-image {
				width: 100%;
				height: 100%;
			}

			.avatar-hint {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				background-color: rgba(0, 0, 0, 0.5);
				color: white;
				font-size: 24rpx;
				padding: 8rpx 0;
				text-align: center;
			}
		}
	}

	.input-section {
		margin-bottom: 40rpx;

		.nickname-input {
			// width: 100%;
			height: 80rpx;
			background-color: rgba(241, 245, 249, 0.8);
			border-radius: 16rpx;
			padding: 0 20rpx;
			font-size: 30rpx;
			color: #333;
			border: 1px solid rgba(0, 0, 0, 0.05);
			transition: all 0.3s ease;

			&:focus {
				background-color: rgba(241, 245, 249, 0.95);
				border-color: rgba(102, 126, 234, 0.5);
			}
		}
	}

	.submit-btn {
		width: 100%;
		height: 80rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 40rpx;
		font-size: 32rpx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 8rpx 16rpx rgba(102, 126, 234, 0.3);
		transition: all 0.3s ease;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 8rpx rgba(102, 126, 234, 0.2);
		}
	}
}

@keyframes fadeInDown {
	from {
		opacity: 0;
		transform: translateY(-30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style>
