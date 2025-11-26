<template>
	<view class="shop-management">
		<u-navbar title="店铺管理" :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
		</u-navbar>
		<!-- 店铺列表 -->
		<scroll-view :scroll-y="true" style="height: 100%">
			<view class="shop-list">
				<view
					class="shop-card"
					v-for="(shop, index) in shops"
					:key="index"
					@click="navigateToShop(shop)"
				>
					<view class="card-header">
						<view
							class="icon-container"
							:style="{ background: getGradientColor(index) }"
						>
							<u-icon
								name="bookmark-fill"
								size="28"
								color="#fff"
							></u-icon>
						</view>
						<text class="shop-name">{{ shop.name }}</text>
					</view>

					<!-- 操作按钮 -->
					<view class="card-actions" v-if="isDev">
						<u-icon
							name="trash"
							size="20"
							color="#ff6b6b"
							@click.stop="confirmDelete(shop)"
						></u-icon>
					</view>
				</view>

				<!-- 空状态提示 -->
				<view class="empty-state" v-if="shops.length === 0">
					<u-icon name="bookmark" size="50" color="#c0c4cc"></u-icon>
					<text class="empty-text">暂无店铺，请添加</text>
				</view>
			</view>
			<view class="scrollBoxAfter"></view>
		</scroll-view>

		<!-- 悬浮添加按钮 -->
		<view class="fab-button" v-if="isDev" @click="showAddForm"> 新增 </view>

		<!-- 新增店铺表单弹窗 -->

		<u-popup
			:show="showAddPopup"
			mode="center"
			:round="10"
			closeable
			@close="closePopup"
			:safeAreaInsetBottom="false"
		>
			<view class="popup-content">
				<view class="popup-title">新增店铺 </view>

				<u-input v-model="newShopName" placeholder="请输入店铺名称">
				</u-input>
				<view class="popup-actions">
					<u-button type="primary" @click="addShop">保存</u-button>
					<u-button type="error" @click="closePopup">取消</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			shops: [],
			showAddPopup: false,
			newShopName: "",
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
		this.getShopList();
	},
	onLoad() {},
	methods: {
		navigateToShop(shop) {
			// 跳转到店铺详情页或其他操作
			uni.navigateTo({
				url: `/pages/shop/detail?id=${shop.id}`,
			});
		},
		getShopList() {
			uni.showLoading({
				title: "加载中",
			});

			uniCloud
				.callFunction({
					name: "shop",
					data: {
						type: 1,
					},
				})
				.then((res) => {
					uni.hideLoading();
					console.log("获取店铺列表结果", res.result.data);
					if (res.result && res.result.data) {
						this.shops = res.result.data;
					} else {
						this.shops = [];
						uni.showToast({
							title: "获取数据失败",
							icon: "none",
						});
					}

					//滚动到顶部
					uni.pageScrollTo({ scrollTop: 0, duration: 300 });
					console.log("shops", this.shops);
				})
				.catch((err) => {
					uni.hideLoading();
					console.error("调用失败", err);
					uni.showToast({
						title: "获取店铺列表失败",
						icon: "none",
					});
				});
		},
		showAddForm() {
			this.newShopName = "";
			this.showAddPopup = true;
		},
		addShop() {
			if (!this.newShopName.trim()) {
				uni.showToast({
					title: "请输入店铺名称",
					icon: "none",
				});
				return;
			}

			uni.showLoading({
				title: "添加中",
			});

			uniCloud
				.callFunction({
					name: "shop",
					data: {
						type: "add",
						name: this.newShopName,
					},
				})
				.then(({ result }) => {
					uni.hideLoading();
					console.log("添加店铺结果", result);
					if (result.code === 0) {
						uni.showToast({
							title: "添加成功",
						});
						setTimeout(() => {
							this.getShopList();
						}, 500);
					} else {
						uni.showToast({
							title: result.message,
							icon: "none",
						});
					}

					this.showAddPopup = false;
				})
				.catch((err) => {
					uni.hideLoading();
					console.error("添加失败", err);
					uni.showToast({
						title: "添加失败",
						icon: "none",
					});
				});
		},
		confirmDelete(shop) {
			uni.showModal({
				title: "确认删除",
				content: "确定要删除该店铺吗？此操作不可恢复",
				success: (res) => {
					if (res.confirm) {
						this.deleteShop(shop);
					}
				},
			});
		},
		closePopup() {
			this.showAddPopup = false;
		},
		deleteShop(shop) {
			uni.showLoading({
				title: "删除中",
			});

			uniCloud
				.callFunction({
					name: "shop",
					data: {
						type: "del",
						id: shop._id,
					},
				})
				.then((res) => {
					uni.hideLoading();
					uni.showToast({
						title: "删除成功",
					});
					this.getShopList();
				})
				.catch((err) => {
					uni.hideLoading();
					console.error("删除失败", err);
					uni.showToast({
						title: "删除失败",
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
.shop-management {
	padding: 0 24rpx;
}

.shop-card {
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

.shop-card:active {
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

.shop-name {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	padding-left: 10rpx;
}

.card-actions {
	display: flex;
	align-items: center;
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
