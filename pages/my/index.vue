<template>
	<view class="moments-container">
		<!-- 朋友圈头部 - 个人信息区 -->
		<view class="profile-header">
			<view class="cover-image" @click="changeCoverImage">
				<image :src="coverImage" mode="aspectFill"></image>
				<view class="cover-image-tip">点击更换封面</view>
			</view>
			<view class="profile-info">
				<view class="avatar">
					<image :src="userInfo.avatarUrl || 'https://picsum.photos/seed/avatar/200/200.jpg'"
						mode="aspectFill"></image>
				</view>
				<view class="user-details">
					<view class="nickname">{{ userInfo.nickName || '微信用户' }}</view>
				</view>
			</view>

		</view>

		<!-- 发布新动态按钮 -->
		<view class="publish-btn" @click="showPublishModal">
			<u-icon name="plus" size="24" color="#fff"></u-icon>
		</view>

		<!-- 朋友圈内容列表 -->
		<scroll-view class="moments-list" scroll-y="true" @scrolltolower="loadMoreMoments">
			<view class="moment-item" v-for="(moment, index) in momentsList" :key="index">
				<!-- 用户信息 -->
				<view class="moment-header">

					<view class="user-info">

						<view class="publish-time">{{ moment.time }}</view>
					</view>
					<!-- 编辑和删除按钮 -->
					<view class="moment-actions-btn">
						<view class="action-btn edit-btn" @click="showEditModalFn(moment, index)">
							<u-icon name="edit-pen" size="18" color="#666"></u-icon>
						</view>
						<view class="action-btn delete-btn" @click="deleteMoment(moment, index)">
							<u-icon name="trash" size="18" color="#666"></u-icon>
						</view>
					</view>
				</view>

				<!-- 动态内容 -->
				<view class="moment-content">
					<view class="text-content" v-if="moment.content">{{ moment.content }}</view>

					<!-- 图片内容 -->
					<view class="image-content" v-if="moment.images && moment.images.length > 0"
						:class="[getImageClass(moment.images.length)]">
						<view class="image-item" v-for="(img, imgIndex) in moment.images" :key="imgIndex"
							@click="previewImage(moment.images, imgIndex)">
							<image :src="img" mode="aspectFill"></image>
						</view>
					</view>
				</view>



			</view>

			<!-- 加载更多提示 -->
			<view class="load-more" v-if="loading">
				<u-loading-icon mode="flower" color="#888"></u-loading-icon>
				<text>加载中...</text>
			</view>

			<!-- 没有更多数据提示 -->
			<view class="no-more" v-if="noMoreData">
				<text>没有更多动态了</text>
			</view>
		</scroll-view>

		<!-- 发布动态弹窗 -->
		<u-popup :show="showPublish" mode="bottom" border-radius="20" height="60%">
			<view class="publish-modal">
				<view class="modal-header">
					<text>发表动态</text>
					<u-icon name="close" @click="closePublishModal" size="24"></u-icon>
				</view>

				<view class="publish-content">
					<u-textarea v-model="newMoment.content" placeholder="分享你的生活..." height="150"
						maxlength="500"></u-textarea>

					<view class="image-upload-area">
						<view class="upload-tip">添加图片</view>
						<view class="image-preview-grid">
							<view class="preview-item" v-for="(img, index) in newMoment.images" :key="index">
								<image :src="img" mode="aspectFill"></image>
								<view class="delete-btn" @click="deleteImage(index)">
									<u-icon name="close" color="#fff" size="14"></u-icon>
								</view>
							</view>
							<view class="upload-btn" v-if="newMoment.images.length < 9" @click="chooseImage">
								<u-icon name="plus" color="#999" size="30"></u-icon>
							</view>
						</view>
					</view>
				</view>

				<view class="publish-actions">
					<u-button type="info" @click="closePublishModal">取消</u-button>
					<u-button type="primary" @click="publishMoment" :loading="publishing">发表</u-button>
				</view>
			</view>
		</u-popup>

		<!-- 编辑动态弹窗 -->
		<u-popup :show="showEditModal" mode="bottom" border-radius="20" height="60%">
			<view class="publish-modal">
				<view class="modal-header">
					<text>编辑动态</text>
					<u-icon name="close" @click="closeEditModal" size="24"></u-icon>
				</view>

				<view class="publish-content">
					<u-textarea v-model="editMoment.content" placeholder="分享你的生活..." height="150"
						maxlength="500"></u-textarea>

					<view class="image-upload-area">
						<view class="upload-tip">添加图片</view>
						<view class="image-preview-grid">
							<view class="preview-item" v-for="(img, index) in editMoment.images" :key="index">
								<image :src="img" mode="aspectFill"></image>
								<view class="delete-btn" @click="deleteEditImage(index)">
									<u-icon name="close" color="#fff" size="14"></u-icon>
								</view>
							</view>
							<view class="upload-btn" v-if="editMoment.images.length < 9" @click="chooseEditImage">
								<u-icon name="plus" color="#999" size="30"></u-icon>
							</view>
						</view>
					</view>
				</view>

				<view class="publish-actions">
					<u-button type="info" @click="closeEditModal">取消</u-button>
					<u-button type="primary" @click="editMomentSubmit" :loading="editing">保存</u-button>
				</view>
			</view>
		</u-popup>


	</view>
</template>

<script>
export default {
	name: "MomentsPage",
	data() {
		return {
			userInfo: {},
			momentsList: [],
			loading: false,
			noMoreData: false,
			page: 1,
			pageSize: 10,
			coverImage: 'https://picsum.photos/seed/moment-cover/750/300.jpg',

			// 发布相关
			showPublish: false,
			publishing: false,
			newMoment: {
				content: '',
				images: []
			},

			commenting: false,
			currentMoment: null,
			currentMomentIndex: -1,
			newComment: '',

			// 编辑动态相关
			showEditModal: false,
			editing: false,
			editMoment: {
				content: '',
				images: [],
				index: -1
			}
		};
	},
	onLoad() {
		this.getUserInfo();
		this.loadMomentsList();
	},
	methods: {
		// 获取用户信息
		getUserInfo() {
			// 从本地存储获取用户信息
			const userInfo = uni.getStorageSync('userInfo');
			if (userInfo) {
				this.userInfo = userInfo;
			} else {
				// 使用默认数据
				this.userInfo = {
					nickName: '微信用户',
					avatarUrl: 'https://picsum.photos/seed/default-avatar/200/200.jpg'
				};
			}
		},

		// 加载朋友圈列表
		loadMomentsList(isRefresh = false) {
			if (this.loading || this.noMoreData) return;

			if (isRefresh) {
				this.page = 1;
				this.noMoreData = false;
			}

			this.loading = true;

			// 模拟网络请求延迟
			setTimeout(() => {
				// 模拟数据
				const mockData = this.generateMockMoments();

				if (isRefresh) {
					this.momentsList = mockData;
				} else {
					this.momentsList = [...this.momentsList, ...mockData];
				}

				// 模拟分页数据加载完毕
				if (this.page >= 3) {
					this.noMoreData = true;
				} else {
					this.page++;
				}

				this.loading = false;
			}, 1000);
		},

		// 生成模拟数据
		generateMockMoments() {
			const mockMoments = [];
			const users = [
				{ name: '小明', avatar: 'https://picsum.photos/seed/user1/100/100.jpg' },
				{ name: '小红', avatar: 'https://picsum.photos/seed/user2/100/100.jpg' },
				{ name: '小李', avatar: 'https://picsum.photos/seed/user3/100/100.jpg' },
				{ name: '小张', avatar: 'https://picsum.photos/seed/user4/100/100.jpg' },
				{ name: '小王', avatar: 'https://picsum.photos/seed/user5/100/100.jpg' },
			];

			const contents = [
				'今天天气真好，出去走走！',
				'周末加班，为了梦想加油！',
				'分享一个超赞的餐厅，味道一流！',
				'刚看完一部电影，剧情太精彩了！',
				'生活不止眼前的苟且，还有诗和远方。'
			];

			// 生成随机数量的朋友圈
			const count = Math.floor(Math.random() * 5) + 3;
			for (let i = 0; i < count; i++) {
				const user = users[Math.floor(Math.random() * users.length)];
				const content = contents[Math.floor(Math.random() * contents.length)];

				// 随机生成图片
				const imageCount = Math.floor(Math.random() * 4);
				const images = [];
				for (let j = 1; j < imageCount; j++) {
					images.push(`https://picsum.photos/seed/moment${Date.now()}${j}/300/300.jpg`);
				}

				// 随机生成评论
				const commentCount = Math.floor(Math.random() * 3);
				const comments = [];
				for (let j = 0; j < commentCount; j++) {
					const commentUser = users[Math.floor(Math.random() * users.length)];
					comments.push({
						user: commentUser.name,
						text: '说得真好！',
						time: this.formatTime(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
					});
				}

				mockMoments.push({
					username: user.name,
					avatar: user.avatar,
					content: content,
					images: images,
					time: this.formatTime(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)),
					isLiked: Math.random() > 0.7,
					likes: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 1 : '',
					likesText: Math.random() > 0.5 ? '小明, 小红, 小李' : '',
					comments: comments
				});
			}

			return mockMoments;
		},

		// 格式化时间
		formatTime(date) {
			const now = new Date();
			const year = date.getFullYear();
			const month = this.padZero(date.getMonth() + 1);
			const day = this.padZero(date.getDate());
			const hour = this.padZero(date.getHours());
			const minute = this.padZero(date.getMinutes());
			const second = this.padZero(date.getSeconds());
			return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
		},
		//补零
		padZero(num) {
			return num < 10 ? '0' + num : num;
		},

		// 加载更多
		loadMoreMoments() {
			this.loadMomentsList();
		},




		// 预览图片
		previewImage(images, current) {
			uni.previewImage({
				urls: images,
				current: current
			});
		},

		// 获取图片布局类名
		getImageClass(count) {
			if (count === 1) return 'single-image';
			if (count === 2) return 'two-images';
			if (count <= 4) return 'four-images';
			return 'nine-images';
		},

		// 显示发布弹窗
		showPublishModal() {
			this.showPublish = true;
		},

		// 关闭发布弹窗
		closePublishModal() {
			this.showPublish = false;
			this.newMoment = {
				content: '',
				images: []
			};
		},

		// 选择图片
		chooseImage() {
			const maxCount = 9 - this.newMoment.images.length;

			uni.chooseImage({
				count: maxCount,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.newMoment.images = [...this.newMoment.images, ...res.tempFilePaths];
				}
			});
		},

		// 删除图片
		deleteImage(index) {
			this.newMoment.images.splice(index, 1);
		},

		// 发布动态
		publishMoment() {
			if (!this.newMoment.content.trim() && this.newMoment.images.length === 0) {
				uni.showToast({
					title: '请输入内容或添加图片',
					icon: 'none'
				});
				return;
			}

			this.publishing = true;

			// 模拟网络请求
			setTimeout(() => {
				// 创建新动态
				const newMoment = {
					username: this.userInfo.nickName || '微信用户',
					avatar: this.userInfo.avatarUrl || 'https://picsum.photos/seed/default-avatar/200/200.jpg',
					content: this.newMoment.content,
					images: [...this.newMoment.images],
					time: '刚刚',
					isLiked: false,
					likes: '',
					likesText: '',
					comments: []
				};

				// 添加到列表开头
				this.momentsList.unshift(newMoment);

				// 重置状态
				this.closePublishModal();
				this.publishing = false;

				uni.showToast({
					title: '发表成功',
					icon: 'success'
				});
			}, 1000);
		},

		// 更换封面图片
		changeCoverImage() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.coverImage = res.tempFilePaths[0];
					uni.showToast({
						title: '更换封面成功',
						icon: 'success'
					});
				}
			});
		},

		// 显示编辑动态弹窗
		showEditModalFn(moment, index) {



			this.editMoment = {
				content: moment.content,
				images: [...moment.images],
				index: index
			};
			this.showEditModal = true;
		},

		// 关闭编辑弹窗
		closeEditModal() {
			this.showEditModal = false;
			this.editMoment = {
				content: '',
				images: [],
				index: -1
			};
		},

		// 编辑动态
		editMomentSubmit() {
			if (!this.editMoment.content.trim() && this.editMoment.images.length === 0) {
				uni.showToast({
					title: '请输入内容或添加图片',
					icon: 'none'
				});
				return;
			}

			this.editing = true;

			// 模拟网络请求
			setTimeout(() => {
				// 更新动态
				const index = this.editMoment.index;
				this.momentsList[index].content = this.editMoment.content;
				this.momentsList[index].images = [...this.editMoment.images];
				this.momentsList[index].time = '刚刚更新';

				// 重置状态
				this.closeEditModal();
				this.editing = false;

				uni.showToast({
					title: '修改成功',
					icon: 'success'
				});
			}, 1000);
		},

		// 删除动态
		deleteMoment(moment, index) {

			uni.showModal({
				title: '提示',
				content: '确定要删除这条动态吗？',
				success: (res) => {
					if (res.confirm) {
						// 从列表中移除
						this.momentsList.splice(index, 1);

						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						if (this.momentsList.length == 0) {
							this.noMoreData = true;
						}
					}
				}
			});
		},

		// 编辑动态时选择图片
		chooseEditImage() {
			const maxCount = 9 - this.editMoment.images.length;

			uni.chooseImage({
				count: maxCount,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.editMoment.images = [...this.editMoment.images, ...res.tempFilePaths];
				}
			});
		},

		// 删除编辑中的图片
		deleteEditImage(index) {
			this.editMoment.images.splice(index, 1);
		}
	}
};
</script>

<style lang="scss" scoped>
.moments-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	position: relative;
	padding-top: 0 !important;
}

/* 个人信息区样式 */
.profile-header {
	position: relative;
	background-color: #fff;
	padding-bottom: 20rpx;
}

.cover-image {
	height: 300rpx;
	width: 100%;
	overflow: hidden;
	position: relative;

	image {
		width: 100%;
		height: 100%;
	}

	.cover-image-tip {
		position: absolute;
		bottom: 20rpx;
		right: 20rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: #fff;
		padding: 8rpx 16rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		z-index: 1;
	}
}

.profile-info {
	display: flex;
	padding: 0 30rpx;
	margin-top: -60rpx;
	position: relative;
	z-index: 2;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 10rpx;
	border: 4rpx solid #fff;
	overflow: hidden;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

	image {
		width: 100%;
		height: 100%;
	}
}

.user-details {
	flex: 1;
	padding-left: 20rpx;
	padding-top: 80rpx;
}

.nickname {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.signature {
	font-size: 28rpx;
	color: #666;
}

.profile-stats {
	display: flex;
	padding: 20rpx 30rpx;
	margin-top: 20rpx;
}

.stat-item {
	flex: 1;
	text-align: center;

	.stat-value {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.stat-label {
		font-size: 24rpx;
		color: #666;
		margin-top: 5rpx;
	}
}

/* 发布按钮 */
.publish-btn {
	position: fixed;
	bottom: 100rpx;
	right: 30rpx;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #4158d0, #c850c0);
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 8rpx 16rpx rgba(65, 88, 208, 0.4);
	z-index: 99;
}

/* 朋友圈列表 */
.moments-list {
	height: calc(100vh - 460rpx);
	padding-bottom: 30rpx;
}

.moment-item {
	background-color: #fff;
	margin-bottom: 20rpx;
	padding: 20rpx 30rpx;
}

.moment-header {
	display: flex;
	margin-bottom: 20rpx;
	position: relative;
}

/* 编辑和删除按钮 */
.moment-actions-btn {
	display: flex;
	position: absolute;
	right: 0;
	top: 0;
}

.action-btn {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 10rpx;
	background-color: rgba(255, 255, 255, 0.8);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.95);
	}
}

.user-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 10rpx;
	overflow: hidden;
	margin-right: 20rpx;

	image {
		width: 100%;
		height: 100%;
	}
}

.user-info {
	flex: 1;
}

.user-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 5rpx;
}

.publish-time {
	font-size: 24rpx;
	color: #999;
}

.moment-content {
	margin-bottom: 20rpx;
}

.text-content {
	font-size: 28rpx;
	line-height: 1.6;
	color: #333;
	margin-bottom: 20rpx;
}

/* 图片布局 */
.image-content {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -5rpx;
}

.image-item {
	margin: 5rpx;
	overflow: hidden;
	border-radius: 10rpx;
}

.single-image .image-item {
	width: calc(100% - 10rpx);
	height: 400rpx;
}

.two-images .image-item {
	width: calc(50% - 10rpx);
	height: 300rpx;
}

.four-images .image-item {
	width: calc(50% - 10rpx);
	height: 200rpx;
}

.nine-images .image-item {
	width: calc(33.33% - 10rpx);
	height: 200rpx;
}

.image-item image {
	width: 100%;
	height: 100%;
}

/* 互动区域 */
.moment-actions {
	display: flex;
	padding: 15rpx 0;
	border-top: 1rpx solid #f0f0f0;
	border-bottom: 1rpx solid #f0f0f0;
}

.action-item {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 24rpx;
	color: #999;

	text {
		margin-left: 10rpx;
	}
}

/* 点赞和评论区域 */
.interactions-area {
	background-color: #f8f8f8;
	border-radius: 10rpx;
	margin-top: 15rpx;
	padding: 10rpx 15rpx;
}

.likes-list {
	display: flex;
	align-items: center;
	padding: 5rpx 0;

	.likes-text {
		font-size: 26rpx;
		color: #5b6baf;
		margin-left: 10rpx;
	}
}

.comments-list {
	margin-top: 5rpx;
}

.comment-item {
	font-size: 26rpx;
	line-height: 1.5;
	padding: 5rpx 0;

	.comment-user {
		color: #5b6baf;
		font-weight: bold;
	}

	.comment-text {
		color: #333;
	}
}

/* 加载更多和没有更多 */
.load-more,
.no-more {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30rpx 0;
	color: #999;
	font-size: 26rpx;

	text {
		margin-left: 10rpx;
	}
}

/* 发布弹窗样式 */
.publish-modal {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 30rpx;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
	font-size: 32rpx;
	font-weight: bold;
}

.publish-content {
	flex: 1;
	padding: 20rpx 0;
}

.image-upload-area {
	margin-top: 30rpx;
}

.upload-tip {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 20rpx;
}

.image-preview-grid {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -5rpx;
}

.preview-item {
	width: calc(33.33% - 10rpx);
	height: 200rpx;
	margin: 5rpx;
	position: relative;
	border-radius: 10rpx;
	overflow: hidden;

	image {
		width: 100%;
		height: 100%;
	}

	.delete-btn {
		position: absolute;
		top: 10rpx;
		right: 10rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}

.upload-btn {
	width: calc(33.33% - 10rpx);
	height: 200rpx;
	margin: 5rpx;
	background-color: #f8f8f8;
	border-radius: 10rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.publish-actions {
	display: flex;
	padding-top: 20rpx;

	button {
		flex: 1;
		margin: 0 10rpx;
	}
}

/* 评论弹窗样式 */
.comment-modal {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 30rpx;
}

.comment-list {
	flex: 1;
	overflow-y: auto;
	margin: 20rpx 0;
}

.comment-item {
	display: flex;
	margin-bottom: 20rpx;
}

.comment-avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 20rpx;

	image {
		width: 100%;
		height: 100%;
	}
}

.comment-content {
	flex: 1;
}

.comment-user {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 5rpx;
}

.comment-text {
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
	margin-bottom: 5rpx;
}

.comment-time {
	font-size: 24rpx;
	color: #999;
}

.comment-input-area {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-top: 1rpx solid #f0f0f0;

	.u-input {
		flex: 1;
		margin-right: 20rpx;
	}
}
</style>
