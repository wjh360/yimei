<template>
	<view class="file-reader-container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<view class="title">文件阅读器</view>
			<view class="subtitle">选择并查看聊天记录中的文件</view>
		</view>

		<!-- 文件选择区域 -->
		<view class="file-selector-card">
			<view class="card-header">
				<u-icon name="folder-open" size="28" color="#4158d0"></u-icon>
				<text class="card-title">选择文件</text>
			</view>

			<view class="file-types">
				<view class="type-tag" v-for="(type, index) in fileTypes" :key="index">
					{{ type }}
				</view>
			</view>

			<view class="select-btn" @click="chooseFile">
				<u-icon name="plus-circle" size="24" color="#fff"></u-icon>
				<text>从聊天记录中选择文件</text>
			</view>
		</view>

		<!-- 文件信息展示区 -->
		<view class="file-info-card" v-if="selectedFile.name">
			<view class="card-header">
				<u-icon name="file-text" size="28" color="#4158d0"></u-icon>
				<text class="card-title">文件信息</text>
			</view>

			<view class="file-details">
				<view class="detail-item">
					<text class="label">文件名：</text>
					<text class="value">{{ selectedFile.name }}</text>
				</view>
				<view class="detail-item">
					<text class="label">文件大小：</text>
					<text class="value">{{ formatFileSize(selectedFile.size) }}</text>
				</view>
				<view class="detail-item">
					<text class="label">文件类型：</text>
					<text class="value">{{ selectedFile.type || '未知' }}</text>
				</view>
				<view class="detail-item">
					<text class="label">最后修改：</text>
					<text class="value">{{ selectedFile.lastModified || '未知' }}</text>
				</view>
			</view>

			<view class="action-buttons">
				<view class="action-btn read-btn" @click="readFileContent">
					<u-icon name="eye" size="20" color="#fff"></u-icon>
					<text>读取内容</text>
				</view>
				<view class="action-btn copy-btn" @click="copyFileContent" v-if="fileContent">
					<u-icon name="copy" size="20" color="#fff"></u-icon>
					<text>复制内容</text>
				</view>
			</view>
		</view>

		<!-- 文件内容展示区 -->
		<view class="file-content-card" v-if="fileContent">
			<view class="card-header">
				<u-icon name="file-text-fill" size="28" color="#4158d0"></u-icon>
				<text class="card-title">文件内容</text>
			</view>

			<view class="content-container">
				<view class="content-text">{{ fileContent }}</view>
			</view>
		</view>

		<!-- 加载提示 -->
		<u-loading-page :show="loading" loading-text="读取文件中..."></u-loading-page>
	</view>
</template>

<script>
import m_excel from "@/uni_modules/m-excel/m-excel/js_sdk/index.js"
export default {
	name: "FileReaderPage",
	data() {
		return {
			selectedFile: {
				name: '',
				path: '',
				size: 0,
				type: '',
				lastModified: ''
			},
			fileContent: '',
			loading: false,
			fileTypes: ['txt', 'doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'json', 'xml', 'csv'],
			curFile: null,
		};
	},
	onLoad() {
		// 页面加载时的初始化操作 
		console.log(m_excel);
	},
	methods: {
		// 选择文件
		chooseFile() {

			wx.chooseMessageFile({
				count: 1,
				type: 'file',
				success: (res) => {
					if (res.tempFiles && res.tempFiles.length > 0) {
						const file = res.tempFiles[0];
						this.selectedFile = {
							name: file.name,
							path: file.path,
							size: file.size,
							type: this.getFileType(file.name),
							lastModified: this.formatDate(file.lastModified || Date.now())
						};
						this.curFile = file;
						// 重置文件内容
						this.fileContent = '';
					}
				},
				fail: (err) => {
					console.error('选择文件失败：', err);
					uni.showToast({
						title: '选择文件失败',
						icon: 'none'
					});
				}
			});
		},

		// 读取文件内容
		async readFileContent() {
			if (!this.selectedFile.path) {
				uni.showToast({
					title: '请先选择文件',
					icon: 'none'
				});
				return;
			}

			this.loading = true;
			m_excel.read(this.curFile).then(res => {
				console.log(res);
			})
		},

		// 复制文件内容
		copyFileContent() {
			if (!this.fileContent) {
				uni.showToast({
					title: '没有可复制的内容',
					icon: 'none'
				});
				return;
			}

			uni.setClipboardData({
				data: this.fileContent,
				success: () => {
					uni.showToast({
						title: '内容已复制到剪贴板',
						icon: 'success'
					});
				},
				fail: () => {
					uni.showToast({
						title: '复制失败',
						icon: 'none'
					});
				}
			});
		},

		// 获取文件类型
		getFileType(fileName) {
			const extension = fileName.split('.').pop().toLowerCase();
			const types = {
				'txt': '文本文件',
				'doc': 'Word文档',
				'docx': 'Word文档',
				'pdf': 'PDF文档',
				'xls': 'Excel表格',
				'xlsx': 'Excel表格',
				'ppt': 'PowerPoint演示文稿',
				'pptx': 'PowerPoint演示文稿',
				'json': 'JSON数据',
				'xml': 'XML文件',
				'csv': 'CSV数据'
			};
			return types[extension] || '未知类型';
		},

		// 格式化文件大小
		formatFileSize(size) {
			if (size < 1024) {
				return size + ' B';
			} else if (size < 1024 * 1024) {
				return (size / 1024).toFixed(2) + ' KB';
			} else {
				return (size / (1024 * 1024)).toFixed(2) + ' MB';
			}
		},

		// 格式化日期
		formatDate(timestamp) {
			const date = new Date(timestamp);
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			const seconds = date.getSeconds().toString().padStart(2, '0');

			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		}
	},
	computed: {},
	watch: {},
	mounted() { }
};
</script>

<style lang="scss" scoped>
.file-reader-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
	padding: 40rpx 30rpx;
}

/* 顶部标题区域 */
.header {
	text-align: center;
	margin-bottom: 40rpx;

	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.subtitle {
		font-size: 28rpx;
		color: #666;
	}
}

/* 卡片通用样式 */
.file-selector-card,
.file-info-card,
.file-content-card {
	background-color: #fff;
	border-radius: 24rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
	padding: 30rpx;
	margin-bottom: 30rpx;

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 25rpx;

		.card-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-left: 15rpx;
		}
	}
}

/* 文件类型标签 */
.file-types {
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 30rpx;

	.type-tag {
		background-color: rgba(65, 88, 208, 0.1);
		color: #4158d0;
		font-size: 24rpx;
		padding: 8rpx 16rpx;
		border-radius: 30rpx;
		margin-right: 15rpx;
		margin-bottom: 15rpx;
	}
}

/* 选择文件按钮 */
.select-btn {
	background: linear-gradient(135deg, #4158d0 0%, #c850c0 100%);
	color: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;

	text {
		margin-left: 15rpx;
		font-size: 30rpx;
		font-weight: 500;
	}

	&:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 15rpx rgba(65, 88, 208, 0.3);
	}
}

/* 文件详情 */
.file-details {
	.detail-item {
		display: flex;
		padding: 15rpx 0;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.label {
			width: 160rpx;
			color: #666;
			font-size: 28rpx;
		}

		.value {
			flex: 1;
			color: #333;
			font-size: 28rpx;
			word-break: break-all;
		}
	}
}

/* 操作按钮 */
.action-buttons {
	display: flex;
	margin-top: 30rpx;

	.action-btn {
		flex: 1;
		height: 80rpx;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 10rpx;
		transition: all 0.3s ease;

		text {
			margin-left: 10rpx;
			color: #fff;
			font-size: 28rpx;
			font-weight: 500;
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.read-btn {
		background: linear-gradient(135deg, #4158d0 0%, #7b68ee 100%);
	}

	.copy-btn {
		background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
	}
}

/* 文件内容展示区 */
.content-container {
	max-height: 600rpx;
	overflow-y: auto;
	background-color: #f8f9fa;
	border-radius: 16rpx;
	padding: 20rpx;

	.content-text {
		font-size: 28rpx;
		line-height: 1.6;
		color: #333;
		white-space: pre-wrap;
		word-break: break-all;
	}
}
</style>
