# 🔄 迁移指南

本指南将帮助您从其他 Line Login 解决方案迁移到 Capacitor Line Login 插件。

## 📋 目录

1. [从 Cordova 插件迁移](#从-cordova-插件迁移)
2. [从原生实现迁移](#从原生实现迁移)
3. [从 Web 实现迁移](#从-web-实现迁移)
4. [API 对比](#api-对比)
5. [配置迁移](#配置迁移)
6. [常见问题](#常见问题)

## 从 Cordova 插件迁移

### 1. 卸载旧插件

```bash
# 卸载 Cordova Line Login 插件
cordova plugin remove cordova-plugin-line-login

# 安装 Capacitor Line Login 插件
npm install capacitor-line-login
npx cap sync
```

### 2. API 迁移

#### 旧的 Cordova API
```javascript
// 初始化
window.lineLogin.initialize({
  channel_id: 'YOUR_CHANNEL_ID'
}, success, error);

// 登录
window.lineLogin.login({}, function(result) {
  console.log('登录成功:', result);
}, function(error) {
  console.error('登录失败:', error);
});

// 获取用户信息
window.lineLogin.getProfile(function(profile) {
  console.log('用户信息:', profile);
}, function(error) {
  console.error('获取失败:', error);
});

// 登出
window.lineLogin.logout(function() {
  console.log('登出成功');
}, function(error) {
  console.error('登出失败:', error);
});
```

#### 新的 Capacitor API
```typescript
import { LineLogin } from 'capacitor-line-login';

// 初始化
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID'
});

// 登录
try {
  const result = await LineLogin.login();
  console.log('登录成功:', result);
} catch (error) {
  console.error('登录失败:', error);
}

// 获取用户信息
try {
  const profile = await LineLogin.getUserProfile();
  console.log('用户信息:', profile);
} catch (error) {
  console.error('获取失败:', error);
}

// 登出
try {
  await LineLogin.logout();
  console.log('登出成功');
} catch (error) {
  console.error('登出失败:', error);
}
```

### 3. 配置迁移

#### Cordova 配置 (config.xml)
```xml
<plugin name="cordova-plugin-line-login" spec="^1.0.0">
  <variable name="LINE_CHANNEL_ID" value="YOUR_CHANNEL_ID" />
</plugin>
```

#### Capacitor 配置 (代码中)
```typescript
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  scope: ['profile']
});
```

## 从原生实现迁移

### Android 原生迁移

#### 旧的 Android 实现
```java
// 初始化
LoginManager.getInstance().setup(getApplicationContext(), "YOUR_CHANNEL_ID");

// 登录
Intent loginIntent = LoginManager.getInstance().getLoginIntent(this, null, Arrays.asList(Scope.PROFILE));
startActivityForResult(loginIntent, REQUEST_CODE);

// 处理结果
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
  if (requestCode == REQUEST_CODE) {
    LoginResult result = LoginManager.getInstance().getLoginResult(data);
    // 处理结果
  }
}
```

#### 新的 Capacitor 实现
```typescript
// 初始化
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID'
});

// 登录
const result = await LineLogin.login();
// 自动处理结果
```

### iOS 原生迁移

#### 旧的 iOS 实现
```swift
// 初始化
LoginManager.shared.setup(channelID: "YOUR_CHANNEL_ID", universalLinkURL: nil)

// 登录
LoginManager.shared.login(permissions: [.profile], in: self) { result in
  switch result {
  case .success(let loginResult):
    // 处理成功
  case .failure(let error):
    // 处理错误
  }
}
```

#### 新的 Capacitor 实现
```typescript
// 初始化
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID'
});

// 登录
try {
  const result = await LineLogin.login();
  // 处理成功
} catch (error) {
  // 处理错误
}
```

## 从 Web 实现迁移

### 旧的 Web 实现
```javascript
// 手动构建授权URL
const authUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile&state=${STATE}`;

// 重定向到授权页面
window.location.href = authUrl;

// 手动处理回调
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

// 手动交换令牌
const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  })
});
```

### 新的 Capacitor 实现
```typescript
// 初始化
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  redirectUri: 'https://your-domain.com/callback'
});

// 登录（自动处理整个流程）
const result = await LineLogin.login();
// 自动处理授权、回调、令牌交换
```

## API 对比

| 功能 | Cordova | 原生 Android | 原生 iOS | Capacitor |
|------|---------|--------------|----------|-----------|
| 初始化 | `initialize()` | `setup()` | `setup()` | `initialize()` |
| 登录 | `login()` | `getLoginIntent()` | `login()` | `login()` |
| 获取用户信息 | `getProfile()` | `getProfile()` | `getProfile()` | `getUserProfile()` |
| 登录状态 | `getAccessToken()` | `getCurrentAccessToken()` | `isLoggedIn` | `isLoggedIn()` |
| 登出 | `logout()` | `logout()` | `logout()` | `logout()` |
| 刷新令牌 | ❌ | ❌ | ❌ | `refreshToken()` |

## 配置迁移

### 1. Android 配置

#### 旧配置
```xml
<!-- AndroidManifest.xml -->
<activity
    android:name="com.linecorp.linesdk.auth.LineAuthenticationActivity"
    android:exported="false"
    android:launchMode="singleTask"
    android:theme="@style/LineSDKTheme.Authentication" />
```

#### 新配置
```xml
<!-- 已自动配置，无需手动添加 -->
<uses-permission android:name="android.permission.INTERNET" />
```

### 2. iOS 配置

#### 旧配置
```xml
<!-- Info.plist -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>line3rdp.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    </array>
  </dict>
</array>
```

#### 新配置
```xml
<!-- Info.plist -->
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

### 3. Web 配置

#### 旧配置
```javascript
// 手动配置各种参数
const config = {
  clientId: 'YOUR_CLIENT_ID',
  redirectUri: 'https://your-domain.com/callback',
  scope: 'profile openid',
  state: generateRandomState()
};
```

#### 新配置
```typescript
// 统一配置
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  redirectUri: 'https://your-domain.com/callback',
  scope: ['profile', 'openid']
});
```

## 常见问题

### 1. 回调处理

**问题**: 从 Cordova 迁移后，回调不工作了

**解决方案**:
```typescript
// Cordova 使用回调函数
window.lineLogin.login({}, success, error);

// Capacitor 使用 Promise
try {
  const result = await LineLogin.login();
  // 成功处理
} catch (error) {
  // 错误处理
}
```

### 2. 配置参数

**问题**: `channel_id` 参数不识别

**解决方案**:
```typescript
// 旧的参数名
{ channel_id: 'YOUR_ID' }

// 新的参数名
{ channelId: 'YOUR_ID' }
```

### 3. 错误处理

**问题**: 错误格式不同

**解决方案**:
```typescript
// 旧的错误处理
function errorCallback(error) {
  console.log('错误代码:', error.code);
  console.log('错误消息:', error.message);
}

// 新的错误处理
try {
  await LineLogin.login();
} catch (error) {
  console.log('错误消息:', error.message);
  // 统一的错误对象
}
```

### 4. 用户信息格式

**问题**: 用户信息字段不同

**解决方案**:
```typescript
// 旧格式
{
  userID: "U1234567890",
  displayName: "John Doe",
  pictureURL: "https://...",
  statusMessage: "Hello"
}

// 新格式
{
  userId: "U1234567890",
  displayName: "John Doe",
  pictureUrl: "https://...",
  statusMessage: "Hello",
  language: "en"
}
```

## 迁移检查清单

### 准备工作
- [ ] 备份现有代码
- [ ] 确认 Line Developers Console 配置
- [ ] 准备测试环境

### 代码迁移
- [ ] 卸载旧插件/移除原生代码
- [ ] 安装 Capacitor Line Login 插件
- [ ] 更新导入语句
- [ ] 迁移初始化代码
- [ ] 迁移登录逻辑
- [ ] 迁移用户信息获取
- [ ] 迁移登出逻辑
- [ ] 更新错误处理

### 配置迁移
- [ ] 更新 Android 配置
- [ ] 更新 iOS 配置
- [ ] 更新 Web 配置
- [ ] 验证重定向 URI

### 测试验证
- [ ] 测试初始化
- [ ] 测试登录流程
- [ ] 测试用户信息获取
- [ ] 测试登出功能
- [ ] 测试错误场景
- [ ] 跨平台测试

### 部署准备
- [ ] 更新文档
- [ ] 更新版本号
- [ ] 准备发布说明

## 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [使用指南](usage-guide.md)
2. 参考 [API 文档](../README.md#api-文档)
3. 查看 [GitHub Issues](https://github.com/your-repo/capacitor-line-login/issues)
4. 提交新的 Issue 并提供：
   - 迁移前的代码示例
   - 迁移后的代码示例
   - 遇到的具体错误
   - 平台和版本信息

---

*最后更新: 2024年* 