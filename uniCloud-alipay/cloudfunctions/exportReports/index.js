const ExcelJS = require("exceljs");

// 生成Excel文件数据
async function generateExcel(rows, table) {
	// 创建工作簿和工作表
	const workbook = await new ExcelJS.Workbook();
	const worksheet = await workbook.addWorksheet("Sheet1");

	// 调试日志
	let headers = ["时间", "店名/产品/车销", "费用", "报销凭证", "报销人"];
	rows = JSON.parse(JSON.stringify(rows));

	let fileName =
		(table.month || rows[0][2].split(".")[0]) + "月份公司内部人员报销单";

	let newArr = [];

	rows.forEach((el) => {
		let arr = [];

		newArr.push([
			el.date || " ",
			el.msg || " ",
			el.money || " ",
			el.type || " ",
			el.name || " ",
		]);
	});

	rows = newArr;

	// 添加表头行并合并居中
	let titleRow = await worksheet.addRow([fileName]);
	await worksheet.mergeCells(1, 1, 1, headers.length); // 合并第一行所有列
	const titleCell = await titleRow.getCell(1);
	titleCell.font = {
		bold: true,
		size: 16,
	};

	titleCell.alignment = {
		vertical: "middle",
		horizontal: "center",
	};
	titleCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: {
			argb: "FFD9EAD3",
		}, // 浅绿色背景
	};
	titleRow.height = 40; // 设置标题行高度

	// 添加列标题行
	let headerRow2 = await worksheet.addRow(headers);
	headerRow2.height = 30; // 设置表头行高度

	// 设置列宽和默认对齐方式
	worksheet.columns = headers.map((header) => ({
		width: Math.max(header.length * 2, 15),
		style: {
			alignment: {
				vertical: "middle",
				horizontal: "center",
			},
		},
	}));

	// 设置表头行样式
	let headerRow3 = worksheet.getRow(1);
	headerRow3.eachCell((cell) => {
		cell.font = {
			bold: true,
			size: 12,
		};
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: {
				argb: "FFE0E0E0",
			},
		};
		cell.border = {
			top: {
				style: "thin",
			},
			left: {
				style: "thin",
			},
			bottom: {
				style: "thin",
			},
			right: {
				style: "thin",
			},
		};
		cell.alignment = {
			vertical: "middle",
			horizontal: "center",
		};
	});

	// 预处理回款情况数据(第7列/G列)

	// 添加数据行
	await worksheet.addRows(rows);
	// 调试：打印前3行数据内容

	// 设置数据行样式和高度
	for (let i = 2; i <= worksheet.rowCount; i++) {
		const row = worksheet.getRow(i);
		row.height = 25; // 设置数据行高度
		row.eachCell((cell) => {
			cell.border = {
				top: {
					style: "thin",
				},
				left: {
					style: "thin",
				},
				bottom: {
					style: "thin",
				},
				right: {
					style: "thin",
				},
			};
			cell.alignment = {
				vertical: "middle",
				horizontal: "center",
			};
		});
	}

	// 合并相同内容的单元格（除数字列外）
	const mergeColumns = (sheet, headers) => {
		const numericColumns = ["业绩", "操作项目", "回款情况", "分成", "商务"]; // 数字列不合并

		headers.forEach((header, colIndex) => {
			if (numericColumns.includes(header)) return;

			let startRow = 2; // 从数据行开始
			let currentValue = sheet.getCell(startRow, colIndex + 1).value;

			for (let row = 3; row <= sheet.rowCount; row++) {
				const cellValue = sheet.getCell(row, colIndex + 1).value;

				if (cellValue !== currentValue) {
					if (row - 1 > startRow) {
						sheet.mergeCells(
							startRow,
							colIndex + 1,
							row - 1,
							colIndex + 1
						);
					}
					startRow = row;
					currentValue = cellValue;
				}
			}

			// 合并最后一组
			if (sheet.rowCount > startRow) {
				sheet.mergeCells(
					startRow,
					colIndex + 1,
					sheet.rowCount,
					colIndex + 1
				);
			}
		});
	};

	// 执行合并
	// await mergeColumns(worksheet, headers);

	// 添加合计行
	const totalRow = worksheet.addRow([]);
	for (var i = 1; i <= 5; i++) {
		totalRow.getCell(i).value = "";
	}
	totalRow.getCell(1).value = "合计";
	totalRow.getCell(3).value = table.allMoney;

	totalRow.height = 30;
	// 设置合计行样式
	totalRow.eachCell((cell) => {
		cell.border = {
			top: {
				style: "thin",
			},
			left: {
				style: "thin",
			},
			bottom: {
				style: "thin",
			},
			right: {
				style: "thin",
			},
		};
		cell.alignment = {
			vertical: "middle",
			horizontal: "center",
		};
		if (cell.col > 5) {
			cell.font = {
				bold: true,
			};
		}
	});

	// 合并第8列及后面的列
	if (headers.length > 3) {
		worksheet.mergeCells(
			totalRow.number,
			4,
			totalRow.number,
			headers.length
		);
		// 设置合并后单元格的值和样式
		const mergedCell = totalRow.getCell(4);
		mergedCell.value = "";
		mergedCell.alignment = {
			vertical: "middle",
			horizontal: "center",
		};
	}

	// 导出为 Buffer
	return await workbook.xlsx.writeBuffer();
}

exports.main = async (event, context) => {
	const { rows, table } = event;

	try {
		// 生成Excel文件数据
		const buffer = await generateExcel(rows, table);

		// 生成存储文件名（使用时间戳，避免中文路径问题）
		const storageFileName = `xlsx_${new Date().getTime()}.xlsx`;

		// 上传到云存储
		const result = await uniCloud.uploadFile({
			cloudPath: storageFileName,
			fileContent: buffer,
		});

		// 获取文件的临时访问链接（设置10分钟有效期）
		const fileUrl = await uniCloud.getTempFileURL({
			fileList: [result.fileID],
			maxAge: 600, // 10分钟 = 600秒
		});
		// 1分钟后删除文件
		setTimeout(() => {
			uniCloud.deleteFile({
				fileList: [result.fileID],
			});
		}, 60 * 1000);
		console.log(
			"文件上传成功，临时访问链接：",
			fileUrl.fileList[0].tempFileURL
		);
		return {
			code: 0,
			message: "文件生成成功",
			data: {
				filePath: result.fileID,
				tempUrl: fileUrl.fileList[0].tempFileURL,
			},
		};
	} catch (error) {
		console.error("文件生成失败:", error);
		return {
			code: 1,
			message: "文件生成失败",
			error: error.message,
		};
	}
};
