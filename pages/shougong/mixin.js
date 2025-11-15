export default {
	methods: {
		setInit(e) {
			var n = e
				.replace(/打扮/g, "打版")
				.replace(/尚成美业/g, "尚城美业")
				.replace(/尚美家人/g, "尚美佳人")
				.replace(/尚美嘉人/g, "尚美佳人")
				.replace(/<p>/g, "")
				.replace(/&nbsp;/g, "")
				.split("\n")
				.filter(function (e) {
					return e;
				});
			this.baseArr = [...n];
			try {
				this.filterTableData(n);
			} catch (e) {
				t.showToast({
					title: "解析错误",
					icon: "none",
				});
			}
		},
		filterTableData(e) {
			var t = this,
				n = [],
				r = null,
				o = null;
			e.forEach(function (e, i) {
				if (-1 == e.indexOf("手工")) {
					var a = e.match(/^\d+(?:\.\d+)?/),
						s = a ? a[0] : null;
					if (
						((r = s || r),
						(o = s ? t.splitChineseWords(e)[0] : o),
						-1 == e.indexOf(" ") && !s)
					)
						return (o = e), void (s = r);
					if (!s) {
						var u = t.splitChineseWords(e)[0];
						n.push({
							date: r,
							shopName: o,
							customer: u,
							project: e.replace(u, "").trim(),
							operation: "",
							content: e,
						});
					}
				}
			}),
				console.log(n, e),
				(this.parsedData = n);
		},
		findMaxCount(e, t, n) {
			if ((n = n || 0) >= e.length) return e;
			for (var r = e[n][t], o = 1, i = n + 1; i < e.length; i++) {
				if (e[i][t] !== r)
					return (e[n][t + "Count"] = o), this.findMaxCount(e, t, i);
				o++, (e[i][t + "Count"] = 0), (e[n][t + "Count"] = o);
			}
			return e;
		},
		filterData(e) {
			var t = this.findMaxCount(e, "shopName");
			t[t.length - 1].shopNameCount ||
				t[t.length - 2].shopName == t[t.length - 1].shopName ||
				(t[t.length - 1].shopNameCount = 1),
				(this.parsedData = this.findMaxCount(t, "date"));
		},
		splitStringByNumbers(e) {
			return (e.match(/\d+/g) || []).map(Number);
		},
		splitChineseWords(e) {
			return e.match(/[a-z|A-Z]+/g) || e.match(/[\u4e00-\u9fa5]+/g);
		},
	},
};
