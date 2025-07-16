# Capacitor Line Login Plugin - 使用和配置指南

## 目录

1. [安装](#安装)
2. [基础配置](#基础配置)
3. [平台特定配置](#平台特定配置)
4. [使用示例](#使用示例)
5. [API参考](#api参考)
6. [错误处理](#错误处理)
7. [故障排除](#故障排除)
8. [最佳实践](#最佳实践)
9. [常见问题](#常见问题)

## 安装

### 1. 安装插件

```bash
npm install capacitor-line-login
npx cap sync
```

### 2. 依赖要求

- **Capacitor**: 6.0+
- **iOS**: 13.0+
- **Android**: API Level 22+
- **Web**: 现代浏览器，支持ES2015+

## 基础配置

### Line Developer Console 设置

1. 登录 [Line Developer Console](https://developers.line.biz/console/)
2. 创建新的Provider或使用现有的
3. 创建Line Login Channel
4. 获取Channel ID和Channel Secret
5. 配置回调URL和域名

### 获取Channel ID

```typescript
// 从Line Developer Console获取
const CHANNEL_ID = '1234567890';
```

## 平台特定配置

### Android 配置

#### 1. 更新 `android/app/build.gradle`

```gradle
android {
    defaultConfig {
        minSdkVersion 24
    }
}

dependencies {
    implementation 'com.linecorp:linesdk:5.8.1'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.browser:browser:1.5.0'
}
```

#### 2. 更新 `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application>
        <!-- Line Login Activity -->
        <activity
            android:name="com.linecorp.linesdk.auth.LineAuthenticationActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@android:style/Theme.Translucent.NoTitleBar">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <!-- 替换 YOUR_CHANNEL_ID 为实际的Channel ID -->
                <data android:scheme="line3rdp.YOUR_CHANNEL_ID" />
            </intent-filter>
        </activity>
        
        <!-- 其他activity配置 -->
    </application>
</manifest>
```

#### 3. ProGuard 配置 (如果使用)

在 `android/app/proguard-rules.pro` 中添加：

```pro
-keep class com.linecorp.linesdk.** { *; }
-dontwarn com.linecorp.linesdk.**
```

### iOS 配置

#### 1. 更新 `ios/App/App/Info.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- 现有配置 -->
    
    <!-- Line Login URL Schemes -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>line3rdp.YOUR_CHANNEL_ID</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>line3rdp.YOUR_CHANNEL_ID</string>
            </array>
        </dict>
    </array>
    
    <!-- Line App查询权限 -->
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>lineauth2</string>
    </array>
    
    <!-- 其他配置 -->
</dict>
</plist>
```

#### 2. 更新 `Package.swift` (如果使用SPM)

```swift
// Package.swift
import PackageDescription

let package = Package(
    name: "YourAppName",
    platforms: [
        .iOS(.v13)
    ],
    dependencies: [
        .package(url: "https://github.com/line/line-sdk-ios-swift.git", from: "5.8.0")
    ],
    targets: [
        .target(
            name: "YourAppName",
            dependencies: [
                .product(name: "LineSDK", package: "line-sdk-ios-swift")
            ]
        )
    ]
)
```

#### 3. CocoaPods 配置 (替代方案)

在 `ios/Podfile` 中添加：

```ruby
platform :ios, '13.0'

target 'App' do
  use_frameworks!
  
  # Line SDK
  pod 'LineSDKSwift', '~> 5.8.0'
  
  # 其他依赖
end
```

### Web 配置

#### 1. 域名注册

在Line Developer Console中注册您的域名：

- 开发环境: `http://localhost:3000`
- 生产环境: `https://yourdomain.com`

#### 2. 回调URL配置

设置回调URL：

- 开发: `http://localhost:3000/line-login-callback`
- 生产: `https://yourdomain.com/line-login-callback`

#### 3. HTTPS要求

- 生产环境必须使用HTTPS
- 开发环境可以使用localhost

## 使用示例

### 基础使用

```typescript
import { LineLogin } from 'capacitor-line-login';

class AuthService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      await LineLogin.initialize({
        channelId: 'YOUR_CHANNEL_ID'
      });
      this.initialized = true;
      console.log('Line Login initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Line Login:', error);
      throw error;
    }
  }

  async login() {
    await this.initialize();
    
    try {
      const result = await LineLogin.login({
        scopes: ['profile', 'openid'],
        botPrompt: 'normal'
      });
      
      console.log('Login successful:', result);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async getProfile() {
    try {
      const profile = await LineLogin.getProfile();
      console.log('User profile:', profile);
      return profile;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await LineLogin.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}

// 使用示例
const authService = new AuthService();

// 登录
authService.login().then(result => {
  console.log('User logged in:', result.profile.displayName);
}).catch(error => {
  console.error('Login error:', error);
});
```

### React 组件示例

```tsx
import React, { useState, useEffect } from 'react';
import { LineLogin } from 'capacitor-line-login';

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

const LineLoginComponent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeLineLogin();
  }, []);

  const initializeLineLogin = async () => {
    try {
      await LineLogin.initialize({
        channelId: 'YOUR_CHANNEL_ID'
      });
      
      // 检查是否已登录
      const token = await LineLogin.getCurrentAccessToken();
      if (token) {
        const userProfile = await LineLogin.getProfile();
        setProfile(userProfile);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await LineLogin.login({
        scopes: ['profile', 'openid']
      });
      
      setProfile(result.profile);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      alert('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await LineLogin.logout();
      setProfile(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="line-login-container">
      {!isLoggedIn ? (
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="line-login-button"
        >
          {loading ? '登录中...' : '使用Line登录'}
        </button>
      ) : (
        <div className="user-info">
          <img 
            src={profile?.pictureUrl} 
            alt="Profile" 
            className="profile-image"
          />
          <h3>欢迎, {profile?.displayName}</h3>
          <p>{profile?.statusMessage}</p>
          <button onClick={handleLogout} className="logout-button">
            登出
          </button>
        </div>
      )}
    </div>
  );
};

export default LineLoginComponent;
```

### Vue 组件示例

```vue
<template>
  <div class="line-login-container">
    <div v-if="!isLoggedIn">
      <button @click="handleLogin" :disabled="loading" class="line-login-button">
        {{ loading ? '登录中...' : '使用Line登录' }}
      </button>
    </div>
    <div v-else class="user-info">
      <img :src="profile?.pictureUrl" alt="Profile" class="profile-image" />
      <h3>欢迎, {{ profile?.displayName }}</h3>
      <p>{{ profile?.statusMessage }}</p>
      <button @click="handleLogout" class="logout-button">登出</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { LineLogin } from 'capacitor-line-login';

export default defineComponent({
  name: 'LineLoginComponent',
  setup() {
    const isLoggedIn = ref(false);
    const profile = ref(null);
    const loading = ref(false);

    const initializeLineLogin = async () => {
      try {
        await LineLogin.initialize({
          channelId: 'YOUR_CHANNEL_ID'
        });
        
        const token = await LineLogin.getCurrentAccessToken();
        if (token) {
          const userProfile = await LineLogin.getProfile();
          profile.value = userProfile;
          isLoggedIn.value = true;
        }
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    const handleLogin = async () => {
      loading.value = true;
      try {
        const result = await LineLogin.login({
          scopes: ['profile', 'openid']
        });
        
        profile.value = result.profile;
        isLoggedIn.value = true;
      } catch (error) {
        console.error('Login failed:', error);
        alert('登录失败，请重试');
      } finally {
        loading.value = false;
      }
    };

    const handleLogout = async () => {
      try {
        await LineLogin.logout();
        profile.value = null;
        isLoggedIn.value = false;
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    onMounted(() => {
      initializeLineLogin();
    });

    return {
      isLoggedIn,
      profile,
      loading,
      handleLogin,
      handleLogout
    };
  }
});
</script>

<style scoped>
.line-login-container {
  padding: 20px;
  text-align: center;
}

.line-login-button {
  background-color: #00C300;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.line-login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-info {
  max-width: 300px;
  margin: 0 auto;
}

.profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.logout-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## API参考

### 方法

#### `initialize(options: LineLoginConfig): Promise<void>`

初始化Line Login SDK。

**参数:**
- `options.channelId`: Line Login Channel ID (必需)
- `options.universalLinkURL`: iOS Universal Link URL (可选)
- `options.customScheme`: Android自定义URL scheme (可选)

**示例:**
```typescript
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  universalLinkURL: 'https://yourapp.com/auth', // iOS
  customScheme: 'yourapp' // Android
});
```

#### `login(options?: LoginOptions): Promise<LoginResult>`

执行Line登录。

**参数:**
- `options.scopes`: 请求的权限范围 (默认: ['profile'])
- `options.botPrompt`: Bot提示模式 ('normal' | 'aggressive')
- `options.webLoginPageURL`: Web登录页面URL (Web平台)

**返回值:**
```typescript
interface LoginResult {
  accessToken: AccessToken;
  profile: UserProfile;
  scopes: string[];
  botPrompt: string;
}
```

**示例:**
```typescript
const result = await LineLogin.login({
  scopes: ['profile', 'openid', 'email'],
  botPrompt: 'normal'
});
```

#### `getProfile(): Promise<UserProfile>`

获取用户资料信息。

**返回值:**
```typescript
interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}
```

#### `logout(): Promise<void>`

登出当前用户。

#### `verifyToken(): Promise<TokenVerification>`

验证当前访问令牌。

**返回值:**
```typescript
interface TokenVerification {
  isValid: boolean;
  expiresIn?: number;
  scopes?: string[];
}
```

#### `refreshToken(): Promise<AccessToken>`

刷新访问令牌 (仅iOS/Android)。

#### `getCurrentAccessToken(): Promise<AccessToken | null>`

获取当前访问令牌。

**返回值:**
```typescript
interface AccessToken {
  value: string;
  expiresIn: number;
  tokenType: string;
}
```

## 错误处理

### 错误类型

```typescript
enum LineLoginError {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  LOGIN_CANCELLED = 'LOGIN_CANCELLED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION'
}
```

### 错误处理示例

```typescript
try {
  const result = await LineLogin.login();
  console.log('Login successful:', result);
} catch (error) {
  switch (error.code) {
    case 'LOGIN_CANCELLED':
      console.log('用户取消了登录');
      break;
    case 'NETWORK_ERROR':
      console.log('网络连接错误，请检查网络');
      break;
    case 'INVALID_TOKEN':
      console.log('令牌无效，请重新登录');
      break;
    case 'PERMISSION_DENIED':
      console.log('权限被拒绝');
      break;
    default:
      console.error('登录失败:', error.message);
  }
}
```

## 故障排除

### 常见问题

#### 1. Android登录失败

**问题**: 点击登录按钮后没有反应或返回错误。

**解决方案**:
- 检查AndroidManifest.xml中的URL scheme配置
- 确保Channel ID正确
- 检查网络权限
- 验证Line应用是否已安装

```xml
<!-- 检查URL scheme格式 -->
<data android:scheme="line3rdp.YOUR_CHANNEL_ID" />
```

#### 2. iOS构建失败

**问题**: iOS项目构建时出现Line SDK相关错误。

**解决方案**:
- 确保iOS部署目标设置为13.0+
- 检查Package.swift或Podfile配置
- 清理并重新构建项目

```bash
# 清理项目
npx cap clean ios
npx cap sync ios
```

#### 3. Web登录弹窗被阻止

**问题**: Web平台登录时弹窗被浏览器阻止。

**解决方案**:
- 提醒用户允许弹窗
- 使用用户交互事件触发登录
- 检查浏览器弹窗设置

```typescript
// 确保在用户交互事件中调用
button.addEventListener('click', async () => {
  await LineLogin.login();
});
```

#### 4. 令牌过期处理

**问题**: 访问令牌过期导致API调用失败。

**解决方案**:
- 实现令牌刷新逻辑
- 检查令牌有效性
- 提供重新登录选项

```typescript
const handleApiCall = async () => {
  try {
    const profile = await LineLogin.getProfile();
    return profile;
  } catch (error) {
    if (error.code === 'INVALID_TOKEN') {
      // 令牌无效，尝试刷新或重新登录
      try {
        await LineLogin.refreshToken();
        return await LineLogin.getProfile();
      } catch (refreshError) {
        // 刷新失败，需要重新登录
        await LineLogin.logout();
        throw new Error('需要重新登录');
      }
    }
    throw error;
  }
};
```

### 调试技巧

#### 1. 启用调试模式

```typescript
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  debug: true // 启用调试日志
});
```

#### 2. 检查令牌状态

```typescript
const checkTokenStatus = async () => {
  const token = await LineLogin.getCurrentAccessToken();
  if (token) {
    const verification = await LineLogin.verifyToken();
    console.log('Token valid:', verification.isValid);
    console.log('Expires in:', verification.expiresIn);
  } else {
    console.log('No token available');
  }
};
```

#### 3. 监听平台事件

```typescript
import { Capacitor } from '@capacitor/core';

// 检查平台
if (Capacitor.isNativePlatform()) {
  console.log('Running on native platform');
} else {
  console.log('Running on web platform');
}

// 监听应用状态变化
import { App } from '@capacitor/app';

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    // 应用激活时检查令牌状态
    checkTokenStatus();
  }
});
```

## 最佳实践

### 1. 安全性

```typescript
// 不要在客户端存储敏感信息
const CHANNEL_ID = 'YOUR_CHANNEL_ID'; // 公开信息，可以
const CHANNEL_SECRET = 'SECRET'; // 绝对不要在客户端使用！

// 使用HTTPS
const API_BASE_URL = 'https://api.yourserver.com';

// 令牌验证应在服务器端进行
const verifyTokenOnServer = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/verify-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
};
```

### 2. 用户体验

```typescript
// 提供加载状态
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  setLoading(true);
  try {
    const result = await LineLogin.login();
    // 成功处理
  } catch (error) {
    // 错误处理
  } finally {
    setLoading(false);
  }
};

// 提供友好的错误信息
const getErrorMessage = (error: any) => {
  switch (error.code) {
    case 'LOGIN_CANCELLED':
      return '登录已取消';
    case 'NETWORK_ERROR':
      return '网络连接失败，请检查网络设置';
    case 'INVALID_TOKEN':
      return '登录已过期，请重新登录';
    default:
      return '登录失败，请重试';
  }
};
```

### 3. 性能优化

```typescript
// 缓存初始化状态
let isInitialized = false;

const initializeOnce = async () => {
  if (isInitialized) return;
  
  await LineLogin.initialize({
    channelId: 'YOUR_CHANNEL_ID'
  });
  isInitialized = true;
};

// 延迟初始化
const lazyInitialize = async () => {
  if (!isInitialized) {
    await initializeOnce();
  }
};

// 预加载用户信息
const preloadUserInfo = async () => {
  const token = await LineLogin.getCurrentAccessToken();
  if (token) {
    try {
      const profile = await LineLogin.getProfile();
      // 缓存用户信息
      localStorage.setItem('user-profile', JSON.stringify(profile));
    } catch (error) {
      console.log('Token might be expired');
    }
  }
};
```

## 常见问题

### Q: 支持哪些Line Login权限范围？

A: 支持的权限范围包括：
- `profile`: 基本资料信息
- `openid`: OpenID Connect
- `email`: 邮箱地址 (需要用户同意)

### Q: 如何处理用户拒绝权限？

A: 用户拒绝权限时会抛出错误，可以通过错误处理来引导用户：

```typescript
try {
  const result = await LineLogin.login({
    scopes: ['profile', 'email']
  });
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    // 显示权限说明，引导用户重新授权
    showPermissionExplanation();
  }
}
```

### Q: 令牌的有效期是多长？

A: Line访问令牌的有效期通常为30天，但可能会根据Line的政策变化。建议：
- 定期检查令牌有效性
- 实现令牌刷新机制
- 提供重新登录选项

### Q: 如何在后端验证令牌？

A: 后端验证示例：

```javascript
// Node.js示例
const axios = require('axios');

const verifyLineToken = async (accessToken) => {
  try {
    const response = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

### Q: 如何处理多设备登录？

A: Line Login支持多设备登录，但需要注意：
- 令牌在所有设备上共享
- 在一个设备上登出会影响其他设备
- 建议实现设备管理功能

### Q: 支持企业版Line吗？

A: 目前插件主要支持消费者版Line Login。企业版Line（Line Works）需要不同的SDK和配置。

---

## 技术支持

如需技术支持，请：

1. 查看[Line Developer文档](https://developers.line.biz/en/docs/)
2. 提交[GitHub Issue](https://github.com/your-repo/issues)
3. 参与[社区讨论](https://github.com/your-repo/discussions)

## 许可证

MIT License

---

**文档版本**: 1.0.0  
**最后更新**: 2024年1月  
**兼容版本**: Capacitor 5.0+ 