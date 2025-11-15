<template>
	<view class="container">
		<view class="input-section input-section2">
			<view style="width: 49%">
				<view class="input-title">报销人</view>
				<u--input
					v-model="teacher"
					maxlength="10"
					placeholder="请输入报销人"
				></u--input>
			</view>
			<view style="width: 49%">
				<view class="input-title">月份</view>
				<u--input
					v-model="month"
					maxlength="10"
					placeholder="请输入月份"
				></u--input>
			</view>
		</view>

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
					<text class="header-item" style="flex: 1"
						>店名/产品/车销</text
					>
					<text class="header-item" style="flex: 1">费用</text>
					<text class="header-item" style="flex: 1">报销凭证</text>
					<text class="header-item" style="flex: 1">报销人</text>
					<text class="header-item" style="flex: 1">操作</text>
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
						class="table-cell"
						style="flex: 1"
						@tap="editField('msg', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.msg ? 'empty-cell' : '',
							]"
						>
							{{ item.msg || "-" }}
						</text>
					</view>

					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField('money', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.money ? 'empty-cell' : '',
							]"
						>
							{{ item.money || "-" }}
						</text>
					</view>

					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField('type', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.type ? 'empty-cell' : '',
							]"
						>
							{{ item.type || "-" }}
						</text>
					</view>

					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField('name', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.name ? 'empty-cell' : '',
							]"
						>
							{{ item.name || "-" }}
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
			@close="closePopup"
		>
			<view class="popup-content">
				<view class="popup-title">编辑{{ currentEditLabel }}</view>
				<view class="current-field-info">{{
					baseArr[currentEditIndex]
				}}</view>
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
				success: function () {},
				fail: console.error,
			});
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

.input-section2 {
	display: flex;
	justify-content: space-between;
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

.current-field-info {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 20rpx;
	padding: 10rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
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
