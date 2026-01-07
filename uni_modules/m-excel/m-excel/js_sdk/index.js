import xlsx from "./xlsx.mini.min.js";

const m_excel = {
	read() {
		let that = this;
		return new Promise((resolve, reject) => {
			uni.chooseMessageFile({
				count: 1,
				extension: ["xlsx", "csv", "xls", "xlsb", "xlsm"],
				success(e) {
					that.read_file(e.tempFiles[0], (e) => {
						resolve(e);
					});
				},
				fail(e) {
					resolve({
						success: 0,
						msg: "小程序选取文件失败",
						error: e,
					});
				},
			});
		});
	},
	strTrim(str) {
		if (!str || str == " ") return "";
		return str;
	},
	async read_file(file, fun) {
		let that = this;

		const fs = wx.getFileSystemManager();
		fs.readFile({
			filePath: file.path,
			success(e) {
				// console.log("读取文件成功", e.data);
				const workbook = xlsx.read(new Uint8Array(e.data), {
					type: "array",
				});
				// 第一行内容
				// 1. 先读取表头（第一行）
				const onRows = xlsx.utils.sheet_to_json(
					workbook.Sheets[workbook.SheetNames[0]],
					{
						header: 1,
						range: 0, // 只读第一行
						raw: false,
					}
				)[0];

				// 1. 先读取表头（第2行）
				const headers = xlsx.utils.sheet_to_json(
					workbook.Sheets[workbook.SheetNames[0]],
					{
						header: 1,
						range: 1, // 只读第2行
						raw: false,
					}
				)[0];

				// 2. 再读取数据（从第3行开始）
				const dataRows = xlsx.utils.sheet_to_json(
					workbook.Sheets[workbook.SheetNames[0]],
					{
						header: 1,
						range: 2, // 从第3行开始
						defval: "", // 空单元格默认值
					}
				);
				let baseObj = {};
				let duizhangBaseObj = {
					导师: "teacher",
					店面名称: "shopName",
					时间: "date",
					操作顾客名单: "customer",
					操作项目: "project",
					业绩: "performance",
					回款情况: "refund",
					分成: "share",
					咨询: "consultation",
					操作: "operation",
					商务: "business",
				};

				let shouGongBaseObj = {
					时间: "date",
					店面名称: "shopName",
					顾客: "customer",
					操作项目: "project",
					价格: "price",
				};
				//执行的baseObj 根据第一行的内容判断
				let baseObjKey = onRows[0];
				if (baseObjKey.includes("手工操作")) {
					baseObj = { ...shouGongBaseObj, url: "shougong" };
				}
				if (baseObjKey.includes("账目报表")) {
					baseObj = { ...duizhangBaseObj, url: "duizhang" };
				}

				let otherData = "";
				const result = dataRows.map((row, idx) => {
					const obj = {};

					headers.forEach((header, index) => {
						let isHas = [
							"导师",
							"店面名称",
							"操作",
							"时间",
							"咨询",
						].includes(header);

						if (!row[index] && idx > 0 && isHas) {
							row[index] = dataRows[idx - 1][index];
						}
						obj[baseObj[header]] = row[index] || "";
					});

					let isaN = baseObj.url == "shougong" ? "\n" : "";

					// 10.13芊丽金宏19800回款5940
					let refund = that.strTrim(obj.refund)
						? "回款" + that.strTrim(obj.refund)
						: "";
					let str = `${obj.date} ${that.strTrim(
						obj.shopName
					)}${isaN}${that.strTrim(obj.customer)} ${that.strTrim(
						obj.project
					)} ${that.strTrim(obj.performance)}${refund}`;

					if (idx == 0) {
						otherData = `teacher=${obj.teacher}&consultation=${obj.consultation}&operation=${obj.operation}`;
					}

					if (idx == dataRows.length - 1 && obj.share)
						return " " + obj.share;
					return str;
				});

				fun({
					msg: "读取成功",
					name: file.name,
					onRows: onRows[0],
					otherData,
					url: baseObj.url,
					data: result.join("\n"),
				});
			},
			fail(e) {
				fun({ success: 0, msg: "读取失败", error: "", data: list });
			},
		});
	},
	put(json, isopen = true) {
		let that = this;
		return new Promise((resolve, reject) => {
			if (!json || typeof json != "object") {
				resolve({ success: 0, msg: "请传入对象数据", error: "" });
			}

			let platform = uni.getSystemInfoSync().uniPlatform;
			if (platform != "mp-weixin" && platform != "web") {
				resolve({
					success: 0,
					msg: "仅支持网页和微信小程序小程序 其它端请自行实现",
					error: "",
				});
			}
			//转换方法 json => sheet
			let mySheet = xlsx.utils.json_to_sheet(json);
			let workBook = {
				SheetNames: ["mySheet"],
				Sheets: {
					mySheet,
				},
				Props: {},
			};

			// 组成配置输出
			var workBookOutPotion = {
				//bookType 工作簿类型
				bookType: "xlsx",
				//bookSST 生成共享字符串表
				bookSST: false,
				//type 输出数据编码
				type: "array", // ["base64", "binary", "string", "buffer", "file"]
			};

			if (platform == "mp-weixin") {
				workBookOutPotion["type"] = "base64";
				workBookOutPotion["bookSST"] = true;
				var fileData = xlsx.write(workBook, workBookOutPotion);
				let filePath = `${
					wx.env.USER_DATA_PATH
				}/${new Date().getTime()}.xlsx`;

				// 写文件
				const fs = wx.getFileSystemManager();
				fs.writeFile({
					filePath: filePath,
					data: fileData,
					encoding: "base64",
					bookSST: true,
					success(e) {
						const sysInfo = wx.getSystemInfoSync();
						// 导出
						if (
							sysInfo.platform.toLowerCase().indexOf("windows") >=
							0
						) {
							// 电脑PC端导出
							wx.saveFileToDisk({
								filePath: filePath,
								success(e) {
									resolve({
										success: 1,
										msg: "导出成功并打开",
										error: "",
									});
								},
								fail(e) {
									resolve({
										success: 1,
										msg: "导出失败",
										error: e,
									});
								},
							});
						} else {
							if (isopen) {
								// 手机端导出  打开文档
								wx.openDocument({
									filePath: filePath,
									showMenu: true,
									success: function (e) {
										resolve({
											success: 1,
											msg: "导出成功并打开",
											error: "",
										});
									},
									fail(e) {
										resolve({
											success: 0,
											msg: "打开文件失败",
											error: e,
										});
									},
								});
							} else {
								resolve({
									success: 1,
									msg: "导出成功",
									error: "",
								});
							}
						}
					},
					fail(e) {
						resolve({
							success: 0,
							msg: "文档已打开，请先关闭",
							error: e,
						});
					},
				});
				return;
			}

			if (platform == "web" || platform == "h5") {
				xlsx.writeFile(workBook, "下载.xlsx");
				resolve({ success: 1, msg: "导出成功", error: "" });
			}
		});
	},
};

export default m_excel;
