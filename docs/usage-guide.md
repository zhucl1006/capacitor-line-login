# 📖 Capacitor Line Login 使用指南

本指南将详细介绍如何在您的 Capacitor 应用中集成和使用 Line Login 插件。

## 🎯 目录

1. [前置要求](#前置要求)
2. [安装配置](#安装配置)
3. [基础使用](#基础使用)
4. [高级功能](#高级功能)
5. [平台特定配置](#平台特定配置)
6. [最佳实践](#最佳实践)
7. [故障排除](#故障排除)

## 前置要求

### Line Developers Console 设置

1. **创建 Line 开发者账户**
   - 访问 [Line Developers Console](https://developers.line.biz/console/)
   - 使用 Line 账户登录

2. **创建 Provider**
   - 点击 "Create a new provider"
   - 输入 Provider 名称

3. **创建 Channel**
   - 选择 "LINE Login"
   - 填写必要信息：
     - Channel name
     - Channel description
     - App types (选择您需要的平台)

4. **获取 Channel ID**
   - 在 Channel 设置页面找到 "Channel ID"
   - 这个 ID 将用于插件初始化

## 安装配置

### 1. 安装插件

```bash
npm install aile-capacitor-line-login
npx cap sync
```

### 2. 导入插件

```typescript
import { LineLogin, LineLoginHelpers } from 'aile-capacitor-line-login';
```

## 基础使用

### 1. 初始化插件

插件必须在使用前进行初始化：

```typescript
async function initializeLineLogin() {
  try {
    await LineLogin.initialize({
      channelId: 'YOUR_LINE_CHANNEL_ID',
      scope: ['profile']
    });
    console.log('Line Login 初始化成功');
  } catch (error) {
    console.error('初始化失败:', error);
  }
}
```

### 2. 执行登录

```typescript
async function loginWithLine() {
  try {
    const result = await LineLogin.login();
    
    // 登录成功，处理结果
    console.log('登录成功!');
    console.log('访问令牌:', result.accessToken);
    console.log('用户信息:', result.userProfile);
    
    // 保存用户信息到本地存储或状态管理
    localStorage.setItem('lineAccessToken', result.accessToken);
    localStorage.setItem('lineUser', JSON.stringify(result.userProfile));
    
  } catch (error) {
    console.error('登录失败:', error);
    // 处理登录失败的情况
    alert('登录失败，请重试');
  }
}
```

### 3. 检查登录状态

```typescript
async function checkLoginStatus() {
  try {
    const { isLoggedIn } = await LineLogin.isLoggedIn();
    
    if (isLoggedIn) {
      console.log('用户已登录');
      // 用户已登录，可以执行需要登录的操作
      await loadUserData();
    } else {
      console.log('用户未登录');
      // 显示登录按钮或重定向到登录页面
      showLoginButton();
    }
  } catch (error) {
    console.error('检查登录状态失败:', error);
  }
}
```

### 4. 获取用户信息

```typescript
async function getUserInfo() {
  try {
    const profile = await LineLogin.getUserProfile();
    
    console.log('用户信息:', {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
      language: profile.language
    });
    
    // 更新UI显示用户信息
    updateUserInterface(profile);
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
}
```

### 5. 登出

```typescript
async function logout() {
  try {
    await LineLogin.logout();
    console.log('登出成功');
    
    // 清除本地存储的用户信息
    localStorage.removeItem('lineAccessToken');
    localStorage.removeItem('lineUser');
    
    // 重定向到登录页面或更新UI
    redirectToLogin();
    
  } catch (error) {
    console.error('登出失败:', error);
  }
}
```

## 高级功能

### 1. 平台检测

```typescript
import { LineLoginHelpers } from 'aile-capacitor-line-login';

// 检查当前平台
const platform = LineLoginHelpers.getCurrentPlatform();
console.log('当前平台:', platform); // 'web', 'ios', 'android'

// 根据平台执行不同的逻辑
if (LineLoginHelpers.isWebPlatform()) {
  // Web 平台特定逻辑
  console.log('在 Web 平台上运行');
} else if (LineLoginHelpers.isNativePlatform()) {
  // 原生平台特定逻辑
  console.log('在原生平台上运行');
}
```

### 2. 配置选项

```typescript
// 完整配置示例
await LineLogin.initialize({
  channelId: 'YOUR_LINE_CHANNEL_ID',
  
  // Web 平台配置
  redirectUri: 'https://your-domain.com/line-callback',
  
  // 权限范围
  scope: ['profile', 'openid'],
  
  // Bot 提示模式
  botPrompt: 'normal', // 'normal' | 'aggressive'
  
  // iOS Universal Links (可选)
  universalLinkURL: 'https://your-domain.com/line-callback',
  
  // 调试模式
  debug: true
});
```

### 3. 错误处理

```typescript
async function handleLineLogin() {
  try {
    await LineLogin.initialize({
      channelId: 'YOUR_LINE_CHANNEL_ID'
    });
    
    const result = await LineLogin.login();
    return result;
    
  } catch (error) {
    // 详细的错误处理
    if (error.message.includes('Channel ID')) {
      console.error('Channel ID 配置错误');
      alert('应用配置错误，请联系开发者');
    } else if (error.message.includes('cancelled')) {
      console.log('用户取消登录');
    } else if (error.message.includes('network')) {
      console.error('网络错误');
      alert('网络连接失败，请检查网络后重试');
    } else {
      console.error('登录失败:', error);
      alert('登录失败，请重试');
    }
  }
}
```

## 平台特定配置

### Android 配置

1. **验证 AndroidManifest.xml**
   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <uses-permission android:name="android.permission.INTERNET" />
   ```

2. **Line Developers Console 配置**
   - 添加 Android 应用
   - 设置包名：与您的应用包名一致
   - 设置签名证书指纹

### iOS 配置

1. **配置 Info.plist**
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

2. **Line Developers Console 配置**
   - 添加 iOS 应用
   - 设置 Bundle ID
   - 配置 URL Scheme

### Web 配置

1. **设置重定向 URI**
   ```typescript
   await LineLogin.initialize({
     channelId: 'YOUR_LINE_CHANNEL_ID',
     redirectUri: window.location.origin + '/line-callback'
   });
   ```

2. **创建回调页面**
   ```html
   <!-- public/line-callback.html -->
   <!DOCTYPE html>
   <html>
   <head>
     <title>Line Login Callback</title>
   </head>
   <body>
     <script>
       // 处理登录回调
       if (window.opener) {
         window.opener.postMessage('line-login-callback', '*');
         window.close();
       } else {
         // 重定向到主页面
         window.location.href = '/';
       }
     </script>
   </body>
   </html>
   ```

## 最佳实践

### 1. 状态管理

```typescript
class LineLoginManager {
  private static instance: LineLoginManager;
  private isInitialized = false;
  private currentUser: UserProfile | null = null;

  static getInstance(): LineLoginManager {
    if (!LineLoginManager.instance) {
      LineLoginManager.instance = new LineLoginManager();
    }
    return LineLoginManager.instance;
  }

  async initialize(channelId: string) {
    if (this.isInitialized) return;
    
    await LineLogin.initialize({ channelId });
    this.isInitialized = true;
  }

  async login(): Promise<UserProfile> {
    if (!this.isInitialized) {
      throw new Error('请先初始化 Line Login');
    }

    const result = await LineLogin.login();
    this.currentUser = result.userProfile;
    return this.currentUser;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  async logout() {
    await LineLogin.logout();
    this.currentUser = null;
  }
}
```

### 2. 生命周期管理

```typescript
// 在应用启动时初始化
async function initializeApp() {
  const lineManager = LineLoginManager.getInstance();
  await lineManager.initialize('YOUR_LINE_CHANNEL_ID');
  
  // 检查是否已登录
  const { isLoggedIn } = await LineLogin.isLoggedIn();
  if (isLoggedIn) {
    const profile = await LineLogin.getUserProfile();
    // 恢复用户状态
    updateAppState(profile);
  }
}

// 在应用退出时清理
async function cleanupApp() {
  // 可选：执行登出
  await LineLogin.logout();
}
```

### 3. 网络请求集成

```typescript
// 使用访问令牌进行API调用
async function callAPIWithLineToken(endpoint: string) {
  const { isLoggedIn } = await LineLogin.isLoggedIn();
  if (!isLoggedIn) {
    throw new Error('用户未登录');
  }

  // 获取存储的访问令牌
  const accessToken = localStorage.getItem('lineAccessToken');
  
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    // 令牌过期，需要重新登录
    await LineLogin.logout();
    throw new Error('登录已过期，请重新登录');
  }

  return response.json();
}
```

## 故障排除

### 常见问题

1. **初始化失败**
   ```
   错误: Channel ID is required
   解决: 确保提供了有效的 Channel ID
   ```

2. **登录失败**
   ```
   错误: Login failed
   解决: 检查平台配置和网络连接
   ```

3. **Web 平台回调失败**
   ```
   错误: State parameter mismatch
   解决: 检查重定向 URI 配置
   ```

### 调试技巧

1. **启用调试模式**
   ```typescript
   await LineLogin.initialize({
     channelId: 'YOUR_LINE_CHANNEL_ID',
     debug: true
   });
   ```

2. **检查平台支持**
   ```typescript
   if (!LineLoginHelpers.isPlatformSupported()) {
     console.error('当前平台不支持 Line Login');
   }
   ```

3. **监控网络请求**
   - 在浏览器开发者工具中查看网络请求
   - 检查 OAuth 流程中的请求和响应

### 性能优化

1. **延迟初始化**
   ```typescript
   // 只在需要时初始化
   async function ensureInitialized() {
     if (!isInitialized) {
       await LineLogin.initialize({ channelId: 'YOUR_CHANNEL_ID' });
       isInitialized = true;
     }
   }
   ```

2. **缓存用户信息**
   ```typescript
   // 避免重复获取用户信息
   let cachedProfile: UserProfile | null = null;
   
   async function getCachedProfile(): Promise<UserProfile> {
     if (!cachedProfile) {
       cachedProfile = await LineLogin.getUserProfile();
     }
     return cachedProfile;
   }
   ```

## 📞 技术支持

如果您遇到问题，请：

1. 查看 [GitHub Issues](https://github.com/your-repo/capacitor-line-login/issues)
2. 参考 [Line Login 官方文档](https://developers.line.biz/en/docs/line-login/)
3. 提交新的 Issue 并提供详细的错误信息

---

*最后更新: 2024年* 