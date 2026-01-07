<template>
	<view class="home-container">
		<scroll-view class="content" :scroll-y="false">
			<!-- 用户信息区域 -->
			<view class="user-section" v-if="isLoggedIn">
				<view class="user-card">
					<view class="user-avatar" @click="navigateToProfile">
						<image :src="userInfo.avatarUrl ||
							'https://env-00jxtjtj8hsd.normal.cloudstatic.cn/c8656bb3-c4b7-4b0b-ae03-366577e1af35.png'
							" mode="aspectFill" class="avatar-img"></image>
						<text class="user-name">{{
							userInfo.nickName || "用户"
						}}</text>
					</view>
					<view class="user-info">
						<view class="logout-btn" @click="handleLogout">退出登录</view>
					</view>
				</view>
			</view>

			<view class="menu-grid">
				<template v-for="(item, index) in menuItems">
					<view v-if="shouldShowItem(item)" class="menu-item" :key="index" @click="navigateTo(item)" :class="[
						{
							animated: animateItems,
						},
					]" :style="{
						'animation-delay': getRealIndex(item) * 0.1 + 's',
					}">
						<view class="menu-icon-container" :style="{
							background:
								gradientColors[
								index % gradientColors.length
								],
						}">
							<u-icon :name="item.icon" size="30" color="#ffffff"></u-icon>
							<text class="menu-text">{{ item.title }}</text>
						</view>
					</view>
				</template>
			</view>
		</scroll-view>
		<!-- <u-button type="primary" @click="test">提交</u-button> -->

		<!-- 悬浮登录按钮 -->
		<view class="floating-login-btn" v-if="!isLoggedIn" @click="navigateTo({ url: 'login' })">
			<u-icon name="account" color="#fff" size="25"></u-icon>
			<text>登录</text>
		</view>
	</view>
</template>

<script>
import m_excel from "@/uni_modules/m-excel/m-excel/js_sdk/index.js"
export default {
	data() {
		return {
			animateItems: false,
			isLoggedIn: !!uni.getStorageSync("token"),
			userInfo: {},
			refreshing: false,
			menuItems: [
				{
					title: "店铺",
					icon: "bookmark-fill",
					url: "shop",
				},
				{
					title: "项目",
					icon: "star-fill",
					url: "project",
				},
				{
					title: "对账单",
					icon: "edit-pen",
					url: "duizhang",
				},
				{
					title: "手工",
					icon: "attach",
					url: "shougong",
				},
				{
					title: "报销单",
					icon: "rmb-circle-fill",
					url: "baoxiao",
				},
				{
					title: "考勤",
					icon: "calendar-fill",
					url: "kaoqin",
				},
				{
					title: "计划",
					icon: "list",
					url: "im",
					showWhen: "isShowJiHua",
				},
				{
					title: "用户",
					icon: "account-fill",
					url: "userList",
					showWhen: "isAdmin",
				},
				{
					title: "修改文件",
					icon: "setting",
					url: "",
				},
			],
			gradientColors: uni.$colors,
		};
	},
	onShow() {
		// 检查登录状态
		this.checkLoginStatus();

		// 启动动画
		setTimeout(() => {
			this.animateItems = true;
		}, 100);
	},

	methods: {
		test() {
			wx.openChatTool();
		},
		clearLoadData() {
			this.fetchUserInfo();
		},
		// 检查登录状态
		checkLoginStatus() {
			const token = uni.getStorageSync("token");
			const userInfo = uni.getStorageSync("userInfo");

			this.isLoggedIn = !!token;
			this.userInfo = userInfo || {};
			this.fetchUserInfo();
		},
		// 获取用户信息
		async fetchUserInfo() {
			try {
				const token = uni.getStorageSync("token");
				if (!token) {
					this.refreshing = false;
					return;
				}

				// 调用云函数获取最新用户信息
				const res = await uniCloud.callFunction({
					name: "getUserInfo",
					data: { token },
				});

				if (res.result && res.result.success) {
					// 更新本地存储和页面数据
					uni.setStorageSync("userInfo", res.result.userInfo);
					this.userInfo = res.result.userInfo;
				} else {
					// 可能token已失效，清除登录状态
					uni.removeStorageSync("token");
					uni.removeStorageSync("userInfo");
					this.isLoggedIn = false;
					this.userInfo = {};

					uni.showToast({
						title: "登录已过期，请重新登录",
						icon: "none",
					});
				}
			} catch (err) {
				console.error("获取用户信息失败:", err);
				uni.showToast({
					title: "获取信息失败",
					icon: "none",
				});
			} finally {
				this.refreshing = false;
			}
		},

		// 判断菜单项是否应该显示
		shouldShowItem(item) {
			if (!item.showWhen) return true;

			return this.userInfo?.[item.showWhen];
		},

		// 获取菜单项在过滤后的实际索引
		getRealIndex(item) {
			let index = 0;
			for (let i = 0; i < this.menuItems.length; i++) {
				if (this.menuItems[i] === item) {
					return index;
				}
				if (this.shouldShowItem(this.menuItems[i])) {
					index++;
				}
			}
			return 0;
		},

		// 导航到指定页面
		navigateTo(item) {
			if (!item.url) {
				return this.otherOpteration(item);
			}

			uni.navigateTo({ url: `/pages/${item.url}/index` });
		},
		otherOpteration(item) {
			if (item.title === '修改文件') {
				m_excel.read().then(res => {
					// console.log(res);
					uni.setStorageSync('excelData', res.data)
					uni.navigateTo({ url: `/pages/${res.url}/index?duqu=1&${res.otherData}` });

				})
			}
		},

		// 导航到个人信息页面
		navigateToProfile() {
			uni.navigateTo({ url: "/pages/profile/index" });
		},

		// 退出登录
		handleLogout() {
			uni.showModal({
				title: "提示",
				content: "确定要退出登录吗？",
				success: (res) => {
					if (res.confirm) {
						// 清除本地存储
						uni.removeStorageSync("token");
						uni.removeStorageSync("userInfo");

						// 更新状态
						this.isLoggedIn = false;
						this.userInfo = {};

						uni.showToast({
							title: "已退出登录",
							icon: "success",
						});
					}
				},
			});
		},
	},
};
</script>

<style lang="scss">
@import "./home.scss";

.user-section {
	width: 90%;
	margin: 10rpx auto;
	animation: fadeInDown 0.8s ease-out;

	user-select: none;
	white-space: nowrap;
}

.user-card {
	border-radius: 20rpx;
	padding: 30rpx;
	display: flex;
	justify-content: space-around;
	align-items: center;
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	user-select: none;
}

.user-avatar {
	overflow: hidden;

	cursor: pointer;
	user-select: none;
	flex: 1;
	display: flex;
	align-items: center;
	-webkit-tap-highlight-color: transparent;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
}

.avatar-img {
	width: 100%;
	height: 100%;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	margin-right: 30rpx;
	border: 4rpx solid rgba(102, 126, 234, 0.2);
	overflow: hidden;
}

.user-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	cursor: pointer;
	user-select: none;
}

.logout-btn {
	padding: 10rpx 20rpx;
	background-color: rgba(245, 108, 108, 0.8);
	color: white;
	border-radius: 30rpx;
	font-size: 24rpx;
	box-shadow: 0 4rpx 8rpx rgba(245, 108, 108, 0.3);
	transition: all 0.3s ease;
	user-select: none;

	&:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 4rpx rgba(245, 108, 108, 0.2);
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
</style>
