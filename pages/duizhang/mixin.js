export default {
	methods: {
		setInit(rawText) {
			for (
				var processedLines = rawText
						.replace(/打扮/g, "打版")
						.replace(/尚成美业/g, "尚城美业")
						.replace(/尚美家人/g, "尚美佳人")
						.replace(/尚美嘉人/g, "尚美佳人")
						.replace(/<p>/g, "")
						.replace(/&nbsp;/g, "")
						.split("\n")
						.filter(function (line) {
							return line;
						}),
					index = 0;
				index < processedLines.length;
				index++
			) {
				var currentLine = processedLines[index];
				0 == currentLine.indexOf("回款") &&
					((processedLines[index - 1] =
						processedLines[index - 1] + " " + currentLine),
					processedLines.splice(index, 1));
			}
			this.baseArr = [...processedLines];

			try {
				this.filterTableData(processedLines);
			} catch (error) {
				uni.showToast({
					title: "解析错误",
					icon: "none",
				});
			}
		},
		filterTableData(lines) {
			var self = this,
				resultArray = [],
				currentDate = "",
				currentShop = "";

			let notRemark = !self.remark;

			lines.forEach(function (line, index) {
				0 == line.indexOf("共计") &&
					(lines[index - 1] = lines[index - 1] + " " + line);

				if (
					notRemark &&
					(line.indexOf("共计咨询") > -1 ||
						line.indexOf("共计售前") > -1)
				) {
					//如果line中含有月份 则只取月份后面的内容
					if (line.indexOf("月份") > -1) {
						self.remark =
							self.remark +
							line.slice(line.indexOf("月份") + 2) +
							" ";
					} else self.remark = self.remark + line + " ";
				}
			});
			(lines = lines.filter(function (line) {
				return (
					0 == !line.indexOf("共计") &&
					line.indexOf("共计咨询") == -1 &&
					line.indexOf("共计售前") == -1
				);
			})).forEach(function (line, lineIndex) {
				if ((line = line.replace("\n", "").trim().replace(" ", ""))) {
					var rowData = {};
					if (/^\d+?\.\d+/.test(line)) {
						var dateMatches = line.match(/\d+\.?\d*/g);
						(currentDate = dateMatches[0]),
							(line = line.replace(currentDate, ""));
					}
					rowData = {
						date: currentDate,
					};
					var matchedShop = self.shopNames.filter(function (
						shopName
					) {
						if (line.includes(shopName))
							return (
								(line = line.replace(shopName, "")), shopName
							);
					})[0];
					(currentShop = matchedShop || currentShop),
						(rowData.shopName = currentShop);
					var matchedProject = self.projects.filter(function (
						projectName
					) {
						if (line.includes(projectName)) return projectName;
					})[0];
					rowData.project = matchedProject;
					var projectSplit = line.split(matchedProject);
					if (projectSplit && 2 == projectSplit.length) {
						var refundIndex = projectSplit[1].indexOf("回款");
						(rowData.customer = projectSplit[0]),
							(rowData.performance =
								-1 != refundIndex
									? projectSplit[1].slice(0, refundIndex)
									: projectSplit[1]);
					}
					var numberMatches = line.match(/\d+\.?\d*/g);
					if (
						(line.indexOf("实际") > -1
							? ((rowData.fencheng =
									"实际:" +
									numberMatches[numberMatches.length - 1]),
							  line.indexOf("回款") > -1 &&
									(rowData.refund =
										numberMatches[
											numberMatches.length - 2
										] || ""))
							: line.indexOf("回款") > -1 &&
							  (rowData.refund =
									numberMatches[numberMatches.length - 1] ||
									""),
						line.indexOf("售前") > -1 &&
							rowData.refund &&
							(rowData.refund += "(售前)"),
						!rowData.OptName)
					)
						try {
							var performanceNumbers =
								self.splitStringByNumbers(line);
							rowData.performance = performanceNumbers[0];
							var chineseWords = self.splitChineseWords(line);
							rowData.customer =
								chineseWords[0] && "回款" != chineseWords[0]
									? chineseWords[0]
									: "";
						} catch (error) {}
					rowData.customer &&
						matchedProject &&
						rowData.customer.indexOf(matchedProject) > -1 &&
						(rowData.customer = rowData.customer.replace(
							matchedProject,
							""
						)),
						(rowData.teacher = self.teacher),
						(rowData.operation = self.operation),
						(rowData.consultation = self.teacher),
						rowData.performance && resultArray.push(rowData);

					// console.log(rowData);
				}
			}),
				resultArray.sort(function (first, second) {
					return first.date.split(".")[1] - second.date.split(".")[1];
				}),
				this.filterData(resultArray);
		},
		findMaxCount(dataArray, propertyName, startIndex) {
			if ((startIndex = startIndex || 0) >= dataArray.length)
				return dataArray;
			for (
				var currentValue = dataArray[startIndex][propertyName],
					count = 1,
					nextIndex = startIndex + 1;
				nextIndex < dataArray.length;
				nextIndex++
			) {
				if (dataArray[nextIndex][propertyName] !== currentValue)
					return (
						(dataArray[startIndex][propertyName + "Count"] = count),
						this.findMaxCount(dataArray, propertyName, nextIndex)
					);
				count++,
					(dataArray[nextIndex][propertyName + "Count"] = 0),
					(dataArray[startIndex][propertyName + "Count"] = count);
			}
			return dataArray;
		},
		filterData(dataArray) {
			var processedData = this.findMaxCount(dataArray, "shopName");
			processedData[processedData.length - 1].shopNameCount ||
				processedData[processedData.length - 2].shopName ==
					processedData[processedData.length - 1].shopName ||
				(processedData[processedData.length - 1].shopNameCount = 1),
				(this.parsedData = this.findMaxCount(processedData, "date"));
		},
		splitStringByNumbers(text) {
			return (text.match(/\d+/g) || []).map(Number);
		},
		splitChineseWords(text) {
			return text.match(/[a-z|A-Z]+/g) || text.match(/[\u4e00-\u9fa5]+/g);
		},
	},
};
