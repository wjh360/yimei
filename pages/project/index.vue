<template>
	<view class="project-management">
		<u-navbar title="项目管理" :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
		</u-navbar>
		<!-- 项目列表 -->
		<scroll-view :scroll-y="true" style="height: 100%">
			<view class="project-list">
				<view
					class="project-card"
					v-for="(project, index) in projects"
					:key="index"
					@click="navigateToProject(project)"
				>
					<view class="card-header">
						<view
							class="icon-container"
							:style="{ background: gradientColors }"
						>
							<u-icon
								name="star-fill"
								size="28"
								color="#fff"
							></u-icon>
						</view>
						<text class="project-name">{{ project.name }}</text>
					</view>

					<!-- 操作按钮 -->
					<view class="card-actions" v-if="isDev">
						<u-icon
							name="trash"
							size="20"
							color="#ff6b6b"
							@click.stop="confirmDelete(project)"
						></u-icon>
					</view>
				</view>

				<!-- 空状态提示 -->
				<view class="empty-state" v-if="projects.length === 0">
					<u-icon name="bookmark" size="50" color="#c0c4cc"></u-icon>
					<text class="empty-text">暂无项目，请添加</text>
				</view>
			</view>
			<view class="scrollBoxAfter"></view>
		</scroll-view>

		<!-- 悬浮添加按钮 -->
		<view class="fab-button" v-if="isDev" @click="showAddForm"> 新增 </view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			projects: [],
			showAddPopup: false,
			newProjectName: "",
			gradientColors: uni.$colors[1],
			isDev: false,
		};
	},
	onShow() {
		this.isDev = uni.$pw("isAdmin");

		this.getProjectList();
	},
	onLoad() {},
	methods: {
		closePopup() {
			this.showAddPopup = false;
		},
		navigateToProject(project) {
			// 跳转到项目详情页或其他操作
			uni.navigateTo({
				url: `/pages/project/detail?id=${project.id}`,
			});
		},
		getProjectList() {
			uni.showLoading({
				title: "加载中",
			});

			uniCloud
				.callFunction({
					name: "project",
					data: {
						type: 1,
					},
				})
				.then((res) => {
					uni.hideLoading();
					console.log("获取项目列表结果", res.result.data);
					if (res.result && res.result.data) {
						this.projects = res.result.data;
					} else {
						this.projects = [];
						uni.showToast({
							title: "获取数据失败",
							icon: "none",
						});
					}

					//滚动到顶部
					uni.pageScrollTo({ scrollTop: 0, duration: 300 });
					console.log("projects", this.projects);
				})
				.catch((err) => {
					uni.hideLoading();
					console.error("调用失败", err);
					uni.showToast({
						title: "获取项目列表失败",
						icon: "none",
					});
				});
		},
		showAddForm() {
			this.newProjectName = "";
			uni.showModal({
				title: "新增项目",
				editable: true,
				content: "",
				placeholderText: "请输入项目名称",
				success: async (res) => {
					if (res.confirm && res.content) {
						uni.showLoading({ title: "保存中..." });

						if (!res.content.trim()) {
							uni.hideLoading();
							return;
						}

						try {
							this.newProjectName = res.content;
							await this.addProject();
						} catch (err) {
							// 恢复原来的昵称

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
		addProject() {
			if (!this.newProjectName.trim()) {
				uni.showToast({
					title: "请输入项目名称",
					icon: "none",
				});
				return;
			}

			uni.showLoading({
				title: "添加中",
			});

			uniCloud
				.callFunction({
					name: "project",
					data: {
						type: "add",
						name: this.newProjectName,
					},
				})
				.then(({ result }) => {
					uni.hideLoading();
					console.log("添加项目结果", result);
					if (result.code === 0) {
						uni.showToast({
							title: "添加成功",
						});
						setTimeout(() => {
							this.getProjectList();
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
		confirmDelete(project) {
			uni.showModal({
				title: "确认删除",
				content: "确定要删除该项目吗？此操作不可恢复",
				success: (res) => {
					if (res.confirm) {
						this.deleteProject(project);
					}
				},
			});
		},
		deleteProject(project) {
			uni.showLoading({
				title: "删除中",
			});

			uniCloud
				.callFunction({
					name: "project",
					data: {
						type: "del",
						id: project._id,
					},
				})
				.then((res) => {
					uni.hideLoading();
					uni.showToast({
						title: "删除成功",
					});
					this.getProjectList();
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
	},
};
</script>

<style lang="scss" scoped>
.project-management {
	padding: 0 24rpx;
}

.project-card {
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

.project-card:active {
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
	background: linear-gradient(135deg, #a18cd1, #fbc2eb);
}

.project-name {
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
