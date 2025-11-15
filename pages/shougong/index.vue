<template>
	<view class="container">
		<!-- <view class="input-section">
			<view>
				<view class="input-title">操作</view>
				<u--input
					v-model="operation"
					maxlength="10"
					placeholder="请输入操作"
				></u--input>
			</view>
		</view> -->

		<view class="input-section">
			<view class="input-title">请输入文本数据</view>
			<u--textarea
				v-model="inputText"
				height="400rpx"
				maxlength="100000"
				placeholder="请输入需要解析的文本数据，每行一条记录"
				:autoHeight="false"
				:showConfirmBar="false"
				confirmType="换行"
			></u--textarea>

			<view class="input-title" style="height: 30rpx; width: 100%"></view>

			<u-button
				v-if="inputText"
				type="primary"
				@click="parseData"
				class="parse-btn"
			>
				解析数据
			</u-button>
		</view>

		<view class="data-section" v-if="parsedData.length > 0">
			<view class="section-title">
				解析结果
				<view class="result-summary">
					<u-tag size="mini" text="总计" type="info"></u-tag>
					<text class="summary-text"
						>{{ parsedData.length }} 条记录</text
					>
				</view>
			</view>

			<view class="table-container">
				<view class="table-header">
					<text class="header-item" style="flex: 0.5">时间</text>
					<text class="header-item shop-name-header">店铺</text>
					<text class="header-item" style="flex: 1">顾客</text>
					<text class="header-item" style="flex: 1">项目</text>
					<text class="header-item" style="flex: 1">操作</text>
					<text class="header-item" style="flex: 1">管理</text>
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
						style="flex: 0.5"
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
						class="table-cell"
						style="flex: 1"
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
						class="table-cell"
						style="flex: 1"
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
						class="table-cell"
						style="flex: 1"
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

					<view class="table-cell" style="flex: 1">
						<u-button
							type="error"
							size="mini"
							@click="deleteRow(index)"
						>
							删除
						</u-button>
					</view>
				</view>
			</view>
		</view>

		<view class="bottom-section" v-if="parsedData.length > 0">
			<u-button type="success" @click="submitData" class="submit-btn">
				完成并生成Excel
			</u-button>
		</view>

		<view class="bottom-section2" v-if="tempFilePath">
			<u-button type="primary" @click="yulan" class="submit-btn">
				预览
			</u-button>
			<u-button type="warning" @click="fenxiang" class="submit-btn">
				分享
			</u-button>
		</view>

		<u-popup
			:show="showEditPopup"
			mode="center"
			:round="10"
			closeable
			@close="showEditPopup = false"
		>
			<view class="popup-content">
				<view class="popup-title">编辑{{ currentEditLabel }}</view>
				<u--input
					v-model="currentEditValue"
					:placeholder="'请输入' + currentEditLabel"
				></u--input>
				<view class="popup-actions">
					<u-button type="primary" @click="saveEdit"> 保存 </u-button>
					<u-button type="error" @click="saveDel"> 删除 </u-button>
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

<style lang="scss" scoped>
.container {
	padding: 20rpx;
}

.input-section {
	margin-bottom: 30rpx;

	.input-title {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 10rpx;
	}
}

.parse-btn {
	margin-top: 20rpx;
}

.data-section {
	margin-top: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.result-summary {
	display: flex;
	align-items: center;

	.summary-text {
		margin-left: 10rpx;
		font-size: 26rpx;
		color: #666;
	}
}

.table-container {
	border: 1rpx solid #e0e0e0;
	border-radius: 10rpx;
	overflow: hidden;
}

.table-header {
	display: flex;
	background-color: #f5f5f5;
	padding: 20rpx;
	font-weight: bold;
}

.header-item {
	flex: 1;
	text-align: center;
	font-size: 26rpx;
}

.shop-name-header {
	flex: 1.5;
}

.table-row {
	display: flex;
	padding: 20rpx;
	border-bottom: 1rpx solid #e0e0e0;

	&:last-child {
		border-bottom: none;
	}
}

.highlight-row {
	background-color: #fafafa;
}

.table-cell {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	min-height: 60rpx;

	.cell-text {
		font-size: 26rpx;
		color: #333;
	}

	.empty-cell {
		color: #999;
	}
}

.shop-name-cell {
	flex: 1.5;
}

.bottom-section,
.bottom-section2 {
	margin-top: 40rpx;
	display: flex;
	justify-content: center;
}

.bottom-section2 {
	.submit-btn {
		margin: 0 10rpx;
	}
}

.submit-btn {
	width: 80%;
}

.popup-content {
	padding: 40rpx;
	width: 600rpx;
	box-sizing: border-box;
}

.popup-title {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 30rpx;
}

.popup-actions {
	display: flex;
	justify-content: space-around;
	margin-top: 40rpx;

	::v-deep .u-button {
		flex: 1;
		margin: 0 20rpx;
	}
}
</style>
