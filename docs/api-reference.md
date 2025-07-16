# API 参考文档

本文档详细描述了 Capacitor Line Login Plugin 的所有 API 方法和接口。

## 目录

- [插件接口](#插件接口)
- [配置接口](#配置接口)
- [数据类型](#数据类型)
- [错误处理](#错误处理)

## 插件接口

### LineLoginPlugin

主要的插件接口，包含所有可用的方法。

#### initialize(config: LineLoginConfig): Promise<void>

初始化 Line Login 插件。

**参数**:
- `config`: `LineLoginConfig` - 插件配置对象

**返回值**: `Promise<void>`

**异常**:
- `LineLoginError` - 配置无效时抛出

**示例**:
```typescript
import { LineLogin } from 'capacitor-line-login';

await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  redirectUri: 'https://yourdomain.com/callback',
  scope: ['profile', 'openid']
});
```

#### login(options?: LoginOptions): Promise<LoginResult>

启动 Line 登录流程。

**参数**:
- `options`: `LoginOptions` (可选) - 登录选项

**返回值**: `Promise<LoginResult>` - 登录结果

**异常**:
- `LineLoginError` - 登录失败时抛出

**示例**:
```typescript
try {
  const result = await LineLogin.login();
  console.log('登录成功:', result);
} catch (error) {
  console.error('登录失败:', error);
}
```

#### getUserProfile(): Promise<UserProfile>

获取当前登录用户的个人资料。

**返回值**: `Promise<UserProfile>` - 用户个人资料

**异常**:
- `LineLoginError` - 用户未登录或获取失败时抛出

**示例**:
```typescript
try {
  const profile = await LineLogin.getUserProfile();
  console.log('用户信息:', profile);
} catch (error) {
  console.error('获取用户信息失败:', error);
}
```

#### isLoggedIn(): Promise<{ isLoggedIn: boolean }>

检查用户是否已登录。

**返回值**: `Promise<{ isLoggedIn: boolean }>` - 登录状态

**示例**:
```typescript
const status = await LineLogin.isLoggedIn();
if (status.isLoggedIn) {
  console.log('用户已登录');
} else {
  console.log('用户未登录');
}
```

#### logout(): Promise<void>

登出当前用户。

**返回值**: `Promise<void>`

**异常**:
- `LineLoginError` - 登出失败时抛出

**示例**:
```typescript
try {
  await LineLogin.logout();
  console.log('登出成功');
} catch (error) {
  console.error('登出失败:', error);
}
```

#### refreshToken(): Promise<TokenResult>

刷新访问令牌。

**返回值**: `Promise<TokenResult>` - 令牌结果

**异常**:
- `LineLoginError` - 刷新失败时抛出

**注意**: 在某些平台上，此方法可能不可用或返回错误。

**示例**:
```typescript
try {
  const tokenResult = await LineLogin.refreshToken();
  console.log('令牌刷新成功:', tokenResult);
} catch (error) {
  console.error('令牌刷新失败:', error);
}
```

#### echo(options: { value: string }): Promise<{ value: string }>

测试方法，返回输入的值。

**参数**:
- `options`: `{ value: string }` - 包含要回显的值的对象

**返回值**: `Promise<{ value: string }>` - 包含相同值的对象

**示例**:
```typescript
const result = await LineLogin.echo({ value: 'Hello World' });
console.log(result.value); // 输出: "Hello World"
```

## 配置接口

### LineLoginConfig

插件初始化配置。

```typescript
interface LineLoginConfig {
  channelId: string;
  redirectUri?: string;
  scope?: string[];
  botPrompt?: string;
  debug?: boolean;
}
```

**属性**:

#### channelId: string (必需)

Line Developer Console 中的 Channel ID。

**示例**: `"1234567890"`

#### redirectUri?: string (可选)

登录完成后的重定向 URI。

**默认值**: 
- Web: `http://localhost/line-callback`
- 移动端: 由平台 SDK 处理

**示例**: `"https://yourdomain.com/callback"`

#### scope?: string[] (可选)

请求的权限范围。

**默认值**: `['profile']`

**可用值**:
- `'profile'`: 获取用户基本信息
- `'openid'`: OpenID Connect 支持
- `'email'`: 获取用户邮箱（如果可用）

**示例**: `['profile', 'openid']`

#### botPrompt?: string (可选)

Bot 提示模式。

**可用值**:
- `'normal'`: 正常提示模式
- `'aggressive'`: 积极提示模式

**示例**: `'normal'`

#### debug?: boolean (可选)

是否启用调试模式。

**默认值**: `false`

**示例**: `true`

### LoginOptions

登录选项配置。

```typescript
interface LoginOptions {
  // 当前版本暂无可配置选项
  // 预留用于未来扩展
}
```

## 数据类型

### LoginResult

登录结果数据。

```typescript
interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
  scope: string[];
  userProfile?: UserProfile;
}
```

**属性**:

#### accessToken: string

访问令牌，用于调用 Line API。

#### refreshToken?: string (可选)

刷新令牌，用于刷新访问令牌。

**注意**: 某些平台可能不提供刷新令牌。

#### idToken?: string (可选)

ID 令牌，用于 OpenID Connect。

#### expiresIn?: number (可选)

令牌过期时间（秒）。

#### scope: string[]

授权的权限范围。

#### userProfile?: UserProfile (可选)

用户个人资料（如果在登录时获取）。

### UserProfile

用户个人资料数据。

```typescript
interface UserProfile {
  userId: string;
  displayName?: string;
  pictureUrl?: string;
  statusMessage?: string;
  language?: string;
}
```

**属性**:

#### userId: string

用户的唯一标识符。

#### displayName?: string (可选)

用户的显示名称。

#### pictureUrl?: string (可选)

用户头像的 URL。

#### statusMessage?: string (可选)

用户的状态消息。

#### language?: string (可选)

用户的语言设置。

### TokenResult

令牌结果数据。

```typescript
interface TokenResult {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}
```

**属性**:

#### accessToken?: string (可选)

新的访问令牌。

#### refreshToken?: string (可选)

新的刷新令牌。

#### expiresIn?: number (可选)

令牌过期时间（秒）。

#### error?: string (可选)

错误信息（如果刷新失败）。

## 错误处理

### LineLoginError

插件抛出的错误类型。

```typescript
interface LineLoginError extends Error {
  code: string;
  message: string;
  details?: any;
}
```

**属性**:

#### code: string

错误代码。

#### message: string

错误消息。

#### details?: any (可选)

错误详细信息。

### 错误代码

#### 配置错误

- `INVALID_CHANNEL_ID`: Channel ID 无效
- `INVALID_REDIRECT_URI`: 重定向 URI 无效
- `INVALID_SCOPE`: 权限范围无效
- `PLUGIN_NOT_INITIALIZED`: 插件未初始化

#### 登录错误

- `USER_CANCELLED`: 用户取消登录
- `NETWORK_ERROR`: 网络错误
- `AUTHENTICATION_FAILED`: 认证失败
- `INVALID_STATE`: 状态参数无效

#### 令牌错误

- `TOKEN_EXPIRED`: 令牌已过期
- `TOKEN_INVALID`: 令牌无效
- `REFRESH_TOKEN_FAILED`: 刷新令牌失败

#### 用户信息错误

- `USER_NOT_LOGGED_IN`: 用户未登录
- `PROFILE_ACCESS_DENIED`: 无法访问用户信息
- `PROFILE_FETCH_FAILED`: 获取用户信息失败

#### 平台错误

- `PLATFORM_NOT_SUPPORTED`: 平台不支持
- `SDK_NOT_AVAILABLE`: SDK 不可用
- `PERMISSION_DENIED`: 权限被拒绝

### 错误处理示例

```typescript
import { LineLogin } from 'capacitor-line-login';

try {
  await LineLogin.initialize({
    channelId: 'YOUR_CHANNEL_ID'
  });
  
  const result = await LineLogin.login();
  console.log('登录成功:', result);
  
} catch (error: any) {
  console.error('错误代码:', error.code);
  console.error('错误消息:', error.message);
  
  switch (error.code) {
    case 'INVALID_CHANNEL_ID':
      alert('Channel ID 配置错误，请检查配置');
      break;
      
    case 'USER_CANCELLED':
      console.log('用户取消了登录');
      break;
      
    case 'NETWORK_ERROR':
      alert('网络连接失败，请检查网络后重试');
      break;
      
    case 'AUTHENTICATION_FAILED':
      alert('登录失败，请重试');
      break;
      
    default:
      alert('发生未知错误: ' + error.message);
  }
}
```

## 平台差异

### Web 平台

- 使用 OAuth 2.0 重定向流程
- 支持 PKCE (Proof Key for Code Exchange)
- 需要配置 Callback URL
- 不支持刷新令牌

### Android 平台

- 使用 Line SDK for Android
- 支持原生登录体验
- 需要配置 AndroidManifest.xml
- 支持应用间跳转

### iOS 平台

- 使用 Line SDK for iOS
- 支持原生登录体验
- 需要配置 Info.plist 和 URL Scheme
- 支持 Universal Links

## 最佳实践

### 1. 错误处理

```typescript
// 始终使用 try-catch 处理异步操作
try {
  const result = await LineLogin.login();
  // 处理成功结果
} catch (error) {
  // 处理错误
  handleLoginError(error);
}
```

### 2. 状态检查

```typescript
// 在获取用户信息前检查登录状态
const status = await LineLogin.isLoggedIn();
if (status.isLoggedIn) {
  const profile = await LineLogin.getUserProfile();
  // 使用用户信息
}
```

### 3. 配置验证

```typescript
// 验证配置参数
const config = {
  channelId: process.env.LINE_CHANNEL_ID,
  redirectUri: process.env.LINE_REDIRECT_URI || 'https://yourdomain.com/callback',
  scope: ['profile']
};

if (!config.channelId) {
  throw new Error('Channel ID is required');
}

await LineLogin.initialize(config);
```

### 4. 资源清理

```typescript
// 在适当的时机清理资源
window.addEventListener('beforeunload', async () => {
  try {
    await LineLogin.logout();
  } catch (error) {
    console.error('Logout failed:', error);
  }
});
```

## 版本兼容性

| 版本 | Capacitor | Android | iOS | Web |
|------|-----------|---------|-----|-----|
| 1.3.0 | 6.0+ | API 22+ | 13.0+ | 现代浏览器 |

## 相关链接

- [Line Developers Console](https://developers.line.biz/console/)
- [Line Login API 文档](https://developers.line.biz/en/docs/line-login/)
- [Capacitor 文档](https://capacitorjs.com/docs)
- [使用指南](usage-guide.md)
- [故障排除](troubleshooting.md) 