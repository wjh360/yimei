<template>
	<view class="profile-container">
		<u-navbar title="个人信息" :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
		</u-navbar>

		<view class="profile-content">
			<!-- 头像部分 -->
			<view class="profile-item" @click="chooseAvatar">
				<text class="label">头像</text>
				<view class="avatar-container">
					<image
						:src="
							userInfo.avatarUrl ||
							'https://env-00jxtjtj8hsd.normal.cloudstatic.cn/c8656bb3-c4b7-4b0b-ae03-366577e1af35.png'
						"
						class="avatar"
						mode="aspectFill"
					></image>
					<u-icon name="arrow-right" color="#999" size="16"></u-icon>
				</view>
			</view>

			<!-- 昵称部分 -->
			<view class="profile-item" @click="editNickname">
				<text class="label">昵称</text>
				<view class="value-container">
					<text class="value">{{
						userInfo.nickName || "未设置"
					}}</text>
					<u-icon name="arrow-right" color="#999" size="16"></u-icon>
				</view>
			</view>

			<!-- 手机号部分 -->
			<view class="profile-item" @click="editPhone">
				<text class="label">手机号</text>
				<view class="value-container">
					<text class="value">{{ userInfo.phone || "未设置" }}</text>
					<u-icon name="arrow-right" color="#999" size="16"></u-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {},
		};
	},

	onLoad() {
		// 获取本地存储的用户信息
		const userInfo = uni.getStorageSync("userInfo") || {};
		this.userInfo = { ...userInfo };
	},

	methods: {
		// 选择头像
		async chooseAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ["compressed"],
				sourceType: ["album", "camera"],
				success: async (res) => {
					uni.showLoading({ title: "上传中..." });

					uni.$uploadFile({
						filePath: res.tempFilePaths[0],
						success: async (fileUrl) => {
							this.$set(this.userInfo, "avatarUrl", fileUrl);
							await this.updateUserInfo();
						},
					});

					uni.hideLoading();
				},
			});
		},

		// 编辑昵称
		editNickname() {
			uni.showModal({
				title: "修改昵称",
				editable: true,
				content: this.userInfo.nickName || "",
				success: async (res) => {
					if (res.confirm && res.content) {
						uni.showLoading({ title: "保存中..." });

						try {
							// 更新昵称
							this.$set(this.userInfo, "nickName", res.content);
							// 调用云函数更新用户信息
							await this.updateUserInfo();

							uni.showToast({
								title: "修改成功",
								icon: "success",
							});
						} catch (err) {
							// 恢复原来的昵称

							this.$set(
								this.userInfo,
								"nickName",
								uni.getStorageSync("userInfo").nickName || ""
							);
							uni.showToast({
								title: "修改失败",
								icon: "none",
							});
						} finally {
							uni.hideLoading();
						}
					}
				},
			});
		},

		// 编辑手机号
		editPhone() {
			uni.showModal({
				title: "修改手机号",
				editable: true,
				content: this.userInfo.phone || "",
				success: async (res) => {
					if (res.confirm && res.content) {
						// 简单验证手机号格式
						if (/^1[3-9]\d{9}$/.test(res.content)) {
							uni.showLoading({ title: "保存中..." });

							try {
								// 更新手机号
								// this.userInfo.phone = res.content;

								this.$set(this.userInfo, "phone", res.content);

								// 调用云函数更新用户信息
								await this.updateUserInfo();

								uni.showToast({
									title: "修改成功",
									icon: "success",
								});
							} catch (err) {
								// 恢复原来的手机号
								this.$set(
									this.userInfo,
									"phone",
									uni.getStorageSync("userInfo").phone || ""
								);
								uni.showToast({
									title: "修改失败",
									icon: "none",
								});
							} finally {
								uni.hideLoading();
							}
						} else {
							uni.showToast({
								title: "手机号格式不正确",
								icon: "none",
							});
						}
					}
				},
			});
		},

		// 更新用户信息
		async updateUserInfo() {
			// 调用云函数更新用户信息
			const res = await uniCloud.callFunction({
				name: "updateUserInfo",
				data: {
					token: uni.getStorageSync("token"),
					user: this.userInfo,
				},
			});

			if (res.result && res.result.code == 0) {
				// 更新本地存储
				uni.setStorageSync("userInfo", this.userInfo);
				return true;
			} else {
				throw new Error("更新用户信息失败");
			}
		},
	},
};
</script>

<style lang="scss">
.profile-container {
	min-height: 100vh;
	padding: 20rpx;
	margin: 0;
	overflow: hidden;

	.profile-content {
		border-radius: 16rpx;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.3);
		.profile-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1px solid rgba(255, 255, 255, 0.3);
			transition: all 0.3s ease;

			&:last-child {
				border-bottom: none;
			}

			&:active {
				background-color: rgba(255, 255, 255, 0.5);
			}

			.label {
				font-size: 32rpx;

				font-weight: 500;
			}

			.avatar-container {
				display: flex;
				align-items: center;

				.avatar {
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
					margin-right: 20rpx;
					border: 2px solid rgba(255, 255, 255, 0.5);
					transition: all 0.3s ease;

					&:active {
						transform: scale(0.95);
					}
				}
			}

			.value-container {
				display: flex;
				align-items: center;

				.value {
					font-size: 30rpx;

					margin-right: 20rpx;
				}
			}
		}
	}
}
</style>
