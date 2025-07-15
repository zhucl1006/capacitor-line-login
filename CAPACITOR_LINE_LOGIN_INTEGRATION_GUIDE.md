# Capacitor Line Login Plugin - 完整集成指南

## 📋 目录

1. [项目概述](#项目概述)
2. [开发任务规划](#开发任务规划)
3. [技术要求](#技术要求)
4. [安装和配置](#安装和配置)
5. [平台特定配置](#平台特定配置)
6. [API 参考](#api-参考)
7. [使用示例](#使用示例)
8. [测试策略](#测试策略)
9. [故障排除](#故障排除)
10. [开发进度跟踪](#开发进度跟踪)

## 🎯 项目概述

本项目是一个支持Android、iOS和Web平台的Line Login Capacitor插件，基于TaskMaster AI进行项目管理和任务规划。

### 核心功能
- ✅ 用户登录/登出
- ✅ 获取用户信息
- ✅ 令牌管理和刷新
- ✅ 登录状态检查
- ✅ 跨平台支持（Android/iOS/Web）

## 📊 开发任务规划

### TaskMaster AI 生成的任务列表

基于复杂度分析，我们有以下15个主要任务：

| 任务ID | 任务名称 | 复杂度 | 优先级 | 状态 | 子任务数 |
|--------|----------|--------|---------|------|----------|
| 1 | 设置项目仓库 | 3 | medium | pending | 2 |
| 2 | 定义 TypeScript 接口 | 4 | medium | pending | 3 |
| 3 | 初始化 Capacitor 插件 | 4 | medium | pending | 2 |
| 4 | 实现插件初始化功能 | 6 | high | pending | 3 |
| 5 | 实现用户登录功能 | 8 | high | pending | 4 |
| 6 | 实现获取用户信息功能 | 5 | medium | pending | 3 |
| 7 | 实现登录状态管理功能 | 5 | medium | pending | 3 |
| 8 | 实现用户登出功能 | 5 | medium | pending | 3 |
| 9 | 实现令牌管理功能 | 6 | medium | pending | 3 |
| 10 | 集成 Android SDK | 7 | high | pending | 3 |
| 11 | 集成 iOS SDK | 7 | high | pending | 3 |
| 12 | 实现 Web 登录功能 | 6 | medium | pending | 3 |
| 13 | 编写文档 | 5 | medium | pending | 3 |
| 14 | 实现自动化测试流程 | 6 | medium | pending | 3 |
| 15 | 发布准备 | 5 | high | pending | 3 |

### 复杂度分析结果
- **高复杂度任务 (≥7)**: 3个 (任务5, 10, 11)
- **中复杂度任务 (5-6)**: 8个
- **低复杂度任务 (≤4)**: 4个

## 🛠 技术要求

### Line SDK 版本
- **Android**: Line SDK for Android 5.8.1+
- **iOS**: Line SDK for iOS 5.8.0+
- **Web**: Line Login Web API v2.1+

### 开发环境
- **Capacitor**: 5.0+
- **Node.js**: 16.0+
- **TypeScript**: 4.0+
- **iOS**: iOS 13.0+, Xcode 14.0+
- **Android**: API Level 24+, Java 8+

## 📦 安装和配置

### 1. 基础安装

```bash
# 安装插件
npm install capacitor-line-login

# 同步到原生项目
npx cap sync
```

### 2. Line Developer Console 配置

1. 访问 [Line Developer Console](https://developers.line.biz/console/)
2. 创建新的Provider或使用现有的
3. 创建Line Login Channel
4. 获取以下信息：
   - **Channel ID**: 用于初始化SDK
   - **Channel Secret**: 用于服务器端验证
   - **Callback URL**: 配置回调地址

## 🔧 平台特定配置

### Android 配置

#### 1. 添加依赖 (根据任务10.1)
```gradle
// android/build.gradle
dependencies {
    implementation 'com.linecorp.linesdk:linesdk:5.8.1'
}
```

#### 2. 配置 AndroidManifest.xml (根据任务10.3)
```xml
<!-- android/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <!-- Line SDK Activity -->
        <activity
            android:name="com.linecorp.linesdk.auth.LineAuthenticationActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.AppCompat.Light.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="line3rdp.{your_channel_id}" />
            </intent-filter>
        </activity>
        
        <!-- Channel ID -->
        <meta-data
            android:name="com.linecorp.linesdk.ChannelId"
            android:value="@string/line_channel_id" />
    </application>
</manifest>
```

#### 3. 配置字符串资源
```xml
<!-- android/src/main/res/values/strings.xml -->
<resources>
    <string name="line_channel_id">YOUR_CHANNEL_ID</string>
</resources>
```

### iOS 配置

#### 1. 添加依赖 (根据任务11.1)
```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/line/line-sdk-ios-swift.git", from: "5.8.0")
]
```

或使用 CocoaPods：
```ruby
# Podfile
pod 'LineSDKSwift', '~> 5.8.0'
```

#### 2. 配置 URL Scheme (根据任务11.2)
```xml
<!-- ios/App/App/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>line3rdp.{your_channel_id}</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>line3rdp.{your_channel_id}</string>
        </array>
    </dict>
</array>
```

#### 3. 配置 Universal Links (根据任务11.3)
```xml
<!-- ios/App/App/Info.plist -->
<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:access.line.me</string>
</array>
```

### Web 配置

#### 1. 配置域名白名单
在Line Developer Console中配置允许的域名：
- `http://localhost:8100` (开发环境)
- `https://yourdomain.com` (生产环境)

#### 2. 配置回调URL
```javascript
// 开发环境
http://localhost:8100/callback

// 生产环境
https://yourdomain.com/callback
```

## 🔌 API 参考

### TypeScript 接口定义 (根据任务2)

```typescript
// src/definitions.ts
export interface LineLoginPlugin {
  /**
   * 初始化Line Login SDK
   */
  initialize(options: LineLoginConfig): Promise<void>;
  
  /**
   * 执行Line登录
   */
  login(options?: LoginOptions): Promise<LoginResult>;
  
  /**
   * 获取用户信息
   */
  getUserProfile(): Promise<UserProfile>;
  
  /**
   * 检查登录状态
   */
  isLoggedIn(): Promise<{ isLoggedIn: boolean }>;
  
  /**
   * 登出
   */
  logout(): Promise<void>;
  
  /**
   * 刷新访问令牌
   */
  refreshToken(): Promise<TokenResult>;
}

export interface LineLoginConfig {
  channelId: string;
  universalLinkURL?: string;
}

export interface LoginOptions {
  onlyWebLogin?: boolean;
  botPrompt?: 'normal' | 'aggressive';
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  scope: string;
  tokenType: string;
  userProfile: UserProfile;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface TokenResult {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}
```

## 💻 使用示例

### 基础使用

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
  
  // 获取用户信息
  const profile = await LineLogin.getUserProfile();
  console.log('用户信息:', profile);
  
} catch (error) {
  console.error('登录失败:', error);
}

// 检查登录状态
const { isLoggedIn } = await LineLogin.isLoggedIn();
if (isLoggedIn) {
  console.log('用户已登录');
}

// 登出
await LineLogin.logout();
```

### React 组件示例

```tsx
import React, { useState, useEffect } from 'react';
import { LineLogin } from 'capacitor-line-login';

const LineLoginComponent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    initializeLineLogin();
  }, []);

  const initializeLineLogin = async () => {
    await LineLogin.initialize({
      channelId: 'YOUR_CHANNEL_ID'
    });
    
    const { isLoggedIn } = await LineLogin.isLoggedIn();
    setIsLoggedIn(isLoggedIn);
    
    if (isLoggedIn) {
      const profile = await LineLogin.getUserProfile();
      setUser(profile);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await LineLogin.login();
      setUser(result.userProfile);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  const handleLogout = async () => {
    await LineLogin.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <h3>欢迎, {user?.displayName}!</h3>
          <img src={user?.pictureUrl} alt="头像" />
          <button onClick={handleLogout}>登出</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Line 登录</button>
      )}
    </div>
  );
};

export default LineLoginComponent;
```

## 🧪 测试策略

### 单元测试
```typescript
// tests/line-login.test.ts
import { LineLogin } from '../src';

describe('LineLogin', () => {
  beforeEach(async () => {
    await LineLogin.initialize({
      channelId: 'test_channel_id'
    });
  });

  it('should initialize successfully', async () => {
    const result = await LineLogin.initialize({
      channelId: 'test_channel_id'
    });
    expect(result).toBeUndefined();
  });

  it('should login successfully', async () => {
    const result = await LineLogin.login();
    expect(result.accessToken).toBeDefined();
    expect(result.userProfile).toBeDefined();
  });
});
```

### 集成测试
```typescript
// e2e/line-login.e2e.ts
import { browser, by, element } from 'protractor';

describe('Line Login E2E', () => {
  it('should complete login flow', async () => {
    await browser.get('/');
    
    const loginButton = element(by.id('line-login-button'));
    await loginButton.click();
    
    // 等待登录完成
    await browser.wait(() => {
      return element(by.id('user-profile')).isPresent();
    }, 10000);
    
    const userProfile = element(by.id('user-profile'));
    expect(await userProfile.isDisplayed()).toBe(true);
  });
});
```

## 🔍 故障排除

### 常见问题

#### 1. Android 登录失败
```
Error: LINE_SDK_ERROR: AUTHENTICATION_AGENT_ERROR
```
**解决方案**:
- 检查 Channel ID 是否正确
- 确认 AndroidManifest.xml 配置正确
- 验证 Line 应用是否已安装

#### 2. iOS URL Scheme 问题
```
Error: Invalid URL scheme
```
**解决方案**:
- 检查 Info.plist 中的 URL Scheme 配置
- 确认 Universal Links 配置正确
- 验证 AppDelegate 中的回调处理

#### 3. Web 跨域问题
```
Error: CORS policy blocks request
```
**解决方案**:
- 在 Line Developer Console 中配置正确的域名
- 使用 HTTPS 协议（生产环境）
- 检查回调 URL 配置

### 调试技巧

#### 1. 启用调试日志
```typescript
// 在初始化时启用调试模式
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  debug: true
});
```

#### 2. 检查网络请求
```typescript
// 监听网络请求
window.addEventListener('fetch', (event) => {
  if (event.request.url.includes('line.me')) {
    console.log('Line API 请求:', event.request);
  }
});
```

## 📈 开发进度跟踪

### 使用 TaskMaster AI 跟踪进度

```bash
# 查看当前任务状态
task-master list

# 查看下一个要执行的任务
task-master next

# 查看特定任务详情
task-master show 5

# 更新任务状态
task-master set-status --id=1 --status=done

# 添加子任务进度
task-master update-subtask --id=5.1 --prompt="完成原生登录逻辑实现"
```

### 项目里程碑

- **里程碑 1**: 完成基础架构搭建 (任务1-3)
- **里程碑 2**: 实现核心登录功能 (任务4-5)
- **里程碑 3**: 完成平台集成 (任务10-12)
- **里程碑 4**: 测试和文档 (任务13-14)
- **里程碑 5**: 发布准备 (任务15)

## 📚 参考资源

### 官方文档
- [Line Developer Documentation](https://developers.line.biz/en/docs/)
- [Line SDK for Android](https://developers.line.biz/en/docs/android-sdk/)
- [Line SDK for iOS](https://developers.line.biz/en/docs/ios-sdk/)
- [Line Login Web API](https://developers.line.biz/en/docs/line-login/)

### 社区资源
- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**注意**: 本文档基于 TaskMaster AI 的任务规划生成，实际开发过程中请根据具体情况调整。 