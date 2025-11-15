import Vue from "vue";
import App from "./App";
import uView from "uview-ui";
import store from "./store";

Vue.config.productionTip = false;

Vue.use(uView);

// 初始化 uniCloud
const db = uniCloud.database();
Vue.prototype.$db = db;
Vue.prototype.$cloudFunction = uniCloud.callFunction;

// 判断是否是小程序
// #ifdef MP-WEIXIN
let proType = uni.getAccountInfoSync().miniProgram.envVersion;
switch (proType) {
	case "develop":
		uni.$develop = true;
		break;
}
// #endif

// 添加全局的 uniCloud 错误处理
Vue.prototype.$handleCloudError = function (err) {
	console.error("uniCloud error:", err);
	// 可以在这里添加全局的错误处理逻辑，比如上报错误或显示错误提示
};

// 添加全局错误处理
Vue.config.errorHandler = function (err, vm, info) {
	console.error("Global error:", err);
	console.error("Error info:", info);
};

// 添加全局警告处理
Vue.config.warnHandler = function (msg, vm, trace) {
	console.warn("Global warning:", msg);
	console.warn("Warning trace:", trace);
};

App.mpType = "app";

const app = new Vue({
	...App,
	store,
});
app.$mount();
