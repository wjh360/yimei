<template>
	<view class="home-container">
		<view class="overlay"></view>

		<view class="content">
			<view class="menu-grid">
				<view
					class="menu-item"
					v-for="(item, index) in menuItems"
					:key="index"
					@click="navigateTo(item.url)"
					:class="[
						`color-${index + 1}`,
						{
							animated: animateItems,
						},
					]"
					:style="{ 'animation-delay': index * 0.1 + 's' }"
				>
					<view class="menu-icon-container">
						<u-icon
							:name="item.icon"
							size="30"
							color="#ffffff"
						></u-icon>
						<text class="menu-text">{{ item.title }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			animateItems: false,
			menuItems: [
				{ title: "店铺", icon: "bookmark-fill", url: "shop" },
				{ title: "项目", icon: "star-fill", url: "project" },
				{ title: "对账单", icon: "edit-pen", url: "duizhang" },
				{ title: "手工", icon: "attach", url: "shougong" },
				{ title: "报销单", icon: "rmb-circle-fill", url: "baoxiao" },
				{ title: "考勤", icon: "calendar-fill", url: "kaoqin" },
			],
		};
	},

	onShow() {
		setTimeout(() => {
			this.animateItems = true;
		}, 100);
	},
	methods: {
		navigateTo(url) {
			uni.navigateTo({ url: `/pages/${url}/index` });
		},
	},
};
</script>

<style lang="scss">
@import "./home.scss";
</style>
