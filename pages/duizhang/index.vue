<template>
	<view class="container">
		<u-navbar title="对账单" :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
		</u-navbar>
		<scroll-view :scroll-y="parsedData.length > 0" style="height: 100%">
			<view
				class="input-section input-section2"
				style="margin-top: 20rpx"
			>
				<view class="half-width">
					<view class="input-title">导师</view>
					<u-input
						v-model="teacher"
						maxlength="10"
						placeholder="请输入导师"
					></u-input>
				</view>
				<view class="half-width">
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
					height="200rpx"
					maxlength="100000"
					placeholder="请输入需要解析的文本数据，每行一条记录"
					:show-confirm-bar="false"
					confirm-type="换行"
				>
				</u-textarea>

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
						<text class="header-item full-flex">时间</text>
						<text class="header-item full-flex">店铺</text>
						<text class="header-item full-flex">顾客</text>
						<text class="header-item full-flex">项目</text>
						<text class="header-item full-flex">业绩</text>
						<text class="header-item full-flex">回款</text>
						<text class="header-item full-flex">管理</text>
					</view>

					<view
						v-for="(item, index) in parsedData"
						:key="index"
						:class="[
							'table-row',
							index % 2 !== 0 ? 'highlight-row' : '',
							{
								isErrName:
									item.customer && item.customer.length > 3,
							},
						]"
					>
						<view
							class="table-cell"
							v-for="edItem in edList"
							:key="edItem"
							@tap="editField(item, edItem, index)"
							:class="[filterRefund(item[edItem], edItem)]"
						>
							<view class="cell-text">
								{{
									parseFloat(item[edItem])
										? parseFloat(item[edItem])
										: item[edItem] || "-"
								}}
							</view>
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

			<view
				class="input-section flex-layout"
				v-if="parsedData.length > 0"
			>
				<view class="flex-1 flex2">
					<view class="input-title title-small">总业绩</view>
					<u-textarea
						v-model="allYeji"
						:auto-height="true"
						maxlength="1000"
						placeholder="请输入总业绩"
					>
					</u-textarea>
				</view>

				<view class="flex-1 margin-left-10 flex2">
					<view class="input-title title-small">总回款</view>
					<u-textarea
						v-model="allHuiKuan"
						:auto-height="true"
						maxlength="1000"
						placeholder="请输入总回款"
					>
					</u-textarea>
				</view>
			</view>

			<view class="input-section" v-if="parsedData.length > 0">
				<view class="flex2">
					<view class="input-title">备注</view>
					<u-textarea
						v-model="remark"
						:auto-height="true"
						maxlength="1000"
						placeholder="请输入备注"
					>
					</u-textarea>
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
			@close="closePopup"
			:safeAreaInsetBottom="false"
			:customStyle="{
				width: '80%',
			}"
		>
			<view class="popup-content">
				<view class="popup-title"
					>{{ "编辑" + currentEditLabel }}
				</view>
				<view
					v-if="currentEditField == 'shopName'"
					style="
						text-align: center;
						font-size: 12px;
						color: #f29100;
						margin-bottom: 20rpx;
					"
					>(保存新的店铺名称会自动重新解析数据)</view
				>
				<view
					class="current-field-info"
					v-if="baseArr[currentEditIndex]"
				>
					<text>
						{{ baseArr[currentEditIndex] }}
					</text>
					<view
						class="u-buttons"
						style=""
						@click="addRemark(baseArr[currentEditIndex])"
						>加到备注</view
					>
				</view>
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
import duizhangMixin from "./mixin.js";

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
			edList: [
				"date",
				"shopName",
				"customer",
				"project",
				"performance",
				"refund",
			],
			barBgColor: 0,
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
	onPageScroll({ scrollTop }) {
		console.log("scrollTop", scrollTop);
	},
	methods: {
		scrollFn(w) {
			console.log("w", w);
		},
		addRemark(val) {
			this.remark = this.remark + val + " ";
		},
		filterRefund(value) {
			if (!value) return false;
			value = String(value);
			if (value.indexOf("售前") > -1 && parseFloat(value))
				return "isShouQian";

			if (value.length > 3) return "dytell";
		},
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
								title: "解析完成",
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
			if (
				field === "shopName" &&
				item.customer &&
				item.customer.length > 3
			) {
				// 如果存在客户名称>3 可能存在异常  用户点击店铺名称说明店铺出现解析异常  那么   currentEditValue = item.customer
				this.currentEditValue = item.customer;
			}

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
			this.tempFilePath = "";

			if (
				this.currentEditField === "shopName" &&
				this.shopNames.indexOf(this.currentEditValue) < 0
			) {
				//如果是店铺名称 可能没有录入 需要重新录入

				if (!this.currentEditValue.trim()) {
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
							name: this.currentEditValue,
						},
					})
					.then(({ result }) => {
						uni.hideLoading();
						console.log("添加店铺结果", result);
						if (result.code === 0) {
							// this.getShopList(true);
							this.shopNames = [
								this.currentEditValue,
								...this.shopNames,
							];

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
						} else {
							uni.showToast({
								title: result.message,
								icon: "none",
							});
						}
					});
			}
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
			// 检查数据 如果顾客名称>3  customer   可能存在异常 提示 请检查

			let isErrName = false;
			for (let i = 0; i < this.parsedData.length; i++) {
				const item = this.parsedData[i];
				if (item.customer && item.customer.length > 3) {
					isErrName = i + 1;
					break;
				}
			}

			if (isErrName) {
				uni.showModal({
					title: "提示",
					content: `存在异常，请检查第${isErrName}行数据，确定继续生成Excel吗？`,
					showCancel: true,
					confirmText: "继续",
					success: (res) => {
						if (res.confirm) {
							this.postData(); // 确定按钮被点击
							return;
						}
					},
				});

				return;
			}

			// 提交数据并生成Excel的逻辑
			console.log("提交数据");
			this.postData();
		},
		postData() {
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

<style lang="scss">
@import "./index.scss";
</style>
