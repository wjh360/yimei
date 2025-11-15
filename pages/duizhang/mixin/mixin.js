export default {
	methods: {
		setInit(e) {
			for (
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
						}),
					o = 0;
				o < n.length;
				o++
			) {
				var i = n[o];
				0 == i.indexOf("回款") &&
					((n[o - 1] = n[o - 1] + " " + i), n.splice(o, 1));
			}
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
				r = "",
				o = "";
			e.forEach(function (t, n) {
				0 == t.indexOf("共计") && (e[n - 1] = e[n - 1] + " " + t);
			}),
				(e = e.filter(function (e) {
					return 0 == !e.indexOf("共计");
				})).forEach(function (e, i) {
					if ((e = e.replace("\n", "").trim().replace(" ", ""))) {
						var a = {};
						if (/^\d+?\.\d+/.test(e)) {
							var s = e.match(/\d+\.?\d*/g);
							(r = s[0]), (e = e.replace(r, ""));
						}
						a = {
							date: r,
						};
						var u = t.shopNames.filter(function (t) {
							if (e.includes(t)) return (e = e.replace(t, "")), t;
						})[0];
						(o = u || o), (a.shopName = o);
						var c = t.projects.filter(function (t) {
							if (e.includes(t)) return t;
						})[0];
						a.project = c;
						var l = e.split(c);
						if (l && 2 == l.length) {
							var f = l[1].indexOf("回款");
							(a.customer = l[0]),
								(a.performance =
									-1 != f ? l[1].slice(0, f) : l[1]);
						}
						var d = e.match(/\d+\.?\d*/g);
						if (
							(e.indexOf("实际") > -1
								? ((a.fencheng = "实际:" + d[d.length - 1]),
								  e.indexOf("回款") > -1 &&
										(a.refund = d[d.length - 2]))
								: e.indexOf("回款") > -1 &&
								  (a.refund = d[d.length - 1]),
							e.indexOf("售前") > -1 && (a.refund += "(售前)"),
							!a.OptName)
						)
							try {
								var p = t.splitStringByNumbers(e);
								a.performance = p[0];
								var h = t.splitChineseWords(e);
								a.customer = h[0] && "回款" != h[0] ? h[0] : "";
							} catch (e) {}
						a.customer &&
							c &&
							a.customer.indexOf(c) > -1 &&
							(a.customer = a.customer.replace(c, "")),
							(a.teacher = t.teacher),
							(a.operation = t.operation),
							(a.consultation = t.teacher),
							a.performance && n.push(a);
					}
				}),
				n.sort(function (e, t) {
					return e.date.split(".")[1] - t.date.split(".")[1];
				}),
				this.filterData(n);
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
