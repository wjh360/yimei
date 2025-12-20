<template>
	<view
		:class="isShowLoadingType ? 'loading-mask' : 'hide-mask'"
		@touchmove.stop.prevent="preventTouchMove"
	>
		<view class="loading-content">
			<view class="loading-spinner"></view>
			<text class="loading-text" v-if="!hideTitle">{{
				loadingText
			}}</text>
		</view>
	</view>
</template>
<!-- 全局加载组件 

pages.json 中配置 insetLoader =>pages同级
"insetLoader": {
	"config": {
		"globalLoading": "<uni-loading ref='globalLoading' />"
	},
	"label": ["globalLoading"],
	"rootEle": "view"
},
配置全局调用方法 util.js 中引入 可替换为其他方法名

 uni.showLoading({
    title: '加载中...'
  });
  uni.hideLoading();

-->

<script>
import "./util.js"; // 引入全局方法
export default {
	name: "GlobalLoading",
	data() {
		return {
			isShowLoadingType: false,
			loadingText: "加载中...",
			hideTitle: false,
		};
	},

	beforeDestroy() {
		this.hideLoading();
	},
	methods: {
		showLoading({ title = "加载中...", hideTitle = false }) {
			this.loadingText = title;
			this.hideTitle = !!hideTitle;
			this.isShowLoadingType = true;
		},
		hideLoading() {
			this.isShowLoadingType = false;
		},
		preventTouchMove() {},
	},
};
</script>

<style scoped>
.loading-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.1);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
}
.hide-mask {
	display: none;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 200rpx;
	height: 200rpx;
	/* background: rgba(0, 0, 0, 0.7); */
	border-radius: 10rpx;
}

.loading-spinner {
	width: 50rpx;
	height: 50rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.loading-text {
	color: #fff;
	font-size: 24rpx;
	margin-top: 20rpx;
}
</style>
