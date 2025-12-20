<template>
	<view class="month-picker-container">
		<!-- 年月背景 -->
		<view class="year-month-bg">
			<view>{{ value2 }}</view>
			<view>工作计划</view>
		</view>

		<u-navbar :bgColor="`rgba(0,0,0,0)`" :autoBack="true">
			<view slot="center">
				<view @click="selectedYear = true"> {{ value2 }}工作安排 </view>
			</view>
		</u-navbar>
		<view class="content" v-if="parsedData.length > 0">
			<view class="data-section">
				<view class="table-container">
					<view class="table-header">
						<text class="header-item full-flex">时间</text>
						<text class="header-item full-flex">安排</text>
						<text class="header-item full-flex">管理</text>
					</view>

					<view class="table-body">
						<scroll-view scroll-y style="height: 100%">
							<view
								v-for="(item, index) in parsedData"
								:key="index"
								class="table-row"
								:class="{
									lastTableRow:
										index === parsedData.length - 1,
								}"
							>
								<view
									class="table-cell table-cell-0"
									:key="index + 0"
								>
									<view class="cell-text">
										<text class="cell-text">{{
											item.time
										}}</text>
									</view>
								</view>
								<view
									class="table-cell"
									:key="index + 1"
									@tap="editField(item, index)"
								>
									<view class="cell-text">
										<text class="cell-text">{{
											item.plan
										}}</text>
									</view>
								</view>
								<view class="table-cell delete-cell">
									<view
										class="danger cell-text"
										@click="deleteRow(index)"
										>清空</view
									>
								</view>
							</view>
						</scroll-view>
					</view>
				</view>
			</view>
		</view>

		<u-datetime-picker
			ref="datetimePicker"
			:show="selectedYear"
			v-model="value1"
			mode="year-month"
			@confirm="onYearChange"
			@cancel="selectedYear = false"
			:close-on-click-overlay="true"
		></u-datetime-picker>
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
				<view class="popup-title">{{ currentEditLabel }} </view>

				<u-textarea
					v-model="currentEditValue"
					placeholder="请输入内容"
					count
					maxlength="200"
					:height="150"
				></u-textarea>
				<view class="popup-actions">
					<u-button @click="showEditPopup = false">取消</u-button>
					<u-button @click="saveEdit">保存</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import WSsocket from "./socket";
export default {
	mixins: [WSsocket],
	data() {
		return {
			showEditPopup: false,
			selectedYear: false,
			currentEditLabel: "",
			currentEditValue: "",
			months: [
				"一月",
				"二月",
				"三月",
				"四月",
				"五月",
				"六月",
				"七月",
				"八月",
				"九月",
				"十月",
				"十一月",
				"十二月",
			],
			animateItems: false,
			value1: new Date() * 1,

			parsedData: [],
			curPageName: "im",
		};
	},
	computed: {
		value2() {
			let data = new Date(this.value1);
			return data.getFullYear() + "-" + (data.getMonth() + 1);
		},
	},
	onShareAppMessage(res) {
		return {
			title: this.value2 + "工作计划",
			path: `/pages/im/index?yearMonth=${this.value2}`,
			imageUrl:
				"https://env-00jxtjtj8hsd.normal.cloudstatic.cn/share.png",
		};
	},

	onLoad(options) {
		// this.initParsedData();
		if (options.yearMonth) {
			this.value1 = new Date(options.yearMonth + "-01") * 1;
		}
		this.initParsedData();
	},

	methods: {
		clearLoadData(echoData) {
			if (echoData.yearMonth != this.value2) return;

			this.showEditPopup = false;

			this.getBaseData();
		},
		closePopup() {
			this.showEditPopup = false;
		},
		initParsedData() {
			let data = new Date(this.value1);

			this.selectMonth(data.getFullYear(), data.getMonth() + 1);
			this.getBaseData();
		},
		getBaseData() {
			uniCloud.callFunction({
				name: "getImData",
				data: {
					yearMonth: this.value2,
				},
				success: (res) => {
					console.log("获取数据成功:", res.result);
					let data = res.result.data || [];

					// 两个数组进行对比，如果存在相同的时间，则合并数据，否则添加新的数据
					for (let i = 0; i < data.length; i++) {
						let item = data[i];
						let index = this.parsedData.findIndex(
							(x) => x.time == item.time
						);
						if (index !== -1) {
							// 如果存在相同时间，则合并数据
							this.$set(
								this.parsedData[index],
								"plan",
								item.plan
							);
						} else {
							this.$set(this.parsedData[index], "plan", "");
						}
					}
					uni.hideLoading();
					console.log("数据", this.parsedData);
				},
				fail: (err) => {
					uni.hideLoading();
					console.error("获取数据失败:", err);
				},
			});
		},

		deleteRow(index) {
			//判断当前用户是否登录
			uni.$isLogin();

			// this.parsedData.splice(index, 1);
			console.log("删除行", index, !this.parsedData[index].plan);
			//如果本来就是空的 retunr
			if (!this.parsedData[index].plan) {
				console.log("数据为空");
				return;
			}

			uni.showModal({
				title: "提示",
				content: "确定要清空当前计划吗？",
				success: async (res) => {
					if (res.confirm) {
						this.$set(this.parsedData[index], "plan", "");
						this.currentEditValue = "";
						this.currentEditIndex = index;
						uni.$sendMessage({
							...this.parsedData[this.currentEditIndex],
							yearMonth: this.value2,
						});
					}
				},
			});
		},
		// 年份改变事件
		onYearChange(e) {
			let value = new Date(e.value) * 1;
			if (this.value1 === value) return;
			this.value1 = value;

			this.selectedYear = false;

			uni.showLoading({
				title: "切换中...",
			});
			setTimeout(() => {
				//根据年份和月份获取数据
				this.value1 = value;
				this.initParsedData();
			});
		},

		selectMonth(year, month) {
			//获取选中月份的天数
			let days = new Date(year, month, 0).getDate();
			let arr = [];

			for (let i = 0; i < days; i++) {
				let day = i + 1 < 10 ? "0" + (i + 1) : i + 1;
				arr.push({
					time: year + "-" + month + "-" + day,

					plan: "",
				});
			}
			this.parsedData = arr;
		},

		editField(item, index) {
			//判断当前用户是否登录
			uni.$isLogin();
			this.currentEditLabel = item.time + "工作计划";
			this.currentEditValue = item.plan;
			this.currentEditIndex = index;
			this.showEditPopup = true;
		},

		saveEdit() {
			//如果没有修改则return
			this.showEditPopup = false;
			if (
				this.currentEditValue ==
				this.parsedData[this.currentEditIndex].plan
			)
				return;

			this.$set(
				this.parsedData[this.currentEditIndex],
				"plan",
				this.currentEditValue
			);

			// 发送数据
			uni.$sendMessage({
				...this.parsedData[this.currentEditIndex],
				yearMonth: this.value2,
			});
		},
	},
};
</script>

<style lang="scss">
.month-picker-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	position: relative;
	overflow: hidden;
	perspective: 1000px;

	// 年月背景
	.year-month-bg {
		position: absolute;
		top: calc(50vh - 65px);
		left: calc(50% - 98px);
		font-size: 51px;
		font-weight: bold;
		color: #999;
		z-index: 0;
		transform-style: preserve-3d;
		transform: perspective(1000px) rotateX(25deg) rotateY(15deg)
			rotateZ(-15deg);
		pointer-events: none;
		-webkit-user-select: none;
		user-select: none;
		white-space: nowrap;
		text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb,
			0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0, 0, 0, 0.1),
			0 0 5px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3),
			0 3px 5px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.25),
			0 10px 10px rgba(0, 0, 0, 0.2), 0 20px 20px rgba(0, 0, 0, 0.15);
		animation: float 6s ease-in-out infinite;
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		opacity: 0.4;
	}

	@keyframes float {
		0% {
			transform: perspective(1000px) rotateX(25deg) rotateY(15deg)
				rotateZ(-15deg) translateZ(0px);
		}
		50% {
			transform: perspective(1000px) rotateX(25deg) rotateY(15deg)
				rotateZ(-15deg) translateZ(30px);
		}
		100% {
			transform: perspective(1000px) rotateX(25deg) rotateY(15deg)
				rotateZ(-15deg) translateZ(0px);
		}
	}
}

.content {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 0 30rpx;
	height: 100%;
	position: relative;
	z-index: 1;
}

.u-cell--clickable {
	background-color: rgba($color: #000000, $alpha: 0) !important;
}

@import "./index.scss";
</style>
