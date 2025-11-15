# 页面风格指南

## 整体设计原则

1. 现代简约

   - 使用清晰的布局
   - 保持足够的留白
   - 避免过度装饰

2. 一致性

   - 使用统一的颜色方案
   - 保持组件样式一致
   - 维持交互模式统一

3. 响应式设计
   - 适配不同屏幕尺寸
   - 合理的间距和留白
   - 流畅的动画效果

## 颜色规范

1. 主色调

   - 主色：#4158d0
   - 辅助色：#c850c0
   - 背景色：#f8f9fa

2. 文字颜色

   - 主要文字：#333333
   - 次要文字：#666666
   - 提示文字：#999999

3. 功能色
   - 成功：#52c41a
   - 警告：#faad14
   - 错误：#ff4757
   - 链接：#1890ff

## 组件样式

1. 卡片

```scss
.card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(238, 238, 238, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}
```

2. 按钮

```scss
.button {
  background: linear-gradient(135deg, #4158d0 0%, #c850c0 100%);
  border-radius: 25px;
  color: white;
  font-weight: bold;
  padding: 12px 24px;
  box-shadow: 0 4px 8px rgba(72, 84, 208, 0.25);
}
```

3. 输入框

```scss
.input {
  background-color: rgba(241, 245, 249, 0.8);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(238, 238, 238, 0.8);
}
```

## 布局规范

1. 页面结构

   - 顶部导航/标题
   - 内容区域
   - 底部操作栏（如需要）

2. 间距使用

   - 页面内边距：20px
   - 组件间距：16px
   - 文字间距：8px

3. 响应式布局
   - 使用 flex 布局
   - 合理使用媒体查询
   - 保持内容居中对齐

## 动画效果

在小程序环境中，我们应该谨慎使用动画效果，以确保良好的性能和兼容性。以下是一些简单的动画效果，可以在适当的场景下使用：

1. 简单的透明度变化

```scss
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

2. 简单的缩放效果

```scss
.scale-in {
  animation: scaleIn 0.3s ease-in-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
  }
  to {
    transform: scale(1);
  }
}
```

注意：在小程序中使用动画时，应当注意性能影响，并确保在各种设备上都能流畅运行。

## 表单验证

1. 使用统一的验证工具

```javascript
import FormValidator from "@/static/utils/formValidator.js";

// 验证规则示例
const rules = {
  name: [{ required: true, message: "请输入姓名" }],
  phone: [
    { required: true, message: "请输入手机号" },
    { type: "phone", message: "请输入有效的手机号" },
  ],
};

// 验证使用
if (!FormValidator.validateAndShowError(form, rules)) {
  return;
}
```

## 图标使用

1. 统一使用 uView 的图标
2. 图标大小规范
   - 小图标：20px
   - 中图标：24px
   - 大图标：32px

## 最佳实践

1. 页面模板

```vue
<template>
  <view class="page-container">
    <!-- 页面内容 -->
    <view class="card animate-fade-in-up">
      <!-- 卡片内容 -->
    </view>

    <!-- 底部按钮 -->
    <view class="submit-section">
      <u-button class="submit-btn" type="primary"> 确认 </u-button>
    </view>
  </view>
</template>
```

2. 样式使用

```scss
<style lang="scss" scoped>
@import '@/static/styles/global.scss';

.page-container {
  // 使用全局样式变量和混合器
  background: linear-gradient(135deg, $background-color 0%, darken($background-color, 5%) 100%);

  .card {
    @include glass-effect;
    @include card-shadow;
  }
}
</style>
```

## 注意事项

1. 保持代码整洁

   - 合理的组件拆分
   - 清晰的命名规范
   - 注释关键代码

2. 性能优化

   - 合理使用计算属性
   - 避免过度渲染
   - 优化图片资源
   - 减少不必要的动画效果
   - 使用小程序的原生组件替代自定义组件（如可能）

3. 用户体验

   - 添加适当的加载状态
   - 合理的错误提示
   - 友好的空状态展示
   - 确保界面元素有足够的点击区域
   - 适配不同尺寸的移动设备屏幕

4. 小程序特性

   - 遵循小程序的设计规范和限制
   - 使用小程序提供的 API 替代 Web API
   - 注意小程序的页面栈限制和内存管理
   - 合理使用分包加载优化首次启动时间

5. 跨平台兼容
   - 测试在不同型号的设备上的表现
   - 避免使用可能不被广泛支持的 CSS 特性
   - 使用条件编译处理平台差异
