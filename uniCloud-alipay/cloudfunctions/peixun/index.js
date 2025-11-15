//添加编辑培训

exports.main = async (event, context) => {
	const {
		title,
		id,
		content,
		fileList,
		type // 1:查询所有， 2删除   不传参数为更新信息

	} = event
	const db = uniCloud.database()
	const collection = db.collection('peixun')

	try {

		const peixunData = await collection.get()


		if (type === 1) { // 查询所有
			// 根据_id 从大到小排序
			return {
				code: 0,
				message: '查询成功',
				data: peixunData.data.sort((a, b) => b.idx - a.idx)
			}
		} else if (type === 2) { // 删除

			if (!id) {
				return {
					code: 1,
					message: '请传入id',
				}
			}

			const result = await collection.doc(id).remove()
			return {
				code: 0,
				message: '删除成功',
			}
		}


		if (!title)
			return {
				code: 1,
				message: '请填写标题',
			}
		if (!content)
			return {
				code: 1,
				message: '请填写内容',
			}
		if (id) { // 编辑
			const result = await collection.doc(id).update({
				title: title,
				content: content,
				fileList: fileList,
			})
		} else { // 添加
			await collection.add({
				title: title,
				content: content,
				fileList: fileList,
				idx: peixunData.data.length + 1,
			})

		}




		return {
			code: 0,
			message: '更新成功',
		}




	} catch (error) {
		return {
			code: 1,
			message: '操作失败',
			error: error.message
		}
	}
}
