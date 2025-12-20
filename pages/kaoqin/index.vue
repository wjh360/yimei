<template>
	<view class="page">
		<u-navbar title="考勤" :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
		</u-navbar>
		<uni-calendar
			ref="calendar"
			:insert="true"
			:lunar="false"
			:selected="selected"
			@change="onChange"
			@monthSwitch="onMonthSwitch"
			:date="date"
			:edit="isEdit"
			:clearDate="true"
		/>

		<view class="popup-mask" v-if="showPopup" @tap="closePopup">
			<view class="popup-content" @tap.stop>
				<view class="popup-title">请选择请假类型</view>
				<view class="leave-type-list">
					<view
						v-for="(label, key) in leaveTypes"
						:key="key"
						:class="[
							'leave-type-item',
							selectedLeaveType == key ? 'active' : '',
						]"
						@tap="selectLeaveType(key)"
					>
						{{ label }}
					</view>
				</view>

				<view class="remark-section">
					<view class="remark-label">备注</view>
					<u--input
						v-model="remark"
						class="remark-input"
						placeholder="请输入备注信息"
					/>
				</view>

				<view class="popup-actions">
					<u-button
						type="primary"
						shape="circle"
						@click="confirmSelection"
					>
						确认
					</u-button>
				</view>
			</view>
		</view>

		<view class="input-section">
			<view class="input-group">
				<view class="input-label">月休</view>
				<u--input
					v-model="baseYueXiuDay"
					class="remark-input"
					placeholder="请输入基础月休"
					:disabled="!isEdit"
				>
					<view slot="suffix"> 天 </view>
				</u--input>
			</view>
			<!-- <view class="input-group">
				<view class="input-label">底薪</view>
				<u--input
					v-model="baseMonthSalary"
					class="remark-input"
					placeholder="请输入基本工资"
					:disabled="!isEdit"
				/>
			</view> -->
		</view>

		<view class="stats-container">
			<view class="stats-card">
				<view class="stats-grid">
					<view class="stat-item">
						<view class="stat-label">本月</view>
						<view class="stat-value">
							{{ totalDays }}
							<text class="stat-unit">天</text>
						</view>
					</view>
					<view class="stat-item">
						<view class="stat-label">应出勤</view>
						<view class="stat-value">
							{{ shouldWorkDays }}
							<text class="stat-unit">天</text>
						</view>
					</view>
					<view class="stat-item">
						<view class="stat-label">请假</view>
						<view class="stat-value warning">
							{{ leaveDays }}
							<text class="stat-unit">天</text>
						</view>
					</view>
					<view class="stat-item">
						<view class="stat-label">实出勤</view>
						<view class="stat-value primary">
							{{ actualWorkDays }}
							<text class="stat-unit">天</text>
						</view>
					</view>
				</view>
				<!-- <view class="stats-grid2">
					<view class="stat-item">
						<view class="stat-label">日工资</view>
						<view class="stat-value">
							{{ dailySalary }}
							<text class="stat-unit">元</text>
						</view>
					</view>
					<view class="stat-item">
						<view class="stat-label">出勤工资</view>
						<view class="stat-value warning">
							{{ chuQinGongZiAmount }}
							<text class="stat-unit">元</text>
						</view>
					</view>
				</view> -->
			</view>
		</view>

		<view class="button-container" v-if="isEdit">
			<u-button
				type="primary"
				shape="circle"
				style="width: 45%"
				open-type="share"
			>
				分享
			</u-button>
			<u-button
				type="warning"
				shape="circle"
				style="width: 45%"
				@click="handleReset"
			>
				重置
			</u-button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			date: "",
			selected: [],
			showPopup: false,
			selectedDate: "",
			selectedLeaveType: null,
			remark: "",
			leaveTypes: {
				1: "全天",
				2: "上午",
				3: "下午",
			},
			currentMonthInfo: {
				year: new Date().getFullYear(),
				month: new Date().getMonth(),
			},
			baseYueXiuDay: "4",
			baseMonthSalary: "5000",
			totalDays: 0,
			shouldWorkDays: 0,
			leaveDays: 0,
			actualWorkDays: 0,
			attendanceRate: 0,
			dailySalary: 0,
			chuQinGongZiAmount: 0,
			optionsData: null,
			randomId: uni.getStorageSync("randomId"),
			options: {},
		};
	},

	watch: {
		baseYueXiuDay() {
			this.submitData();
		},

		baseMonthSalary() {
			this.submitData();
		},
	},
	onShareAppMessage(res) {
		if (res.from === "button") {
			// 来自页面内分享按钮
			// console.log(JSON.stringify(this.$data));

			return {
				title: "考勤分享",
				path: `/pages/kaoqin/index?data=${JSON.stringify(
					this.$data
				)}&randomId=${uni.getStorageSync("randomId")}`,
				imageUrl:
					"https://env-00jxtjtj8hsd.normal.cloudstatic.cn/share.png",
			};
		}
	},
	onShow() {
		// this.submitData();
	},

	onLoad(options) {
		this.options = options;
		this.optionsData = options.data || null;
	},
	computed: {
		isEdit() {
			return (
				(this.optionsData && this.randomId != this.options.randomId) ||
				!this.optionsData
			);
		},
	},

	mounted() {
		if (!this.isEdit) {
			let data = JSON.parse(this.optionsData);
			for (const key in data) {
				this[key] = data[key];
			}
		} else {
			var t = uni.getStorageSync("qingjiaData") || {},
				n = uni.getStorageSync("currentMonthInfo");
			this.selected = t.selected || [];

			if (n) {
				this.date = `${n.year}-${String(n.month).padStart(2, "0")}`;
				this.currentMonthInfo = n;
			} else {
				this.initCalendar();
			}
		}
		console.log(this.date);
		this.submitData();
	},

	methods: {
		formatterDate(date) {
			if (date) return date.replace(/-/g, "-");
			else return date;
		},
		initCalendar() {
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth();
			let prevYear = year;
			let prevMonth = month;

			if (prevMonth < 0) {
				prevMonth = 11;
				prevYear = year - 1;
			}

			this.currentMonthInfo = {
				year: prevYear,
				month: prevMonth,
			};

			this.date = this.formatterDate(
				`${prevYear}-${String(prevMonth).padStart(2, "0")}`
			);
		},

		onChange(e) {
			if (!this.isEdit) return;

			this.selectedDate = e.fulldate;
			const selectedItem = this.selected.find(
				(item) => item.date === this.selectedDate
			);

			if (selectedItem) {
				this.remark = selectedItem.remark || "";
				this.selectedLeaveType = selectedItem.info;
			} else {
				this.selectedLeaveType = null;
				this.remark = "";
			}

			this.showPopup = true;
		},

		onMonthSwitch(e) {
			this.currentMonthInfo = {
				year: e.year,
				month: e.month,
			};
			this.date = this.formatterDate(
				`${e.year}-${String(e.month).padStart(2, "0")}`
			);
			this.submitData();
		},

		closePopup() {
			this.showPopup = false;
			this.selectedLeaveType = null;
			this.remark = "";
		},

		selectLeaveType(type) {
			this.selectedLeaveType =
				this.selectedLeaveType == type ? null : type;
		},

		confirmSelection() {
			const newItem = {
				date: this.selectedDate,
				info: this.leaveTypes[this.selectedLeaveType] || "",
				remark: this.remark,
			};

			const index = this.selected.findIndex(
				(item) => item.date === this.selectedDate
			);

			if (index > -1) {
				if (this.selectedLeaveType) {
					this.selected.splice(index, 1, newItem);
				} else {
					this.selected.splice(index, 1);
				}
			} else {
				if (this.selectedLeaveType) {
					this.selected.push(newItem);
				}
			}

			this.closePopup();
			this.submitData();
		},

		submitData() {
			const { year, month } = this.currentMonthInfo;
			const currentMonthSelected = this.selected.filter((item) =>
				item.date.startsWith(
					this.formatterDate(
						`${year}-${String(month).padStart(2, "0")}`
					)
				)
			);

			let leaveCount = 0;
			currentMonthSelected.forEach((item) => {
				if (item.info === "全天") {
					leaveCount += 1;
				} else if (item.info === "上午" || item.info === "下午") {
					leaveCount += 0.5;
				}
			});
			// console.log(`${year}-${String(month).padStart(2, "0")}`);

			const totalDays = new Date(year, month, 0).getDate();
			const shouldWorkDays =
				totalDays - parseFloat(this.baseYueXiuDay || 0);
			const actualWorkDays = shouldWorkDays - leaveCount;
			const attendanceRate = (
				(actualWorkDays / shouldWorkDays) *
				100
			).toFixed(2);
			const dailySalary = (
				parseFloat(this.baseMonthSalary || 0) / shouldWorkDays
			).toFixed(2);
			let chuQinGongZiAmount = (dailySalary * actualWorkDays).toFixed(2);

			if (chuQinGongZiAmount > parseFloat(this.baseMonthSalary || 0)) {
				chuQinGongZiAmount = parseFloat(
					this.baseMonthSalary || 0
				).toFixed(2);
			}

			this.totalDays = totalDays;
			this.shouldWorkDays = shouldWorkDays;
			this.leaveDays = leaveCount;
			this.actualWorkDays = actualWorkDays;
			this.attendanceRate = attendanceRate;
			this.dailySalary = dailySalary;
			this.chuQinGongZiAmount = chuQinGongZiAmount;

			if (this.isEdit) {
				uni.setStorageSync("qingjiaData", {
					selected: this.selected,
				});
				uni.setStorageSync("currentMonthInfo", this.currentMonthInfo);
			}
		},

		handleSubmit() {
			const result =
				`本月天数: ${this.totalDays}天\n` +
				`应出勤: ${this.shouldWorkDays}天\n` +
				`请假: ${this.leaveDays}天\n` +
				`实际出勤: ${this.actualWorkDays}天\n` +
				`日工资: ${this.dailySalary}元\n` +
				`出勤工资: ${this.chuQinGongZiAmount}元`;

			uni.setClipboardData({
				data: result,
				success: () => {
					// uni.showToast({
					// 	title: "已复制到剪贴板",
					// 	icon: "success",
					// });

					uni.shareAppMessage({
						title: "分享一个优惠活动",
						path: "/pages/index/index",
						success: () => {
							console.log("分享成功");
						},
					});
				},
			});
		},

		handleReset() {
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth();
			let prevYear = year;
			let prevMonth = month;

			if (prevMonth < 0) {
				prevMonth = 11;
				prevYear = year - 1;
			}

			this.selected = [];
			this.baseYueXiuDay = "4";
			this.baseMonthSalary = "5000";
			this.currentMonthInfo = {
				year: prevYear,
				month: prevMonth,
			};
			this.date = this.formatterDate(
				`${prevYear}-${String(prevMonth).padStart(2, "0")}`
			);
			this.submitData();
		},
	},
};
</script>

<style lang="scss" scoped>
.page {
	padding: 20rpx;
	// background-color: #f5f5f5;
	// min-height: 100vh;
}

.popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.popup-content {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
	width: 80%;
}

.popup-title {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 30rpx;
}

.leave-type-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.leave-type-item {
	// flex: 1;
	width: 20%;
	padding: 20rpx;
	margin-bottom: 20rpx;
	text-align: center;
	background-color: #f0f0f0;
	border-radius: 10rpx;
	font-size: 28rpx;

	&.active {
		background-color: #007aff;
		color: #fff;
	}
}

.remark-section {
	margin-bottom: 30rpx;
}

.remark-label {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 10rpx;
}

.remark-input {
	background-color: #f5f5f5;
	border-radius: 10rpx;
	padding: 10rpx;
}

.popup-actions {
	display: flex;
	justify-content: center;
}

.input-section {
	background-color: rgba($color: #ffffff, $alpha: 0.4);
	border-radius: 10rpx;
	padding: 10rpx;
	margin: 20rpx 0;
	display: flex;
	align-items: center;
}

.input-group {
	display: flex;
	align-items: center;
	flex: 1;
}

.input-label {
	width: 120rpx;
	font-size: 28rpx;
	color: #333;
	text-align: center;
}

.stats-container {
	margin: 20rpx 0;
}

.stats-card {
	background-color: rgba($color: #ffffff, $alpha: 0.4);
	border-radius: 10rpx;
	padding: 30rpx;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 30rpx;
	// margin-bottom: 20px;
}

.stats-grid2 {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 30rpx;
}

.stat-item {
	display: flex;
	flex-direction: column;
	text-align: center;
}

.stat-label {
	font-size: 34rpx;
	color: #666;
	margin-bottom: 10rpx;
	font-weight: bold;
}

.stat-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;

	&.primary {
		color: #007aff;
	}

	&.warning {
		color: #ff9900;
	}
}

.stat-unit {
	font-size: 24rpx;
	font-weight: normal;
	margin-left: 10rpx;
}

.button-container {
	display: flex;
	justify-content: space-between;
	margin-top: 40rpx;
}
</style>

<style lang="scss">
.uni-calendar__backtoday {
	display: none !important;
}

.uni-calendar__content {
	background-color: rgba($color: #fff, $alpha: 0.4) !important;
	.uni-calendar-item--disable {
		background-color: rgba($color: #000000, $alpha: 0) !important;
	}
}

.uni-calendar {
	border-radius: 10rpx !important;
	overflow: hidden;
}
</style>
