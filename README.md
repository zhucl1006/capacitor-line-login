# 📱 Capacitor Line Login Plugin

一个功能完整的 Capacitor 插件，支持 Line Login 在 Android、iOS 和 Web 平台上的集成。

[![npm version](https://badge.fury.io/js/capacitor-line-login.svg)](https://badge.fury.io/js/capacitor-line-login)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🚀 **跨平台支持**: Android、iOS 和 Web 平台
- 🔐 **完整的 OAuth 2.0 流程**: 支持授权码模式和 PKCE
- 🛡️ **安全性**: 内置 CSRF 防护和状态验证
- 📱 **原生体验**: 在移动设备上使用原生 Line SDK
- 🌐 **Web 兼容**: 在浏览器中使用 Line Login Web API
- 🔧 **TypeScript 支持**: 完整的类型定义
- 📖 **详细文档**: 包含平台特定配置指南

## 📦 安装

```bash
npm install capacitor-line-login
npx cap sync
```

## 🚀 快速开始

### 1. 初始化插件

```typescript
import { LineLogin } from 'capacitor-line-login';

// 基本配置
await LineLogin.initialize({
  channelId: 'YOUR_LINE_CHANNEL_ID',
  scope: ['profile']
});

// 完整配置（Web 平台）
await LineLogin.initialize({
  channelId: 'YOUR_LINE_CHANNEL_ID',
  redirectUri: 'https://your-domain.com/line-callback',
  scope: ['profile', 'openid'],
  botPrompt: 'normal'
});
```

### 2. 执行登录

```typescript
try {
  const result = await LineLogin.login();
  console.log('登录成功:', result);
  console.log('访问令牌:', result.accessToken);
  console.log('用户信息:', result.userProfile);
} catch (error) {
  console.error('登录失败:', error);
}
```

### 3. 获取用户信息

```typescript
try {
  const profile = await LineLogin.getUserProfile();
  console.log('用户ID:', profile.userId);
  console.log('显示名称:', profile.displayName);
  console.log('头像URL:', profile.pictureUrl);
} catch (error) {
  console.error('获取用户信息失败:', error);
}
```

### 4. 检查登录状态

```typescript
const { isLoggedIn } = await LineLogin.isLoggedIn();
if (isLoggedIn) {
  console.log('用户已登录');
} else {
  console.log('用户未登录');
}
```

### 5. 登出

```typescript
await LineLogin.logout();
console.log('登出成功');
```

## 🔧 平台配置

### Android 配置

1. **添加 Line SDK 依赖**（已自动包含）
2. **配置 AndroidManifest.xml**（已自动配置）
3. **在 Line Developers Console 中配置**:
   - 添加 Android 应用
   - 设置包名和签名证书指纹
   - 启用 Line Login

### iOS 配置

1. **添加 Line SDK 依赖**（已自动包含）
2. **配置 URL Scheme**:
   ```xml
   <!-- ios/App/App/Info.plist -->
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key>
       <string>line3rdp.YOUR_BUNDLE_ID</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>line3rdp.YOUR_BUNDLE_ID</string>
       </array>
     </dict>
   </array>
   ```
3. **在 Line Developers Console 中配置**:
   - 添加 iOS 应用
   - 设置 Bundle ID
   - 配置 URL Scheme

详细配置指南请参考：
- [iOS URL Scheme 配置](docs/ios-url-scheme-configuration.md)
- [iOS Universal Links 配置](docs/ios-universal-links-configuration.md)

### Web 配置

1. **配置重定向 URI**:
   ```typescript
   await LineLogin.initialize({
     channelId: 'YOUR_LINE_CHANNEL_ID',
     redirectUri: 'https://your-domain.com/line-callback'
   });
   ```

2. **在 Line Developers Console 中配置**:
   - 添加 Web 应用
   - 设置 Callback URL

## 📚 API 文档

<docgen-index>

* [`initialize(...)`](#initialize)
* [`login(...)`](#login)
* [`getUserProfile()`](#getuserprofile)
* [`isLoggedIn()`](#isloggedin)
* [`logout()`](#logout)
* [`refreshToken()`](#refreshtoken)
* [`echo(...)`](#echo)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: LineLoginConfig) => Promise<void>
```

初始化Line Login SDK

| Param         | Type                                                        | Description |
| ------------- | ----------------------------------------------------------- | ----------- |
| **`options`** | <code><a href="#lineloginconfig">LineLoginConfig</a></code> | 配置选项        |

--------------------


### login(...)

```typescript
login(options?: LoginOptions | undefined) => Promise<LoginResult>
```

执行Line登录

| Param         | Type                                                  | Description |
| ------------- | ----------------------------------------------------- | ----------- |
| **`options`** | <code><a href="#loginoptions">LoginOptions</a></code> | 登录选项        |

**Returns:** <code>Promise&lt;<a href="#loginresult">LoginResult</a>&gt;</code>

--------------------


### getUserProfile()

```typescript
getUserProfile() => Promise<UserProfile>
```

获取用户信息

**Returns:** <code>Promise&lt;<a href="#userprofile">UserProfile</a>&gt;</code>

--------------------


### isLoggedIn()

```typescript
isLoggedIn() => Promise<{ isLoggedIn: boolean; }>
```

检查登录状态

**Returns:** <code>Promise&lt;{ isLoggedIn: boolean; }&gt;</code>

--------------------


### logout()

```typescript
logout() => Promise<void>
```

登出

--------------------


### refreshToken()

```typescript
refreshToken() => Promise<TokenResult>
```

刷新访问令牌

**Returns:** <code>Promise&lt;<a href="#tokenresult">TokenResult</a>&gt;</code>

--------------------


### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

Echo方法（测试用）

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### Interfaces


#### LineLoginConfig

Line Login 配置接口

| Prop                   | Type                  | Description              |
| ---------------------- | --------------------- | ------------------------ |
| **`channelId`**        | <code>string</code>   | Line Channel ID          |
| **`universalLinkURL`** | <code>string</code>   | Universal Link URL (iOS) |
| **`redirectUri`**      | <code>string</code>   | 重定向 URI (Web)            |
| **`scope`**            | <code>string[]</code> | 权限范围                     |
| **`botPrompt`**        | <code>string</code>   | Bot 提示信息                 |
| **`debug`**            | <code>boolean</code>  | 调试模式                     |


#### LoginResult

登录结果接口

| Prop               | Type                                                | Description |
| ------------------ | --------------------------------------------------- | ----------- |
| **`accessToken`**  | <code>string</code>                                 | 访问令牌        |
| **`expiresIn`**    | <code>number</code>                                 | 令牌过期时间（秒）   |
| **`refreshToken`** | <code>string</code>                                 | 刷新令牌        |
| **`scope`**        | <code>string</code>                                 | 权限范围        |
| **`tokenType`**    | <code>string</code>                                 | 令牌类型        |
| **`userProfile`**  | <code><a href="#userprofile">UserProfile</a></code> | 用户个人资料      |


#### UserProfile

用户个人资料接口

| Prop                | Type                | Description |
| ------------------- | ------------------- | ----------- |
| **`userId`**        | <code>string</code> | 用户ID        |
| **`displayName`**   | <code>string</code> | 显示名称        |
| **`pictureUrl`**    | <code>string</code> | 头像URL       |
| **`statusMessage`** | <code>string</code> | 状态消息        |
| **`language`**      | <code>string</code> | 语言          |


#### LoginOptions

登录选项接口

| Prop               | Type                                  | Description |
| ------------------ | ------------------------------------- | ----------- |
| **`onlyWebLogin`** | <code>boolean</code>                  | 仅使用Web登录    |
| **`botPrompt`**    | <code>'normal' \| 'aggressive'</code> | Bot提示模式     |
| **`scopes`**       | <code>string[]</code>                 | 权限范围        |


#### TokenResult

令牌结果接口

| Prop               | Type                | Description |
| ------------------ | ------------------- | ----------- |
| **`accessToken`**  | <code>string</code> | 访问令牌        |
| **`expiresIn`**    | <code>number</code> | 令牌过期时间（秒）   |
| **`refreshToken`** | <code>string</code> | 刷新令牌        |
| **`tokenType`**    | <code>string</code> | 令牌类型        |

</docgen-api>

### Helper Functions

插件还提供了一些辅助函数：

```typescript
import { LineLoginHelpers } from 'capacitor-line-login';

// 检查当前平台
const platform = LineLoginHelpers.getCurrentPlatform(); // 'web' | 'ios' | 'android'

// 检查平台支持
const isSupported = LineLoginHelpers.isPlatformSupported(); // boolean

// 检查是否为Web平台
const isWeb = LineLoginHelpers.isWebPlatform(); // boolean

// 检查是否为原生平台
const isNative = LineLoginHelpers.isNativePlatform(); // boolean
```

## 🛠️ 开发指南

### 运行示例应用

```bash
cd example-app
npm install
npm run dev
```

### 构建插件

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## 🔍 故障排除

### 常见问题

1. **Android 登录失败**
   - 检查 Line Developers Console 中的包名和签名证书指纹
   - 确保已启用 Line Login

2. **iOS 登录失败**
   - 检查 URL Scheme 配置
   - 确保 Bundle ID 与 Line Developers Console 中的配置一致

3. **Web 登录失败**
   - 检查 Callback URL 配置
   - 确保使用 HTTPS（生产环境）

### 调试模式

启用调试模式以获取更多日志信息：

```typescript
await LineLogin.initialize({
  channelId: 'YOUR_LINE_CHANNEL_ID',
  debug: true
});
```

## 📄 许可证

MIT License. 详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Pull Request 和 Issue！

## 🔗 相关链接

- [Line Developers Console](https://developers.line.biz/console/)
- [Line Login 文档](https://developers.line.biz/en/docs/line-login/)
- [Capacitor 文档](https://capacitorjs.com/docs)

## 📊 支持的平台

| 平台 | 支持状态 | SDK 版本 |
|------|----------|----------|
| Android | ✅ | Line SDK 5.11.1+ |
| iOS | ✅ | Line SDK 5.8.0+ |
| Web | ✅ | Line Login Web API v2.1 |
