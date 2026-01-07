<template>
	<view class="container">
		<u-navbar title="报销单" :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
		</u-navbar>
		<scroll-view :scroll-y="parsedData.length > 0" style="height: 100%">
			<view class="input-section input-section2" style="margin-top: 20rpx">
				<view class="half-width">
					<view class="input-title">报销人</view>
					<u-input v-model="teacher" maxlength="10" placeholder="请输入报销人"></u-input>
				</view>
				<view class="half-width">
					<view class="input-title">月份</view>
					<u-input v-model="month" maxlength="10" placeholder="请输入月份"></u-input>
				</view>
			</view>

			<view class="input-section">
				<view class="input-title">请输入文本数据</view>
				<u-textarea v-model="inputText" height="200rpx" maxlength="100000" placeholder="请输入需要解析的文本数据，每行一条记录"
					:autoHeight="false" :show-confirm-bar="false" confirm-type="换行">
				</u-textarea>

				<view v-if="inputText" class="parse-btn" type="primary" @click="parseData">解析数据</view>
			</view>
			<view class="data-section" v-if="parsedData.length > 0">
				<view class="section-title">
					解析结果
					<view class="result-summary">
						<u-tag size="mini" text="总计" type="info"></u-tag>
						<text class="summary-text">{{
							parsedData.length + " 条记录"
						}}</text>
					</view>
				</view>

				<view class="table-container">
					<view class="table-header">
						<text class="header-item" style="flex: 0.5">时间</text>
						<text class="header-item full-flex">店名/产品/车销</text>
						<text class="header-item full-flex">费用</text>
						<text class="header-item full-flex">报销凭证</text>
						<text class="header-item full-flex">报销人</text>
						<text class="header-item full-flex">操作</text>
					</view>

					<view v-for="(item, index) in parsedData" :key="index" :class="[
						'table-row',
						index % 2 !== 0 ? 'highlight-row' : '',
					]">
						<view class="table-cell" style="flex: 0.5" @tap="editField('date', index)">
							<text :class="[
								'cell-text',
								!item.date ? 'empty-cell' : '',
							]">
								{{ item.date || "-" }}
							</text>
						</view>

						<view class="table-cell full-flex" @tap="editField('msg', index)">
							<text :class="[
								'cell-text',
								!item.msg ? 'empty-cell' : '',
							]">
								{{ item.msg || "-" }}
							</text>
						</view>

						<view class="table-cell full-flex" @tap="editField('money', index)">
							<text :class="[
								'cell-text',
								!item.money ? 'empty-cell' : '',
							]">
								{{ item.money || "-" }}
							</text>
						</view>

						<view class="table-cell full-flex" @tap="editField('type', index)">
							<text :class="[
								'cell-text',
								!item.type ? 'empty-cell' : '',
							]">
								{{ item.type || "-" }}
							</text>
						</view>

						<view class="table-cell full-flex" @tap="editField('name', index)">
							<text :class="[
								'cell-text',
								!item.name ? 'empty-cell' : '',
							]">
								{{ item.name || "-" }}
							</text>
						</view>

						<view class="table-cell delete-cell">
							<view class="danger cell-text" @click="deleteRow(index)">删除</view>
						</view>
					</view>
				</view>
			</view>

			<view class="scrollBoxAfter" v-if="parsedData.length > 0"></view>
		</scroll-view>

		<view class="floating-btn postBtn" v-if="parsedData.length > 0 && !tempFilePath && !postLoading"
			@click="submitData">
			生成
		</view>
		<view class="floating-buttons">
			<template v-if="!!tempFilePath">
				<view class="floating-btn preview-btn" @click="yulan">
					预览
				</view>
				<view class="floating-btn share-btn" @click="fenxiang">
					分享
				</view>
			</template>
		</view>

		<u-popup :show="showEditPopup" mode="center" :round="10" closeable @close="closePopup"
			:safeAreaInsetBottom="false" :customStyle="{
				width: '80%',
			}">
			<view class="popup-content">
				<view class="popup-title">{{ "编辑" + currentEditLabel }}
				</view>
				<view class="current-field-info">{{
					baseArr[currentEditIndex]
				}}</view>
				<u-input v-model="currentEditValue" :placeholder="'请输入' + currentEditLabel" clearable />
				<view class="popup-actions">
					<u-button @click="closePopup">取消</u-button>
					<u-button @click="saveEdit">保存</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import mixin from "./mixin.js";
export default {
	mixins: [mixin],
	data() {
		return {
			teacher: "",
			month: "",
			inputText: "",
			parsedData: [],
			showEditPopup: false,
			currentEditValue: "",
			currentEditLabel: "",
			currentEditField: "",
			currentEditIndex: -1,
			tempFilePath: "",
			baseArr: [],
			postLoading: false,
		};
	},
	onShow() {
		this.teacher = uni.getStorageSync("teacher") || "贠清";
		setTimeout(() => {
			this.getText();
		}, 200);
	},
	methods: {
		async getText() {
			try {
				// 平台检查
				if (this.inputText) return;

				const res = await uni.getClipboardData({
					showToast: false,
				});
				const content =
					res && res[res.length - 1].data
						? res[res.length - 1].data.trim()
						: "";

				if (content && content != this.inputText) {
					uni.showModal({
						title: "检测到剪贴板内容",
						content: "是否解析剪贴板中的文本数据？",
						success: (res) => {
							if (res.confirm) {
								this.inputText = content;
								this.jieXi();
							}
						},
					});
				}
			} catch (error) { }
		},
		jieXi() {
			this.parsedData = [];
			this.tempFilePath = "";

			// 调用解析方法
			this.setInit(this.inputText);

			if (this.parsedData.length) {
				uni.showToast({
					title: "解析完成",
					icon: "success",
				});
			}
		},
		parseData() {
			uni.showModal({
				title: "提示",
				content: "数据错乱，请仔细检查，可手动编辑表格",
				success: (res) => {
					if (res.confirm) {
						if (!this.inputText.trim()) {
							uni.showToast({
								title: "请输入文本数据",
								icon: "none",
							});
							return;
						}
						this.jieXi();
					}
				},
			});
		},

		editField(field, index) {
			this.currentEditIndex = index;
			this.currentEditField = field;

			switch (field) {
				case "date":
					this.currentEditLabel = "时间";
					break;
				case "msg":
					this.currentEditLabel = "店名/产品/车销";
					break;
				case "money":
					this.currentEditLabel = "费用";
					break;
				case "type":
					this.currentEditLabel = "报销凭证";
					break;
				case "name":
					this.currentEditLabel = "报销人";
					break;
				default:
					this.currentEditLabel = "内容";
			}

			this.currentEditValue = this.parsedData[index][field] || "";
			this.showEditPopup = true;
		},

		saveEdit() {
			if (this.currentEditIndex >= 0 && this.currentEditField) {
				this.parsedData[this.currentEditIndex][this.currentEditField] =
					this.currentEditValue;
			}
			this.closePopup();
		},

		saveDel() {
			if (this.currentEditIndex >= 0 && this.currentEditField) {
				this.parsedData[this.currentEditIndex][this.currentEditField] =
					"";
			}
			this.closePopup();
		},

		closePopup() {
			this.showEditPopup = false;
		},

		deleteRow(index) {
			this.parsedData.splice(index, 1);
		},

		submitData() {
			// 生成Excel逻辑
			console.log("提交数据:", this.parsedData);
			// 实际应用中这里应该调用生成Excel的方法
			let that = this;
			uni.showLoading({
				title: "保存中...",
				icon: "none",
			});
			uniCloud.callFunction({
				name: "exportReports",
				data: {
					rows: this.parsedData,
					table: {
						month: this.month,
						allMoney: this.calcNum("money"),
					},
				},
				success: function (n) {
					uni.downloadFile({
						url: n.result.data.tempUrl,
						success: function (n) {
							uni.hideLoading();
							that.tempFilePath = n.tempFilePath;
						},
					});
				},
				fail: function (t) {
					console.log(t);
					e.hideLoading();
				},
			});
		},
		calcNum(e) {
			var t = 0;
			this.parsedData.forEach(function (n) {
				t += parseFloat(n[e] || 0);
			});
			return t;
		},
		yulan() {
			// 预览逻辑
			console.log("预览文件:", this.tempFilePath);
			uni.openDocument({
				filePath: this.tempFilePath,
				success: function (res) {
					console.log("打开文档成功");
				},
			});
		},

		fenxiang() {
			// 分享逻辑
			console.log("分享文件:", this.tempFilePath);

			wx.shareFileMessage({
				filePath: this.tempFilePath,
				fileName:
					this.parsedData[0].date.split(".")[0] + "月份报销.xlsx",
				success: function () { },
				fail: console.error,
			});
		},
	},
};
</script>

<style lang="scss">
.container {
	padding: 0 24rpx;
}

.input-section {
	background-color: rgba($color: #fff, $alpha: 0.4);
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	margin-bottom: 24rpx;
	padding: 20rpx;
	position: relative;
	transition: box-shadow 0.3s ease;

	&:hover {
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
	}

	::v-deep .u-textarea {
		background-color: rgba(0, 0, 0, 0) !important;
	}
}

.input-title {
	color: #333;
	font-size: 28rpx;
	font-weight: 600;
	margin-bottom: 20rpx;
	position: relative;
	display: flex;
	align-items: center;

	&::before {
		content: "";
		display: inline-block;
		width: 4rpx;
		height: 24rpx;
		background-color: #409eff;
		margin-right: 10rpx;
		border-radius: 2rpx;
	}
}

.input-section2 {
	align-items: center;
	display: flex;
	justify-content: space-between;
}

.parse-btn {
	border-radius: 8rpx;
	height: 80rpx;
	line-height: 80rpx;
	margin-top: 16rpx;
	font-weight: 500;
	transition: all 0.3s ease;
	margin-top: 10rpx;
	text-align: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 10rpx;
	font-size: 24rpx;
	color: #fff;
}

.data-section {
	background-color: rgba($color: #fff, $alpha: 0.4);
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	margin-bottom: 24rpx;
	padding: 0;
	position: relative;
	transition: box-shadow 0.3s ease;
	overflow: hidden;
}

.section-title {
	color: #333;
	font-size: 32rpx;
	font-weight: 600;
	justify-content: space-between;
	align-items: center;
	display: flex;
	padding: 15rpx 20rpx;
}

.result-summary {
	border-radius: 12rpx;
	padding: 10rpx 15rpx;
	align-items: center;
	display: flex;
}

.summary-text {
	color: #666;
	font-size: 26rpx;
	margin-left: 15rpx;
}

.table-container {
	border: 1rpx solid #eaeaea;
	overflow-x: auto;
	background-color: rgba($color: #fff, $alpha: 0.3);
}

.table-header {
	background-color: rgba($color: #fafafa, $alpha: 0.5);
	color: #333;
	display: flex;
	flex-wrap: nowrap;
	font-weight: 600;
	padding: 20rpx 0;
}

.header-item {
	font-size: 24rpx;
	overflow: hidden;
	padding: 10rpx;
	text-align: center;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
}

.table-row {
	border-bottom: 1rpx solid #f0f0f0;
	display: flex;
	flex-wrap: nowrap;
	transition: background-color 0.2s ease;
	background-color: rgba($color: #ffffff, $alpha: 0.5);

	&.highlight-row {
		background-color: rgba($color: #e6f7ff, $alpha: 0.5);
	}
}

.table-cell {
	align-items: center;
	border-bottom: 1rpx solid #f0f0f0;
	border-right: 1rpx solid #f0f0f0;
	display: flex;
	justify-content: center;
	text-align: center;
	flex: 1;
	font-size: 22rpx;
	padding: 15rpx 0;

	.danger {
		color: #f56c6c;
		font-weight: 500;
	}
}

.cell-text {
	padding: 4rpx 0;
	word-break: break-all;
}

.empty-cell {
	color: #c0c4cc;
	font-style: italic;
}

.delete-cell {
	flex: 1;
}

.floating-buttons {
	position: fixed;
	left: calc(50% - 180rpx);
	bottom: 100px;
	display: flex;
	justify-content: space-between;
	width: 360rpx;
	z-index: 999;
}

.full-flex {
	flex: 1;
}

.half-width {
	width: 49%;
}

.scrollBoxAfter {
	height: 100px;
}

.postBtn {
	background: linear-gradient(135deg, #12ef0e 0%, #13581e 100%);
	color: #fff;
	position: fixed;
	left: calc(50% - 50rpx);
	bottom: 100px;
}

.preview-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
}

.share-btn {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	color: #fff;
}

.floating-btn {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 2rpx 2rpx 10rpx rgba(0, 0, 0, 0.2);
	color: #fff;
	font-size: 24rpx;
}

.postBtn {
	background: linear-gradient(135deg, #12ef0e 0%, #13581e 100%);
	color: #fff;
	position: fixed;
	left: calc(50% - 50rpx);
	bottom: 100px;
}

.preview-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
}

.share-btn {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	color: #fff;
}

.current-field-info {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 20rpx;
	padding: 10rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
}

.half-width {
	width: 49%;
}

.full-flex {
	flex: 1;
}

.scrollBoxAfter {
	height: 100px;
}
</style>
