exports.main = async (event, context) => {
	// 根据type参数执行不同的操作
	const { type, id, name } = event;
	const db = uniCloud.database();
	const collection = db.collection("shop");
	// 打印完整参数
	console.log("=== 请求参数 ===", JSON.stringify(event));

	// 打印特定字段
	console.log("用户ID:", event.type);
	try {
		switch (type) {
			case "add": // 添加店铺
				if (!name) {
					return {
						code: 1,
						message: "店铺名称不能为空",
					};
				}
				let res = await collection.get();
				// 添加创建时间
				const addData = {
					name: name,
					idx: res.data.length + 1,
				};

				//判断店铺是否已存在
				const list = await collection.where({ name: name }).get();
				if (list.data.length > 0) {
					return {
						code: 1,
						message: "店铺已存在",
					};
				}

				const addResult = await collection.add(addData);
				return {
					code: 0,
					message: "添加店铺成功",
					data: {
						id: addResult.id,
						...addData,
					},
				};

			case "del": // 删除店铺
				if (!id) {
					return {
						code: 1,
						message: "店铺ID不能为空",
					};
				}

				// 先检查店铺是否存在
				const shop = await collection.doc(id).get();
				if (shop.data.length === 0) {
					return {
						code: 1,
						message: "店铺不存在",
					};
				}

				// 删除店铺
				await collection.doc(id).remove();
				return {
					code: 0,
					message: "删除店铺成功",
					data: {
						id: id,
					},
				};
			case 3:
				const a = await collection.get();

				//只返回店铺名称
				return {
					code: 0,
					message: "获取店铺列表成功",
					data: a.data.map((item) => item.name),
				};

			default: // 获取店铺列表
				const result = await collection.get();
				return {
					code: 0,
					message: "获取店铺列表成功",
					data: result.data,
				};
		}
	} catch (error) {
		console.error("店铺操作失败", error);
		return {
			code: 1,
			message: "操作失败",
			error: error.message + `=>type1:获取列表2:添加3:删除`,
		};
	}
};
