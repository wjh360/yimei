const crypto = require("crypto");

exports.main = async (event, context) => {
	const { user } = event;
	const db = uniCloud.database();
	const collection = db.collection("users");

	try {
		await collection.doc(user._id).update(user);
		return {
			code: 0,
			message: "更新成功",
		};
	} catch (error) {
		return {
			code: 1,
			message: "更新失败",
			error: error.message,
		};
	}
};
