const crypto = require('crypto')

exports.main = async (event, context) => {
  const { userId, name, newPassword, avatar } = event
  const db = uniCloud.database()
  const collection = db.collection('users')

  const updateData = {}
  if (name) updateData.name = name
  if (avatar) updateData.avatar = avatar
  if (newPassword) {
    const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex')
    updateData.password = hashedPassword
  }

  try {
    await collection.doc(userId).update(updateData)
    return {
      code: 0,
      message: '更新成功'
    }
  } catch (error) {
    return {
      code: 1,
      message: '更新失败',
      error: error.message
    }
  }
}