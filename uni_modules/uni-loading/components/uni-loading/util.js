/**
 *
 *
 * **/

//重构uni.showLoading 和 uni.hideLoading 方法，避免与原生方法冲突

//全局只需引入一次，避免重复注册
// console.log("注册全局方法1");
// if (!uni.gLobalLoading) {
// 	uni.$gLobalLoading = true;
// 	console.log("注册全局方法：uni.showLoading 和 uni.hideLoading");
// 	uni.showLoading = function (options) {
// 		uni.$emit("showLoading", options || {});
// 	};
// 	uni.hideLoading = function () {
// 		uni.$emit("hideLoading");
// 	};
// }

function getPageTarget() {
	const pages = getCurrentPages();
	const page = pages[pages.length - 1];
	return page && page.$vm && page.$vm.$refs.globalLoading;
}

uni.showLoading = function (options = {}) {
	let globalLoading = getPageTarget();

	if (globalLoading) {
		globalLoading.showLoading({ ...options });
	}
};

uni.hideLoading = function (options = {}) {
	let globalLoading = getPageTarget();
	if (globalLoading) {
		globalLoading.hideLoading();
	}
};
