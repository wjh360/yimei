exports.main = async (event, context) => {
	// 根据type参数执行不同的操作
	const { type, id, name } = event;
	const db = uniCloud.database();
	const collection = db.collection("project");

	try {
		switch (type) {
			case "add": // 添加项目
				if (!name) {
					return {
						code: 1,
						message: "项目名称不能为空",
					};
				}
				let res = await collection.get();
				// 添加创建时间
				const addData = {
					name: name,
					idx: res.data.length + 1,
				};

				//判断项目是否已存在
				const list = await collection.where({ name: name }).get();
				if (list.data.length > 0) {
					return {
						code: 1,
						message: "项目已存在",
					};
				}

				const addResult = await collection.add(addData);
				return {
					code: 0,
					message: "添加项目成功",
					data: {
						id: addResult.id,
						...addData,
					},
				};

			case "del": // 删除项目
				if (!id) {
					return {
						code: 1,
						message: "项目ID不能为空",
					};
				}

				// 先检查项目是否存在
				const shop = await collection.doc(id).get();
				if (shop.data.length === 0) {
					return {
						code: 1,
						message: "项目不存在",
					};
				}

				// 删除项目
				await collection.doc(id).remove();
				return {
					code: 0,
					message: "删除项目成功",
					data: {
						id: id,
					},
				};
			case 3: // 排序
				const a = await collection.get();

				//只返回项目名称
				return {
					code: 0,
					message: "获取项目列表成功",
					data: a.data.map((item) => item.name),
				};

			default:
				const result = await collection.get();
				//逆序排序
				result.data.sort((a, b) => b.idx - a.idx);
				return {
					code: 0,
					message: "获取项目列表成功",
					data: result.data,
				};
		}
	} catch (error) {
		console.error("项目操作失败", error);
		return {
			code: 1,
			message: "操作失败",
			error: error.message + `=>type1:获取列表2:添加3:删除`,
		};
	}
};
