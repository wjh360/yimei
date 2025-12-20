<template>
	<view class="container">
		<u-navbar title="手工操作" :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
		</u-navbar>
		<scroll-view :scroll-y="parsedData.length > 0" style="height: 100%">
			<view class="input-section">
				<view class="input-title">请输入文本数据</view>
				<u--textarea
					v-model="inputText"
					height="200rpx"
					maxlength="100000"
					placeholder="请输入需要解析的文本数据，每行一条记录"
					:autoHeight="false"
					:showConfirmBar="false"
					confirmType="换行"
				></u--textarea>
				<view
					v-if="inputText"
					class="parse-btn"
					type="primary"
					@click="parseData"
					>解析数据</view
				>
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
						<text class="header-item">时间</text>
						<text class="header-item shop-name-header">店铺</text>
						<text class="header-item full-flex">顾客</text>
						<text class="header-item full-flex">项目</text>
						<text class="header-item full-flex">操作</text>
						<text class="header-item full-flex">管理</text>
					</view>

					<view
						v-for="(item, index) in parsedData"
						:key="index"
						:class="[
							'table-row',
							index % 2 !== 0 ? 'highlight-row' : '',
						]"
					>
						<view
							class="table-cell"
							@tap="editField('date', index)"
						>
							<text
								:class="[
									'cell-text',
									!item.date ? 'empty-cell' : '',
								]"
							>
								{{ item.date || "-" }}
							</text>
						</view>

						<view
							class="table-cell shop-name-cell"
							@tap="editField('shopName', index)"
						>
							<text
								:class="[
									'cell-text',
									!item.shopName ? 'empty-cell' : '',
								]"
							>
								{{ item.shopName || "-" }}
							</text>
						</view>

						<view
							class="table-cell full-flex"
							@tap="editField('customer', index)"
						>
							<text
								:class="[
									'cell-text',
									!item.customer ? 'empty-cell' : '',
								]"
							>
								{{ item.customer || "-" }}
							</text>
						</view>

						<view
							class="table-cell full-flex"
							@tap="editField('project', index)"
						>
							<text
								:class="[
									'cell-text',
									!item.project ? 'empty-cell' : '',
								]"
							>
								{{ item.project || "-" }}
							</text>
						</view>

						<view
							class="table-cell full-flex"
							@tap="editField('operation', index)"
						>
							<text
								:class="[
									'cell-text',
									!item.operation ? 'empty-cell' : '',
								]"
							>
								{{ item.operation || "-" }}
							</text>
						</view>

						<view class="table-cell delete-cell">
							<view
								class="danger cell-text"
								@click="deleteRow(index)"
								>删除</view
							>
						</view>
					</view>
				</view>
			</view>
			<view class="scrollBoxAfter" v-if="parsedData.length > 0"></view>
		</scroll-view>
		<view
			class="floating-btn postBtn"
			v-if="parsedData.length > 0 && !tempFilePath"
			@click="submitData"
		>
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

		<u-popup
			:show="showEditPopup"
			mode="center"
			:round="10"
			closeable
			@close="showEditPopup = false"
			:safeAreaInsetBottom="false"
			:customStyle="{
				width: '80%',
			}"
		>
			<view class="popup-content">
				<view class="popup-title"
					>{{ "编辑" + currentEditLabel }}
				</view>
				<u-input
					v-model="currentEditValue"
					:placeholder="'请输入' + currentEditLabel"
					clearable
				/>
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
			operation: "",
			inputText: "",
			parsedData: [],
			showEditPopup: false,
			currentEditValue: "",
			currentEditLabel: "",
			currentEditField: "",
			currentEditIndex: -1,
			tempFilePath: "",
		};
	},
	methods: {
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

						this.parsedData = [];
						this.tempFilePath = "";

						// 调用解析方法
						this.setInit(this.inputText);

						if (this.parsedData.length) {
							uni.showToast({
								title:
									"解析完成，共" +
									this.parsedData.length +
									"条记录",
								icon: "success",
							});
						}
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
				case "shopName":
					this.currentEditLabel = "店铺";
					break;
				case "customer":
					this.currentEditLabel = "顾客";
					break;
				case "project":
					this.currentEditLabel = "项目";
					break;
				case "operation":
					this.currentEditLabel = "操作";
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
			this.showEditPopup = false;
		},

		saveDel() {
			if (this.currentEditIndex >= 0 && this.currentEditField) {
				this.parsedData[this.currentEditIndex][this.currentEditField] =
					"";
			}
			this.showEditPopup = false;
		},

		deleteRow(index) {
			this.parsedData.splice(index, 1);
		},

		submitData() {
			// 生成Excel逻辑
			console.log("提交数据:", this.parsedData);
			// 实际应用中这里应该调用生成Excel的方法
			uni.showLoading({
				title: "保存中...",
				icon: "none",
			});
			uniCloud
				.callFunction({
					name: "shougongXlsx",
					data: {
						rows: this.parsedData,
						table: {
							month: String(this.parsedData[0].date).split(
								"."
							)[0],
							teacher: this.operation,
						},
					},
				})
				.then((res) => {
					uni.showToast({
						title: "生成Excel成功",
						icon: "success",
					});
					let that = this;
					uni.downloadFile({
						url: res.result.data.tempUrl,
						success: function (n) {
							uni.hideLoading();
							that.tempFilePath = n.tempFilePath;
						},
					});
				})
				.catch((err) => {
					uni.showToast({
						title: "生成Excel失败",
						icon: "none",
					});
				});
		},

		yulan() {
			// 预览逻辑
			// 预览Excel文件的逻辑
			console.log("预览文件");

			// 这里应该打开文件预览
			uni.openDocument({
				filePath: this.tempFilePath,
				success: function (res) {
					console.log("打开文档成功");
				},
			});
		},

		fenxiang() {
			// 分享逻辑

			// #ifdef MP-WEIXIN
			wx.shareFileMessage({
				filePath: this.tempFilePath,
				fileName:
					String(this.parsedData[0].date).split(".")[0] +
					"月份手工操作记录表.xlsx",
				success: function () {},
				fail: console.error,
			});
			// #endif
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

.shop-name-header {
	flex: 2;
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

.shop-name-cell {
	// justify-content: start;
	// overflow: hidden;
	// text-align: center;
	// text-overflow: hidden;
	// white-space: nowrap;
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

.full-flex {
	flex: 1;
}

.scrollBoxAfter {
	height: 100rpx;
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
</style>
