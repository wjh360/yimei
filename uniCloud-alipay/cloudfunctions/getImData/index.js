exports.main = async (event, context) => {
	const { yearMonth } = event;
	const db = uniCloud.database();
	const imData = db.collection("im-data");

	return await imData
		.where({
			yearMonth: yearMonth,
		})
		.get();
};
