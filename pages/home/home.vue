<template>
	<view class="home-container">
		<view class="overlay"></view>
		<view style="height: 100px; width: 100%"></view>

		<view class="content">
			<view class="menu-grid">
				<view
					class="menu-item"
					v-for="(item, index) in menuItems"
					:key="index"
					@click="navigateTo(item.url)"
					:class="{ animated: animateItems }"
					:style="{ 'animation-delay': index * 0.1 + 's' }"
				>
					<view
						class="menu-icon-container"
						:style="{ background: getGradientColor(index) }"
					>
						<u-icon
							:name="item.icon"
							size="30"
							color="#ffffff"
						></u-icon>
					</view>
					<text class="menu-text">{{ item.title }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: null,
			animateItems: false,
			menuItems: [
				//店铺 项目 对账单 手工 报销单 考勤
				{
					title: "店铺",
					icon: "bookmark-fill",
					url: "shop",
				},
				{
					title: "项目",
					icon: "star-fill",
					url: "project",
				},
				{
					title: "对账单",
					icon: "edit-pen",
					url: "duizhang",
				},
				{
					title: "手工",
					icon: "attach",
					url: "shougong",
				},
				{
					title: "报销单",
					icon: "rmb-circle-fill",
					url: "baoxiao",
				},
				{
					title: "考勤",
					icon: "calendar-fill",
					url: "kaoqin",
				},
			],
			gradientColors: [
				"linear-gradient(135deg, #FF9A9E, #FAD0C4)",
				"linear-gradient(135deg, #A18CD1, #FBC2EB)",
				"linear-gradient(135deg, #FCCB90, #D57EEB)",
				"linear-gradient(135deg, #A1C4FD, #C2E9FB)",
				"linear-gradient(135deg, #84FAB0, #8FD3F4)",
				"linear-gradient(135deg, #F5576C, #F093FB)",
				"linear-gradient(135deg, #4FACFE, #00F2FE)",
				"linear-gradient(135deg, #43E97B, #38F9D7)",
				"linear-gradient(135deg, #FA709A, #FEE140)",
			],
			contentText: "",
		};
	},
	computed: {},
	onShow() {
		setTimeout(() => {
			this.animateItems = true;
		}, 100);
	},
	methods: {
		navigateTo(url) {
			uni.navigateTo({ url: `/pages/${url}/index` });
		},
		getGradientColor(index) {
			return this.gradientColors[index % this.gradientColors.length];
		},
	},
};
</script>

<style lang="scss">
@import "./homd.scss";
</style>
