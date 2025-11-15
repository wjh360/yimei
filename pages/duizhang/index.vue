<template>
	<view class="container">
		<view class="input-section input-section2">
			<view style="width: 49%">
				<view class="input-title">导师</view>
				<u-input
					v-model="teacher"
					maxlength="10"
					placeholder="请输入导师"
				></u-input>
			</view>
			<view style="width: 49%">
				<view class="input-title">操作</view>
				<u-input
					v-model="operation"
					maxlength="10"
					placeholder="请输入操作"
				></u-input>
			</view>
		</view>

		<view class="input-section">
			<view class="input-title">请输入文本数据</view>
			<u-textarea
				v-model="inputText"
				height="400rpx"
				maxlength="100000"
				placeholder="请输入需要解析的文本数据，每行一条记录"
				:show-confirm-bar="false"
				confirm-type="换行"
			>
			</u-textarea>
			<view class="input-title" style="height: 30rpx; width: 100%"></view>
			<u-button
				v-if="inputText"
				class="parse-btn"
				type="primary"
				@click="parseData"
				>解析数据</u-button
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
					<text class="header-item" style="flex: 0.5">时间</text>
					<text class="header-item" style="flex: 0.5">导师</text>
					<text class="header-item shop-name-header">店铺</text>
					<text class="header-item" style="flex: 1">顾客</text>
					<text class="header-item" style="flex: 1">项目</text>
					<text class="header-item" style="flex: 1">业绩</text>
					<text class="header-item" style="flex: 1">回款</text>
					<text class="header-item" style="flex: 1">分成</text>
					<text class="header-item" style="flex: 1">咨询</text>
					<text class="header-item" style="flex: 1">操作</text>
					<text class="header-item" style="flex: 1">商务</text>
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
						@tap="editField(item, 'date', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.date ? 'empty-cell' : '',
							]"
							>{{ item.date || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 0.5"
						@tap="editField(item, 'teacher', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.teacher ? 'empty-cell' : '',
							]"
							>{{ item.teacher || "-" }}</text
						>
					</view>
					<view
						class="table-cell shop-name-cell"
						@tap="editField(item, 'shopName', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.shopName ? 'empty-cell' : '',
							]"
							>{{ item.shopName || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField(item, 'customer', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.customer ? 'empty-cell' : '',
							]"
							>{{ item.customer || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField(item, 'project', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.project ? 'empty-cell' : '',
							]"
							>{{ item.project || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField(item, 'performance', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.performance ? 'empty-cell' : '',
							]"
							>{{ item.performance || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField(item, 'refund', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.refund ? 'empty-cell' : '',
							]"
							>{{ item.refund || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField(item, 'share', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.share ? 'empty-cell' : '',
							]"
							>{{ item.share || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField(item, 'consultation', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.consultation ? 'empty-cell' : '',
							]"
							>{{ item.consultation || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField(item, 'operation', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.operation ? 'empty-cell' : '',
							]"
							>{{ item.operation || "-" }}</text
						>
					</view>
					<view
						class="table-cell"
						style="flex: 1"
						@tap="editField(item, 'business', index)"
					>
						<text
							:class="[
								'cell-text',
								!item.business ? 'empty-cell' : '',
							]"
							>{{ item.business || "-" }}</text
						>
					</view>
					<view class="table-cell" style="flex: 1">
						<u-button
							size="mini"
							type="error"
							@click="deleteRow(index)"
							>删除</u-button
						>
					</view>
				</view>
			</view>
		</view>

		<view class="input-section" v-if="parsedData.length > 0">
			<view class="input-title">总业绩</view>
			<u-textarea
				v-model="allYeji"
				:auto-height="true"
				maxlength="1000"
				placeholder="请输入总业绩"
			>
			</u-textarea>
		</view>

		<view class="input-section" v-if="parsedData.length > 0">
			<view class="input-title">总回款</view>
			<u-textarea
				v-model="allHuiKuan"
				:auto-height="true"
				maxlength="1000"
				placeholder="请输入总回款"
			>
			</u-textarea>
		</view>

		<view class="input-section" v-if="parsedData.length > 0">
			<view class="input-title">备注</view>
			<u-textarea
				v-model="remark"
				:auto-height="true"
				maxlength="1000"
				placeholder="请输入备注"
			>
			</u-textarea>
		</view>

		<view class="bottom-section" v-if="parsedData.length > 0">
			<u-button class="submit-btn" type="success" @click="submitData"
				>完成并生成Excel</u-button
			>
		</view>

		<view class="bottom-section2" v-if="!!tempFilePath">
			<u-button class="submit-btn" type="primary" @click="yulan"
				>预览</u-button
			>
			<u-button class="submit-btn" type="warning" @click="fenxiang"
				>分享</u-button
			>
		</view>

		<u-popup
			:show="showEditPopup"
			mode="center"
			:round="10"
			closeable
			@close="closePopup"
		>
			<view class="popup-content">
				<view class="popup-title">{{ "编辑" + currentEditLabel }}</view>
				<view class="current-field-info">{{
					"" + baseArr[currentEditIndex] + ""
				}}</view>
				<u-input
					v-model="currentEditValue"
					:placeholder="'请输入' + currentEditLabel"
				>
				</u-input>
				<view class="popup-actions">
					<u-button type="primary" @click="saveEdit">保存</u-button>
					<u-button type="error" @click="saveDel">删除</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
// 引入私有mixin
import duizhangMixin from "./mixin/mixin.js";

export default {
	mixins: [duizhangMixin],
	data() {
		return {
			inputText: "",
			parsedData: [],
			showEditPopup: false,
			currentEditValue: "",
			currentEditField: "",
			currentEditIndex: -1,
			currentEditLabel: "",
			tempFilePath: "",
			baseArr: [],
			remark: "",
			shopNames: [],
			projects: [],
			allYeji: "",
			allHuiKuan: "",
			teacher: "",
			operation: "",
		};
	},
	onShow() {
		this.getShopList();
		this.getProjectList();
		this.teacher = uni.getStorageSync("teacher") || "贠清";
		this.operation = uni.getStorageSync("operation") || "薇薇";
	},
	watch: {
		parsedData: {
			handler(newVal) {
				if (newVal && newVal.length) {
					this.allYeji = this.calcNum("performance");
					this.allHuiKuan = this.calcNum("refund");
					console.log(
						"计算总业绩和回款情况",
						this.allYeji,
						this.allHuiKuan
					);
				}
			},
			deep: true,
		},
	},
	methods: {
		getShopList() {
			// 这里应该调用云函数获取店铺列表
			// 在uni-app中，可能需要使用uniCloud或其他方式
			uniCloud
				.callFunction({
					name: "shop",
					data: {
						type: 3,
					},
				})
				.then((res) => {
					this.shopNames = res.result.data || [];
				});
		},
		getProjectList() {
			// 这里应该调用云函数获取项目列表
			uniCloud
				.callFunction({
					name: "project",
					data: {
						type: 3,
					},
				})
				.then((res) => {
					this.projects = res.result.data || [];
				});
		},
		parseData() {
			uni.showModal({
				title: "提示",
				content:
					"如果当前文本中存在数据库中没有的店铺，可能造成解析数据错乱，跳转到店铺录入页面重新录入即可。",
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
		editField(item, field, index) {
			this.currentEditField = field;
			this.currentEditIndex = index;
			this.currentEditValue = item[field] || this.baseArr[index] || "";
			this.currentEditLabel = {
				teacher: "导师",
				shopName: "店铺名称",
				date: "时间",
				customer: "操作顾客名单",
				project: "操作项目",
				performance: "业绩",
				refund: "回款情况",
				share: "分成",
				consultation: "咨询",
				operation: "操作",
				business: "商务",
			}[field];
			this.showEditPopup = true;
			console.log("编辑字段:", field, "值:", this.currentEditValue);
		},
		saveEdit() {
			if (this.currentEditIndex >= 0 && this.currentEditField) {
				this.$set(
					this.parsedData[this.currentEditIndex],
					this.currentEditField,
					this.currentEditValue
				);
			}
			this.showEditPopup = false;
			uni.showToast({
				title: "保存成功",
				icon: "success",
			});
		},
		saveDel() {
			if (this.currentEditIndex >= 0 && this.currentEditField) {
				this.parsedData[this.currentEditIndex][this.currentEditField] =
					"";
			}
			this.showEditPopup = false;
			uni.showToast({
				title: "保存成功",
				icon: "success",
			});
		},
		deleteRow(index) {
			uni.showModal({
				title: "提示",
				content: "确定要删除这条记录吗？",
				success: (res) => {
					if (res.confirm) {
						this.parsedData.splice(index, 1);
						uni.showToast({
							title: "删除成功",
							icon: "success",
						});
					}
				},
			});
		},
		submitData() {
			// 提交数据并生成Excel的逻辑
			console.log("提交数据");
			uni.showLoading({
				title: "保存中...",
				icon: "none",
			});
			// 这里应该调用云函数生成Excel
			uniCloud
				.callFunction({
					name: "generateXlsx",
					data: {
						rows: this.parsedData,
						table: {
							month: this.inputText.split(".")[0],
							allYeji: this.allYeji,
							allechoMoney: this.allHuiKuan,
							remark: this.remark,
						},
					},
				})
				.then((res) => {
					// this.tempFilePath = res.result.data.tempUrl;
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
			// 分享Excel文件的逻辑
			console.log("分享文件");

			// #ifdef MP-WEIXIN
			wx.shareFileMessage({
				filePath: this.tempFilePath,
				fileName:
					this.parsedData[0].date.split(".")[0] +
					"月份账目报表【工资情况】.xlsx",
				success: function () {},
				fail: console.error,
			});

			// #endif

			// uni.showToast({
			// 	title: "分享成功",
			// 	icon: "success",
			// });
		},
		closePopup() {
			this.showEditPopup = false;
		},

		calcNum(field) {
			// 计算指定字段的总和
			let total = 0;
			this.parsedData.forEach((item) => {
				const value = parseFloat(item[field] || 0);
				if (!isNaN(value)) {
					total += value;
				}
			});
			return total.toString();
		},
	},
};
</script>

<style>
.container {
	background-color: #f5f5f5;
	padding: 20rpx;
}

.input-section {
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 20rpx;
	padding: 30rpx;
}

.input-section2 {
	align-items: center;
	display: flex;
	justify-content: space-between;
}

.input-title {
	color: #333;
	font-size: 36rpx;
	font-weight: 700;
	margin-bottom: 20rpx;
}

.parse-btn {
	border-radius: 12rpx;
	height: 80rpx;
	line-height: 80rpx;
}

.data-section {
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 20rpx;
	padding: 30rpx;
}

.section-title {
	color: #333;
	font-size: 36rpx;
	font-weight: 700;
	justify-content: space-between;
	margin-bottom: 20rpx;
	align-items: center;
	display: flex;
}

.result-summary {
	background-color: #f0f8ff;
	border-radius: 12rpx;
	padding: 10rpx;
	align-items: center;
	display: flex;
}

.summary-text {
	color: #666;
	font-size: 28rpx;
	margin-left: 15rpx;
}

.table-container {
	border: 1rpx solid #eee;
	border-radius: 12rpx;
	overflow-x: auto;
}

.table-header {
	background: linear-gradient(90deg, #409eff, #1a73e8);
	color: #fff;
	display: flex;
	flex-wrap: nowrap;
	font-weight: 700;
	min-width: 2000rpx;
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
	border-bottom: 1rpx solid #eee;
	display: flex;
	flex-wrap: nowrap;
	min-width: 2000rpx;
	transition: background-color 0.2s;
}

.table-row.highlight-row {
	background-color: #e6f7ff;
}

.table-row:hover {
	background-color: #f9f9f9;
}

.table-cell {
	align-items: center;
	border-bottom: 1rpx solid #999;
	border-right: 1rpx solid #999;
	display: flex;
	justify-content: center;
	text-align: center;
	flex: 1;
	font-size: 22rpx;
	padding: 10rpx;
}

.shop-name-cell {
	justify-content: start;
	overflow: hidden;
	text-align: left;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.cell-text {
	border-radius: 6rpx;
	padding: 8rpx 12rpx;
	transition: all 0.2s;
	word-break: break-all;
}

.cell-text:hover {
	background-color: #e6f7ff;
	transform: scale(1.05);
}

.empty-cell {
	color: #ccc;
	font-style: italic;
}

.action-cell {
	flex: 1;
}

.bottom-section,
.bottom-section2 {
	border-radius: 16rpx;
	padding: 10rpx 30rpx;
	text-align: center;
}

.bottom-section2 {
	display: flex;
	justify-content: space-around;
	margin-bottom: 30rpx;
}

.bottom-section2 .submit-btn {
	width: 49% !important;
}

.submit-btn {
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	font-size: 32rpx;
	height: 80rpx;
	line-height: 80rpx;
}

.popup-content {
	padding: 40rpx;
	width: 650rpx;
}

.popup-title {
	color: #333;
	font-size: 36rpx;
	font-weight: 700;
	margin-bottom: 30rpx;
	text-align: center;
}

.current-field-info {
	margin-bottom: 30rpx;
	text-align: center;
}

.popup-actions {
	display: flex;
	margin-top: 40rpx;
	text-align: center;
}
</style>
