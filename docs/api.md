# API 文档

## 用户相关

### 登录

- **接口名称**: login
- **描述**: 用户登录接口
- **参数**:
  - `username`: 用户名
  - `password`: 密码
- **返回值**:
  - `code`: 状态码（0表示成功）
  - `message`: 状态信息
  - `data`: 用户信息对象

### 更新用户信息

- **接口名称**: updateUserInfo
- **描述**: 更新用户个人信息
- **参数**:
  - `userId`: 用户ID
  - `name`: 用户名称
  - `avatar`: 头像URL
  - `newPassword`: 新密码（可选）
- **返回值**:
  - `code`: 状态码（0表示成功）
  - `message`: 状态信息

## 报表相关

### 添加报表

- **接口名称**: addReport
- **描述**: 添加新的报表
- **参数**:
  - `userId`: 用户ID
  - `date`: 报表日期
  - `storeName`: 店面名称
  - `customerName`: 顾客名称
  - `performance`: 业绩金额
  - `projectName`: 项目名称（可选）
  - `commission`: 分成金额（可选）
  - `actual`: 实际金额（可选）
  - `operation`: 操作信息（可选）
  - `remark`: 备注（可选）
- **返回值**:
  - `code`: 状态码（0表示成功）
  - `message`: 状态信息
  - `data`: 新增报表的ID

### 查询报表

- **接口名称**: queryReports
- **描述**: 查询报表列表
- **参数**:
  - `userId`: 用户ID
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `page`: 页码
  - `pageSize`: 每页数量
- **返回值**:
  - `code`: 状态码（0表示成功）
  - `message`: 状态信息
  - `data`: 报表列表
  - `total`: 总数量

## 报销相关

### 添加报销

- **接口名称**: addExpense
- **描述**: 添加新的报销
- **参数**:
  - `userId`: 用户ID
  - `date`: 报销日期
  - `amount`: 报销金额
  - `category`: 报销类别
  - `description`: 报销描述
  - `images`: 报销凭证图片URL数组
- **返回值**:
  - `code`: 状态码（0表示成功）
  - `message`: 状态信息
  - `data`: 新增报销的ID

### 查询报销

- **接口名称**: queryExpenses
- **描述**: 查询报销列表
- **参数**:
  - `userId`: 用户ID
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `page`: 页码
  - `pageSize`: 每页数量
- **返回值**:
  - `code`: 状态码（0表示成功）
  - `message`: 状态信息
  - `data`: 报销列表
  - `total`: 总数量

## 日报相关

### 添加日报

- **接口名称**: addDailyReport
- **描述**: 添加新的日报
- **参数**:
  - `userId`: 用户ID
  - `date`: 日报日期
  - `content`: 日报内容
  - `tasks`: 任务列表
- **返回值**:
  - `code`: 状态码（0表示成功）
  - `message`: 状态信息
  - `data`: 新增日报的ID

### 查询日报

- **接口名称**: queryDailyReports
- **描述**: 查询日报列表
- **参数**:
  - `userId`: 用户ID
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `page`: 页码
  - `pageSize`: 每页数量
- **返回值**:
  - `code`: 状态码（0表示成功）
  - `message`: 状态信息
  - `data`: 日报列表
  - `total`: 总数量

注意：此文档需要根据实际的接口实现进行更新和完善。