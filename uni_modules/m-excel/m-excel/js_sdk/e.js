import xlsx from "./xlsx.mini.min.js";

const m_excel = {
	read(file) {
		let that = this;
		return new Promise((resolve, reject) => {
			that.read_file(file, (e) => {
				resolve(e);
			});
		});
	},
	strTrim(str) {
		if (!str || str == " ") return "";
		return str;
	},
	async read_file(file, fun) {
		let platform = uni.getSystemInfoSync().uniPlatform;
		let that = this;
		if (platform == "mp-weixin") {
			const fs = wx.getFileSystemManager();
			fs.readFile({
				filePath: file.path,
				success(e) {
					// console.log("读取文件成功", e.data);
					const workbook = xlsx.read(new Uint8Array(e.data), {
						type: "array",
						//从第二行开始读取数据
						raw: true,
					});
					// 1. 先读取表头（第一行）
					const headers = xlsx.utils.sheet_to_json(
						workbook.Sheets[workbook.SheetNames[0]],
						{
							header: 1,
							range: 1, // 只读第一行
							raw: false,
						}
					)[0]; // ['姓名', '年龄', '城市']

					// 2. 再读取数据（从第二行开始）
					const dataRows = xlsx.utils.sheet_to_json(
						workbook.Sheets[workbook.SheetNames[0]],
						{
							header: 1,
							range: 2, // 从第二行开始
							defval: "", // 空单元格默认值
						}
					);

					let baseObj = {
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
					console.log("表头", dataRows);

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

						// 10.13芊丽金宏19800回款5940
						let refund = that.strTrim(obj.refund)
							? "回款" + that.strTrim(obj.refund)
							: "";
						let str = `${obj.date}${that.strTrim(
							obj.shopName
						)}${that.strTrim(obj.customer)}${that.strTrim(
							obj.project
						)}${that.strTrim(obj.performance)}${refund}`;

						if (idx == dataRows.length - 1) return obj.share;
						return str;
					});

					fun({
						success: 1,
						msg: "读取成功",
						error: "",
						data: result.join("\n"),
					});
				},
				fail(e) {
					fun({ success: 0, msg: "读取失败", error: "", data: list });
				},
			});
		}
		if (platform == "web" || platform == "h5") {
			const data = await file.arrayBuffer();
			const workbook = xlsx.read(data);
			let list = xlsx.utils.sheet_to_json(
				workbook.Sheets[workbook.SheetNames[0]]
			);
			fun({ success: 1, msg: "读取成功", error: "", data: list });
		}
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
