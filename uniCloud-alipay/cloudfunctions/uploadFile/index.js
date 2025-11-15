'use strict';

exports.main = async (event, context) => {
	// 根据fileID 获取访问链接

	const fileUrl = await uniCloud.getTempFileURL({
		fileList: [event.fileID],
	});

	// 返回公开可访问的URL
	return {
		code: 0,
		message: '文件上传成功',
		data: {
			fileID: event.fileID,
			publicURL: fileUrl.fileList[0].tempFileURL
		}
	}
};
