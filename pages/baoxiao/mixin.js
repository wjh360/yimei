export default {
	methods: {
		/**
		 * 解析输入文本并初始化表单数据
		 * @param {String} inputText - 输入的原始文本内容
		 */
		setInit(inputText) {
			try {
				const that = this;

				// 清理HTML标签并将文本按行分割
				const cleanedLines = inputText
					.replace(/<p>/g, "")
					.split("\n")
					.filter(function (line) {
						return line.trim() !== ""; // 过滤空行
					});

				let parsedRecords = []; // 存储解析后的记录
				let originalLines = []; // 存储原始有效行

				cleanedLines.forEach(function (line, index) {
					// 使用正则表达式匹配数字（包括小数）
					const numberPattern = /\d+\.?\d*/g;
					const numbersFound = line.match(numberPattern);

					if (numbersFound) {
						// 如果找到的数字少于2个，则从上一行获取第一个数字
						if (numbersFound.length < 2) {
							const previousLineNumbers =
								cleanedLines[index - 1].match(numberPattern);
							numbersFound.unshift(previousLineNumbers[0]);
						}
						// 如果找到超过2个数字，则输出日志（可能是异常情况）
						else if (numbersFound.length > 2) {
							console.log(numbersFound);
						}

						// 设置月份（仅在month未设置时）
						if (!that.month) {
							that.month = numbersFound[0].split(".")[0];
							// that.$set(that.form, "month", that.month);
						}

						// 提取日期、金额等信息并构建成记录对象
						parsedRecords.push({
							date: numbersFound[0], // 日期
							msg: line // 消息内容
								.replace(numbersFound[0], "") // 移除第一个数字（日期）
								.replace(numbersFound[1], "") // 移除第二个数字（金额）
								.split("共")[0], // 获取"共"字之前的部分
							money: Number(numbersFound[1]).toFixed(2), // 金额，保留两位小数
							type: "货拉拉", // 类型固定为"货拉拉"
							name: that.teacher, // 教师姓名
						});

						originalLines.push(line);
					}
				});

				// 按日期排序（按月份中的日期顺序）
				parsedRecords.sort(function (recordA, recordB) {
					return (
						recordA.date.split(".")[1] - recordB.date.split(".")[1]
					);
				});

				// 保存原始行和解析后的数据
				this.baseArr = originalLines;
				this.parsedData = parsedRecords;
			} catch (error) {
				console.error("解析错误：", error);
				uni.showToast({
					title: "解析错误",
					icon: "none",
				});
			}
		},
	},
};
