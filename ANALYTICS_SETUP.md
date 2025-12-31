# Google Analytics 4 (GA4) Setup Guide

本项目已集成 Google Analytics 4 (GA4) 用于网站数据分析。

## 项目状态

✅ Google Analytics 已集成到所有页面
✅ 共 2601 个 HTML 文件已添加跟踪代码
⚠️ 需要配置实际的 GA4 Measurement ID

## 快速开始

### 步骤 1: 创建 GA4 属性

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 点击左下角的"管理"(Admin)
3. 在"账户"列,选择或创建一个账户
4. 在"媒体资源"列,点击"创建媒体资源"
5. 填写媒体资源信息:
   - 媒体资源名称: `Fractions to Decimals` (或您喜欢的名称)
   - 报告时区: 选择您所在的时区
   - 货币: 选择您所在地的货币
6. 点击"下一步",填写业务信息(可选)
7. 接受服务条款

### 步骤 2: 获取 Measurement ID

1. 创建媒体资源后,您会看到类似这样的 ID: `G-XXXXXXXXXX`
2. 复制这个 Measurement ID

### 步骤 3: 配置项目

1. 打开项目根目录的 `analytics.js` 文件
2. 找到第 12 行:
   ```javascript
   const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
   ```
3. 将 `G-XXXXXXXXXX` 替换为您在步骤 2 中复制的实际 Measurement ID
4. 保存文件

**示例:**
```javascript
const GA_MEASUREMENT_ID = 'G-ABC123XYZ4';
```

### 步骤 4: 验证安装

1. 在浏览器中打开您的网站
2. 打开浏览器开发者工具(F12),切换到 Console 标签
3. 如果配置正确,您应该看到: `Google Analytics: Initialized with ID: G-XXXXXXXXXX`
4. 如果看到警告: `Google Analytics: Measurement ID not configured`,说明您还没有更新 Measurement ID

### 步骤 5: 在 Google Analytics 中查看数据

1. 回到 [Google Analytics](https://analytics.google.com/)
2. 选择您的媒体资源
3. 点击左侧菜单的"实时"(Realtime)
4. 在您的网站上浏览不同页面
5. 在 GA 的实时报告中,您应该能看到自己的访问

## 文件结构

```
fractions/
├── analytics.js                           # GA4 集成脚本
├── index.html                             # 主页(已集成)
├── decimal-to-fraction.html               # 小数转分数工具(已集成)
├── fraction-to-decimal.html               # 分数转小数工具(已集成)
├── templates/
│   └── fraction-as-decimal.html           # 模板文件(已集成)
├── examples/
│   ├── decimals/                          # 小数示例页面(已集成)
│   └── fractions/                         # 分数示例页面(已集成)
└── scripts/
    └── add-analytics.js                   # 批量添加分析代码的脚本
```

## 功能特性

### 自动页面浏览跟踪
所有页面的浏览会自动跟踪,无需额外配置。

### 隐私保护
- 已启用 IP 匿名化 (anonymize_ip: true)
- 已禁用广告信号 (allow_google_signals: false)
- 符合 GDPR 合规要求

### 自定义事件跟踪
项目包含一个辅助函数用于跟踪自定义事件:

```javascript
// 在任何 JavaScript 文件中使用
trackEvent('button_click', {
    button_name: 'convert',
    page: 'decimal-to-fraction'
});
```

**使用示例:**

在 `decimal-to-fraction.js` 或 `fraction-to-decimal.js` 中添加:

```javascript
// 跟踪转换按钮点击
const convertBtn = document.getElementById('generateBtn');
if (convertBtn) {
    convertBtn.addEventListener('click', () => {
        trackEvent('conversion', {
            tool: 'decimal-to-fraction',
            action: 'generate'
        });
    });
}
```

## 高级配置

### 排除内部流量

如果您想排除自己的访问,可以在 GA 中设置:

1. 在 GA 中,前往: 管理 > 数据流 > 点击您的数据流
2. 展开"配置代码设置"
3. 在"组织代码"中,点击"定义内部流量"
4. 创建流量类型规则(例如根据 IP 地址)
5. 返回数据流设置,在"组织代码"中应用该规则

### 跨域跟踪
如果您的网站涉及多个域名,需要在 GA 中配置:

1. 前往: 管理 > 数据流 > 点击您的数据流
2. 展开"配置代码设置"
3. 在"组织代码"中,点击"配置跨域归因"
4. 添加您的域名列表

### 自定义维度
如需跟踪自定义数据(如用户语言偏好):

1. 前往: 管理 > 自定义定义
2. 创建自定义维度
3. 在 `analytics.js` 中配置发送该维度

## 故障排查

### 问题 1: 控制台显示 "Measurement ID not configured"
**解决方案:** 更新 `analytics.js` 中的 `GA_MEASUREMENT_ID` 为您的实际 ID。

### 问题 2: GA 中没有看到数据
**可能原因:**
- Measurement ID 配置错误
- 浏览器安装了广告拦截器
- 处于实时报告的 24-48 小时延迟(仅限标准报告,实时报告应该立即可见)

**解决方案:**
- 检查浏览器控制台是否有错误
- 确认 Measurement ID 格式正确 (G-XXXXXXXXXX)
- 尝试禁用广告拦截器
- 等待几分钟后再查看实时报告

### 问题 3: 页面浏览数不正确
**解决方案:** 检查是否有多余的 GA 代码或重复的脚本加载。

## 维护脚本

### 重新添加 Analytics 代码

如果将来添加了新的 HTML 页面,可以运行:

```bash
node scripts/add-analytics.js
```

该脚本会:
- 扫描所有 `.html` 文件
- 跳过已有 `analytics.js` 的文件
- 为没有的文件添加 `<script src="/analytics.js"></script>`

## 相关资源

- [Google Analytics 4 文档](https://support.google.com/analytics#topic=9143130)
- [GA4 设置助手](https://analytics.google.com/analytics/web/#/ga4-setup/)
- [Google Analytics 帮助中心](https://support.google.com/analytics)
- [GDPR 合规指南](https://developers.google.com/analytics/devguides/collection/ga4/privacy-controls)

## 技术支持

如有问题,请检查:
1. 浏览器控制台的错误信息
2. `analytics.js` 的配置是否正确
3. Google Analytics 管理界面中的数据流状态

---

**最后更新:** 2025-12-31
**集成状态:** ✅ 完成 (待配置 Measurement ID)
**覆盖范围:** 2601 个 HTML 页面
