<template>
	<view class="user-management">
		<u-navbar title="用户管理" :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
		</u-navbar>
		<!-- 用户列表 -->
		<scroll-view :scroll-y="true" style="height: 100%">
			<view class="user-list">
				<view
					class="user-card"
					v-for="(user, index) in users"
					:key="index"
				>
					<view class="card-header">
						<view
							class="icon-container"
							:style="{ background: getGradientColor(index) }"
						>
							<image
								:src="user.avatarUrl || '/static/logo.png'"
								mode="scaleToFill"
								style="
									width: 100%;
									height: 100%;
									border-radius: 10rpx;
								"
							/>
						</view>
						<text class="user-name">{{ user.nickName }}</text>
					</view>

					<!-- 操作按钮 -->
					<view class="card-actions" @click="navigateToUser(user)">
						{{ user.isShowJiHua ? "隐藏计划列" : "展示计划列" }}
					</view>
				</view>

				<!-- 空状态提示 -->
				<view class="empty-state" v-if="users.length === 0">
					<u-icon name="bookmark" size="50" color="#c0c4cc"></u-icon>
					<text class="empty-text">暂无用户，请添加</text>
				</view>
			</view>
			<view class="scrollBoxAfter"></view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			users: [],
			showAddPopup: false,
			newUserName: "",
			gradientColors: [
				"linear-gradient(135deg, #FF9A9E, #FAD0C4)",
				"linear-gradient(135deg, #A18CD1, #FBC2EB)",
				"linear-gradient(135deg, #FCCB90, #D57EEB)",
				"linear-gradient(135deg, #A1C4FD, #C2E9FB)",
				"linear-gradient(135deg, #84FAB0, #8FD3F4)",
				"linear-gradient(135deg, #F5576C, #F093FB)",
				"linear-gradient(135deg, #4FACFE, #00F2FE)",
				"linear-gradient(135deg, #43E97B, #38F9D7)",
				"linear-gradient(135deg, #FA709A, #FEE140)",
			],
			isDev: uni.$develop,
		};
	},
	onShow() {
		this.getUserList();
	},
	onLoad() {},
	methods: {
		navigateToUser(user) {
			// 跳转到用户详情页或其他操作
			uni.showModal({
				title: "提示",
				content: "确定要修改授权吗？",
				success: async (res) => {
					if (res.confirm) {
						const { result } = await uniCloud.callFunction({
							name: "updateUserInfo",
							data: {
								user: {
									...user,
									isShowJiHua: !user.isShowJiHua,
								},
							},
						});

						console.log("updateUserInfo result", result);

						if (result.code === 0) {
							uni.$sendMessage(
								{
									message: !user.isShowJiHua
										? "权限被修改，你可以查看计划列"
										: "权限被修改，你无法查看计划列",
									to: user.cid.split(","),
								},
								"用户权限修改"
							);

							uni.showToast({
								title: "授权成功",
								icon: "success",
							});

							this.getUserList();
						}
					}
				},
			});
		},
		getUserList() {
			uni.showLoading({
				title: "加载中",
			});

			uniCloud
				.callFunction({
					name: "getAllUsers",
				})
				.then((res) => {
					uni.hideLoading();
					console.log("获取用户列表结果", res.result.data);
					if (res.result && res.result.data) {
						this.users = res.result.data;
					} else {
						this.users = [];
						uni.showToast({
							title: "获取数据失败",
							icon: "none",
						});
					}

					//滚动到顶部
					uni.pageScrollTo({ scrollTop: 0, duration: 300 });
					console.log("users", this.users);
				})
				.catch((err) => {
					uni.hideLoading();
					console.error("调用失败", err);
					uni.showToast({
						title: "获取用户列表失败",
						icon: "none",
					});
				});
		},

		getGradientColor(index) {
			return this.gradientColors[index % this.gradientColors.length];
		},
	},
};
</script>

<style lang="scss" scoped>
.user-management {
	padding: 0 24rpx;
}

.user-card {
	background-color: rgba($color: #ffffff, $alpha: 0.4);
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	padding: 24rpx;
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.user-card:active {
	transform: scale(0.98);
}

.card-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.icon-container {
	width: 80rpx;
	height: 80rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.user-name {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	padding-left: 10rpx;
}

.card-actions {
	display: flex;
	align-items: center;
	font-size: 20rpx;
	background: linear-gradient(135deg, #12ef0e 0%, #d4a01e 100%);
	padding: 10rpx 15rpx;
	border-radius: 10rpx;
	color: #fff;
}

.fab-button {
	position: fixed;

	bottom: 100rpx;
	z-index: 999;
	background: linear-gradient(135deg, #12ef0e 0%, #13581e 100%);
	color: #fff;
	width: 100rpx;
	height: 100rpx;
	line-height: 100rpx;
	text-align: center;
	border-radius: 50%;
	left: calc(50% - 50rpx);
	// box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.modal-content {
	padding: 40rpx 20rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: #ccc;
	margin-top: 20rpx;
}

.scrollBoxAfter {
	height: 100px;
}
</style>
