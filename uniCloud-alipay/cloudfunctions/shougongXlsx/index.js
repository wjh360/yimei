const ExcelJS = require('exceljs');

/**
 * 生成Excel文件数据
 * @param {Array} rows - 数据行数组
 * @param {Object} table - 表格配置对象
 * @returns {Promise<Buffer>} Excel文件的Buffer数据
 */
async function generateExcel(rows, table) {
	// 创建工作簿和工作表
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Sheet1');

	// 定义表头字段
	const headers = ["时间", "店面名称", "顾客", "操作项目", "价格"];

	// 深拷贝数据以避免修改原始数据
	const dataRows = JSON.parse(JSON.stringify(rows));

	// 生成文件名（使用月份信息）
	const fileName = (table.teacher + String(dataRows[0].date).split(".")[0]) + "月份手工操作记录表";

	// 转换数据格式
	const formattedRows = dataRows.map(el => [
		el.date || " ",
		el.shopName || " ",
		el.customer || " ",
		el.project || " ",
		" ",
	]);

	// 添加标题行并合并单元格
	const titleRow = worksheet.addRow([fileName]);
	worksheet.mergeCells(1, 1, 1, headers.length); // 合并第一行所有列

	// 设置标题样式
	const titleCell = titleRow.getCell(1);
	titleCell.font = {
		bold: true,
		size: 16
	};
	titleCell.alignment = {
		vertical: 'middle',
		horizontal: 'center'
	};
	titleCell.fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: {
			argb: 'FFD9EAD3' // 浅绿色背景
		}
	};
	titleRow.height = 40; // 设置标题行高度

	// 添加表头行
	const headerRow = worksheet.addRow(headers);
	headerRow.height = 30; // 设置表头行高度

	// 设置列宽和默认对齐方式
	worksheet.columns = headers.map((header) => ({
		width: Math.max(header.length * 2, 15),
		style: {
			alignment: {
				vertical: 'middle',
				horizontal: 'center'
			}
		}
	}));

	// 设置表头行样式
	headerRow.eachCell((cell) => {
		cell.font = {
			bold: true,
			size: 12
		};
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {
				argb: 'FFE0E0E0' // 灰色背景
			}
		};
		cell.border = {
			top: {
				style: 'thin'
			},
			left: {
				style: 'thin'
			},
			bottom: {
				style: 'thin'
			},
			right: {
				style: 'thin'
			}
		};
		cell.alignment = {
			vertical: 'middle',
			horizontal: 'center'
		};
	});

	// 添加数据行
	worksheet.addRows(formattedRows);

	// 设置数据行样式和高度
	for (let i = 2; i <= worksheet.rowCount; i++) {
		const row = worksheet.getRow(i);
		row.height = 25; // 设置数据行高度

		row.eachCell((cell) => {
			cell.border = {
				top: {
					style: 'thin'
				},
				left: {
					style: 'thin'
				},
				bottom: {
					style: 'thin'
				},
				right: {
					style: 'thin'
				}
			};
			cell.alignment = {
				vertical: 'middle',
				horizontal: 'center'
			};
		});
	}

	/**
	 * 合并相同内容的单元格（除数字列外）
	 * @param {Worksheet} sheet - Excel工作表
	 * @param {Array} headers - 表头数组
	 */
	const mergeColumns = (sheet, headers) => {
		// 数字列不合并
		const numericColumns = ["操作项目", "价格"];

		headers.forEach((header, colIndex) => {
			// 跳过数字列
			if (numericColumns.includes(header)) return;

			let startRow = 2; // 从数据行开始（第1行是标题，第2行是表头）
			let currentValue = sheet.getCell(startRow, colIndex + 1).value;

			// 遍历所有行，查找相同值进行合并
			for (let row = 3; row <= sheet.rowCount; row++) {
				const cellValue = sheet.getCell(row, colIndex + 1).value;

				if (cellValue !== currentValue) {
					// 如果值发生变化且有连续相同值，则合并
					if (row - 1 > startRow) {
						sheet.mergeCells(startRow, colIndex + 1, row - 1, colIndex + 1);
					}
					startRow = row;
					currentValue = cellValue;
				}
			}

			// 合并最后一组相同值
			if (sheet.rowCount > startRow) {
				sheet.mergeCells(startRow, colIndex + 1, sheet.rowCount, colIndex + 1);
			}
		});
	};

	// 执行合并操作
	mergeColumns(worksheet, headers);


	// 导出为 Buffer
	return await workbook.xlsx.writeBuffer();
}

/**
 * 云函数入口函数
 * @param {Object} event - 云函数调用参数
 * @param {Array} event.rows - 数据行
 * @param {Object} event.table - 表格配置
 * @param {Object} context - 云函数上下文
 * @returns {Object} 处理结果
 */
exports.main = async (event, context) => {
	const {
		rows,
		table
	} = event;

	try {
		// 生成Excel文件数据
		const buffer = await generateExcel(rows, table);

		// 生成存储文件名（使用时间戳，避免中文路径问题）
		const storageFileName = `xlsx_${new Date().getTime()}.xlsx`;

		// 上传到云存储
		const result = await uniCloud.uploadFile({
			cloudPath: storageFileName,
			fileContent: buffer
		});

		// 获取文件的临时访问链接（设置10分钟有效期）
		const fileUrl = await uniCloud.getTempFileURL({
			fileList: [result.fileID],
			maxAge: 600 // 10分钟 = 600秒
		});

		// 十分钟后删除文件（延迟清理）
		setTimeout(() => {
			uniCloud.deleteFile({
				fileList: [result.fileID]
			});
		}, 10 * 60 * 1000);

		return {
			code: 0,
			message: '文件生成成功',
			data: {
				filePath: result.fileID,
				tempUrl: fileUrl.fileList[0].tempFileURL
			}
		};

	} catch (error) {
		console.error('文件生成失败:', error);
		return {
			code: 1,
			message: '文件生成失败',
			error: error.message
		};
	}
};
