# Line Login Capacitor Plugin 开发计划

## 项目概述

本项目旨在开发一个支持Android、iOS和Web平台的Line Login Capacitor插件，基于最新的Line SDK和开发最佳实践。

## 技术栈和版本信息

### Line SDK 版本
- **iOS**: Line SDK for iOS Swift 5.8.0+
- **Android**: Line SDK for Android 5.8.1+
- **Web**: Line Login Web API v2.1+

### 开发环境要求
- **iOS**: iOS 13.0+, Xcode 14.0+, Swift 5.0+
- **Android**: Android API Level 24+, Java 8+/Kotlin 1.5+
- **Web**: Modern browsers with ES2015+ support
- **Capacitor**: 5.0+

## 开发阶段

### 阶段1: 项目基础设施搭建 (1-2天)

#### 1.1 项目结构优化
- [x] 基础Capacitor插件结构已存在
- [ ] 更新`package.json`依赖版本
- [ ] 配置TypeScript编译选项
- [ ] 设置ESLint和Prettier规则

#### 1.2 TypeScript接口定义
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
  getProfile(): Promise<UserProfile>;

  /**
   * 刷新访问令牌
   */
  refreshToken(): Promise<AccessToken>;

  /**
   * 验证访问令牌
   */
  verifyToken(): Promise<TokenVerification>;

  /**
   * 登出
   */
  logout(): Promise<void>;

  /**
   * 获取当前访问令牌
   */
  getCurrentAccessToken(): Promise<AccessToken | null>;
}

export interface LineLoginConfig {
  channelId: string;
  universalLinkURL?: string; // iOS
  customScheme?: string; // Android
}

export interface LoginOptions {
  scopes?: string[];
  botPrompt?: 'normal' | 'aggressive';
  webLoginPageURL?: string;
}

export interface LoginResult {
  accessToken: AccessToken;
  profile: UserProfile;
  scopes: string[];
  botPrompt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface AccessToken {
  value: string;
  expiresIn: number;
  tokenType: string;
}

export interface TokenVerification {
  isValid: boolean;
  expiresIn?: number;
  scopes?: string[];
}
```

### 阶段2: Android平台实现 (3-4天)

#### 2.1 Gradle配置
```gradle
// android/build.gradle
dependencies {
    implementation 'com.linecorp:linesdk:5.8.1'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.browser:browser:1.5.0'
}
```

#### 2.2 AndroidManifest.xml配置
```xml
<!-- android/src/main/AndroidManifest.xml -->
<activity
    android:name="com.linecorp.linesdk.auth.LineAuthenticationActivity"
    android:exported="true"
    android:launchMode="singleTask"
    android:theme="@android:style/Theme.Translucent.NoTitleBar">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="line3rdp.{your_channel_id}" />
    </intent-filter>
</activity>
```

#### 2.3 Java实现
```java
// android/src/main/java/com/aile/plugins/linelogin/LineLoginPlugin.java
@CapacitorPlugin(name = "LineLogin")
public class LineLoginPlugin extends Plugin {
    
    private LineLogin implementation = new LineLogin();
    
    @Override
    public void load() {
        implementation.setContext(getContext());
        implementation.setActivity(getActivity());
    }
    
    @PluginMethod
    public void initialize(PluginCall call) {
        String channelId = call.getString("channelId");
        if (channelId == null) {
            call.reject("Channel ID is required");
            return;
        }
        
        try {
            implementation.initialize(channelId);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to initialize Line Login", e);
        }
    }
    
    @PluginMethod
    public void login(PluginCall call) {
        implementation.login(call);
    }
    
    @PluginMethod
    public void getProfile(PluginCall call) {
        implementation.getProfile(call);
    }
    
    @PluginMethod
    public void refreshToken(PluginCall call) {
        implementation.refreshToken(call);
    }
    
    @PluginMethod
    public void verifyToken(PluginCall call) {
        implementation.verifyToken(call);
    }
    
    @PluginMethod
    public void logout(PluginCall call) {
        implementation.logout(call);
    }
    
    @PluginMethod
    public void getCurrentAccessToken(PluginCall call) {
        implementation.getCurrentAccessToken(call);
    }
}
```

### 阶段3: iOS平台实现 (3-4天)

#### 3.1 Package.swift配置
```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/line/line-sdk-ios-swift.git", from: "5.8.0")
],
targets: [
    .target(
        name: "LineLoginPlugin",
        dependencies: [
            .product(name: "LineSDK", package: "line-sdk-ios-swift")
        ]
    )
]
```

#### 3.2 Info.plist配置
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

<key>LSApplicationQueriesSchemes</key>
<array>
    <string>lineauth2</string>
</array>
```

#### 3.3 Swift实现
```swift
// ios/Sources/LineLoginPlugin/LineLoginPlugin.swift
import Foundation
import Capacitor
import LineSDK

@objc(LineLoginPlugin)
public class LineLoginPlugin: CAPPlugin {
    private let implementation = LineLogin()
    
    @objc func initialize(_ call: CAPPluginCall) {
        guard let channelId = call.getString("channelId") else {
            call.reject("Channel ID is required")
            return
        }
        
        implementation.initialize(channelId: channelId) { [weak self] result in
            switch result {
            case .success:
                call.resolve()
            case .failure(let error):
                call.reject("Failed to initialize Line Login", error.localizedDescription)
            }
        }
    }
    
    @objc func login(_ call: CAPPluginCall) {
        implementation.login(call: call)
    }
    
    @objc func getProfile(_ call: CAPPluginCall) {
        implementation.getProfile(call: call)
    }
    
    @objc func refreshToken(_ call: CAPPluginCall) {
        implementation.refreshToken(call: call)
    }
    
    @objc func verifyToken(_ call: CAPPluginCall) {
        implementation.verifyToken(call: call)
    }
    
    @objc func logout(_ call: CAPPluginCall) {
        implementation.logout(call: call)
    }
    
    @objc func getCurrentAccessToken(_ call: CAPPluginCall) {
        implementation.getCurrentAccessToken(call: call)
    }
}
```

### 阶段4: Web平台实现 (2-3天)

#### 4.1 Web实现
```typescript
// src/web.ts
import { WebPlugin } from '@capacitor/core';
import type { LineLoginPlugin, LineLoginConfig, LoginOptions, LoginResult, UserProfile, AccessToken, TokenVerification } from './definitions';

export class LineLoginWeb extends WebPlugin implements LineLoginPlugin {
  private channelId: string = '';
  private initialized: boolean = false;

  async initialize(options: LineLoginConfig): Promise<void> {
    this.channelId = options.channelId;
    
    // 动态加载Line Login Web SDK
    await this.loadLineSDK();
    
    this.initialized = true;
  }

  async login(options?: LoginOptions): Promise<LoginResult> {
    if (!this.initialized) {
      throw new Error('Line Login not initialized');
    }

    const scopes = options?.scopes || ['profile'];
    const botPrompt = options?.botPrompt || 'normal';
    
    return new Promise((resolve, reject) => {
      const loginURL = this.buildLoginURL(scopes, botPrompt);
      
      // 使用popup window进行登录
      const popup = window.open(loginURL, 'line-login', 'width=400,height=600');
      
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== 'https://access.line.me') return;
        
        if (event.data.type === 'line-login-success') {
          window.removeEventListener('message', messageHandler);
          popup?.close();
          resolve(event.data.result);
        } else if (event.data.type === 'line-login-error') {
          window.removeEventListener('message', messageHandler);
          popup?.close();
          reject(new Error(event.data.error));
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // 检查popup是否被关闭
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Login cancelled'));
        }
      }, 1000);
    });
  }

  async getProfile(): Promise<UserProfile> {
    const token = await this.getCurrentAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  }

  async refreshToken(): Promise<AccessToken> {
    throw new Error('Token refresh not supported in web environment');
  }

  async verifyToken(): Promise<TokenVerification> {
    const token = await this.getCurrentAccessToken();
    if (!token) {
      return { isValid: false };
    }

    try {
      const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `access_token=${token.value}`
      });

      if (response.ok) {
        const result = await response.json();
        return {
          isValid: true,
          expiresIn: result.expires_in,
          scopes: result.scope?.split(' ')
        };
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }

    return { isValid: false };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('line-access-token');
    localStorage.removeItem('line-user-profile');
  }

  async getCurrentAccessToken(): Promise<AccessToken | null> {
    const tokenData = localStorage.getItem('line-access-token');
    return tokenData ? JSON.parse(tokenData) : null;
  }

  private async loadLineSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="line.me"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Line SDK'));
      document.head.appendChild(script);
    });
  }

  private buildLoginURL(scopes: string[], botPrompt: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.channelId,
      redirect_uri: window.location.origin + '/line-login-callback',
      scope: scopes.join(' '),
      bot_prompt: botPrompt,
      state: Math.random().toString(36).substring(2, 15)
    });

    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }
}
```

### 阶段5: 示例应用和测试 (2-3天)

#### 5.1 更新示例应用
```javascript
// example-app/src/js/example.js
import { LineLogin } from 'capacitor-line-login';

class LineLoginExample {
  constructor() {
    this.lineLogin = LineLogin;
    this.initializeEventListeners();
  }

  async initializeEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupUI();
    });
  }

  setupUI() {
    const initButton = document.getElementById('init-button');
    const loginButton = document.getElementById('login-button');
    const profileButton = document.getElementById('profile-button');
    const logoutButton = document.getElementById('logout-button');
    const verifyButton = document.getElementById('verify-button');

    initButton.addEventListener('click', () => this.initialize());
    loginButton.addEventListener('click', () => this.login());
    profileButton.addEventListener('click', () => this.getProfile());
    logoutButton.addEventListener('click', () => this.logout());
    verifyButton.addEventListener('click', () => this.verifyToken());
  }

  async initialize() {
    try {
      await this.lineLogin.initialize({
        channelId: 'YOUR_CHANNEL_ID'
      });
      this.showResult('初始化成功');
    } catch (error) {
      this.showError('初始化失败', error);
    }
  }

  async login() {
    try {
      const result = await this.lineLogin.login({
        scopes: ['profile', 'openid'],
        botPrompt: 'normal'
      });
      this.showResult('登录成功', result);
    } catch (error) {
      this.showError('登录失败', error);
    }
  }

  async getProfile() {
    try {
      const profile = await this.lineLogin.getProfile();
      this.showResult('获取用户信息成功', profile);
    } catch (error) {
      this.showError('获取用户信息失败', error);
    }
  }

  async logout() {
    try {
      await this.lineLogin.logout();
      this.showResult('登出成功');
    } catch (error) {
      this.showError('登出失败', error);
    }
  }

  async verifyToken() {
    try {
      const verification = await this.lineLogin.verifyToken();
      this.showResult('令牌验证结果', verification);
    } catch (error) {
      this.showError('令牌验证失败', error);
    }
  }

  showResult(title, data = null) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
      <h3>${title}</h3>
      ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''}
    `;
    resultDiv.className = 'result success';
  }

  showError(title, error) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
      <h3>${title}</h3>
      <p>${error.message || error}</p>
    `;
    resultDiv.className = 'result error';
  }
}

// 初始化示例应用
new LineLoginExample();
```

#### 5.2 测试策略
```typescript
// tests/line-login.test.ts
import { LineLogin } from '../src/index';

describe('LineLogin', () => {
  let lineLogin: any;

  beforeEach(() => {
    lineLogin = new LineLogin();
  });

  describe('initialization', () => {
    it('should initialize with valid channel ID', async () => {
      await expect(lineLogin.initialize({ channelId: 'test-channel' }))
        .resolves.not.toThrow();
    });

    it('should throw error with invalid channel ID', async () => {
      await expect(lineLogin.initialize({ channelId: '' }))
        .rejects.toThrow('Channel ID is required');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await lineLogin.initialize({ channelId: 'test-channel' });
    });

    it('should login successfully with valid credentials', async () => {
      const result = await lineLogin.login();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('profile');
    });

    it('should handle login cancellation', async () => {
      // Mock user cancellation
      await expect(lineLogin.login()).rejects.toThrow('Login cancelled');
    });
  });

  describe('profile', () => {
    it('should get user profile after login', async () => {
      const profile = await lineLogin.getProfile();
      expect(profile).toHaveProperty('userId');
      expect(profile).toHaveProperty('displayName');
    });

    it('should throw error when not logged in', async () => {
      await expect(lineLogin.getProfile())
        .rejects.toThrow('No access token available');
    });
  });
});
```

### 阶段6: 文档和配置 (1-2天)

#### 6.1 更新README.md
```markdown
# Capacitor Line Login Plugin

A Capacitor plugin for Line Login integration supporting Android, iOS, and Web platforms.

## Installation

```bash
npm install capacitor-line-login
npx cap sync
```

## Configuration

### Android

1. Add the following to your `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
    android:name="com.linecorp.linesdk.auth.LineAuthenticationActivity"
    android:exported="true"
    android:launchMode="singleTask"
    android:theme="@android:style/Theme.Translucent.NoTitleBar">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="line3rdp.{YOUR_CHANNEL_ID}" />
    </intent-filter>
</activity>
```

### iOS

1. Add the following to your `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>line3rdp.{YOUR_CHANNEL_ID}</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>line3rdp.{YOUR_CHANNEL_ID}</string>
        </array>
    </dict>
</array>

<key>LSApplicationQueriesSchemes</key>
<array>
    <string>lineauth2</string>
</array>
```

## Usage

```typescript
import { LineLogin } from 'capacitor-line-login';

// Initialize
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID'
});

// Login
const result = await LineLogin.login({
  scopes: ['profile', 'openid']
});

// Get profile
const profile = await LineLogin.getProfile();

// Logout
await LineLogin.logout();
```

## API Reference

### Methods

#### `initialize(options: LineLoginConfig)`
Initialize the Line Login SDK.

#### `login(options?: LoginOptions)`
Perform Line login.

#### `getProfile()`
Get user profile information.

#### `logout()`
Logout the current user.

#### `verifyToken()`
Verify the current access token.

#### `refreshToken()`
Refresh the access token (iOS/Android only).

#### `getCurrentAccessToken()`
Get the current access token.

### Interfaces

[Include all interface definitions here]

## Error Handling

The plugin provides comprehensive error handling with specific error codes:

- `INITIALIZATION_FAILED`: SDK initialization failed
- `LOGIN_CANCELLED`: User cancelled login
- `NETWORK_ERROR`: Network connection issues
- `INVALID_TOKEN`: Access token is invalid
- `PERMISSION_DENIED`: Required permissions not granted

## Platform Differences

### Web
- Uses Line Login Web API
- Requires popup window for authentication
- Token refresh not supported

### iOS
- Uses Line SDK for iOS Swift
- Supports universal links
- Full token management support

### Android
- Uses Line SDK for Android
- Supports custom URL schemes
- Full token management support

## Troubleshooting

### Common Issues

1. **Login fails on Android**: Check that the custom URL scheme is correctly configured
2. **iOS build fails**: Ensure Line SDK is properly added to Package.swift
3. **Web login popup blocked**: Ensure popup blockers are disabled

### Debug Mode

Enable debug logging:

```typescript
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  debug: true
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
```

#### 6.2 创建配置指南
```markdown
# Line Login Plugin Configuration Guide

## Prerequisites

1. Line Developer Account
2. Line Login Channel created
3. Channel ID and Channel Secret obtained

## Platform-Specific Setup

### Android Configuration

1. **Gradle Dependencies**
   ```gradle
   dependencies {
       implementation 'com.linecorp:linesdk:5.8.1'
   }
   ```

2. **AndroidManifest.xml**
   ```xml
   <activity
       android:name="com.linecorp.linesdk.auth.LineAuthenticationActivity"
       android:exported="true"
       android:launchMode="singleTask">
       <intent-filter>
           <action android:name="android.intent.action.VIEW" />
           <category android:name="android.intent.category.DEFAULT" />
           <category android:name="android.intent.category.BROWSABLE" />
           <data android:scheme="line3rdp.{YOUR_CHANNEL_ID}" />
       </intent-filter>
   </activity>
   ```

3. **ProGuard Rules** (if using ProGuard)
   ```
   -keep class com.linecorp.linesdk.** { *; }
   ```

### iOS Configuration

1. **Package.swift**
   ```swift
   dependencies: [
       .package(url: "https://github.com/line/line-sdk-ios-swift.git", from: "5.8.0")
   ]
   ```

2. **Info.plist**
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
       <dict>
           <key>CFBundleURLSchemes</key>
           <array>
               <string>line3rdp.{YOUR_CHANNEL_ID}</string>
           </array>
       </dict>
   </array>
   ```

### Web Configuration

1. **Domain Registration**
   - Register your domain in Line Developer Console
   - Add callback URLs

2. **HTTPS Requirement**
   - Web login requires HTTPS in production
   - Use localhost for development

## Security Considerations

1. **Channel Secret Protection**
   - Never expose channel secret in client-side code
   - Use server-side token verification

2. **Token Storage**
   - Tokens are stored securely on each platform
   - Implement proper token refresh logic

3. **Scope Management**
   - Request only necessary scopes
   - Handle scope changes gracefully

## Testing

1. **Development Environment**
   - Use test channel for development
   - Enable debug logging

2. **Production Deployment**
   - Switch to production channel
   - Disable debug logging
   - Test on all target platforms

## Performance Optimization

1. **SDK Initialization**
   - Initialize once at app startup
   - Cache initialization status

2. **Token Management**
   - Implement token refresh logic
   - Handle token expiration gracefully

3. **Network Optimization**
   - Implement retry logic for network failures
   - Use appropriate timeout values

## Monitoring and Analytics

1. **Error Tracking**
   - Log authentication errors
   - Monitor success/failure rates

2. **Usage Analytics**
   - Track login frequency
   - Monitor user engagement

## Compliance

1. **Privacy Policy**
   - Clearly state data collection practices
   - Provide opt-out mechanisms

2. **Terms of Service**
   - Include Line Login terms
   - Update as needed

## Support

For additional support:
- Line Developer Documentation
- GitHub Issues
- Community Forums
```

## 项目里程碑

### 里程碑1: 基础设施 (完成度: 70%)
- [x] 项目结构设置
- [x] TypeScript接口定义
- [x] 基础配置文件
- [ ] 完善构建脚本

### 里程碑2: Android实现 (完成度: 0%)
- [ ] Gradle配置
- [ ] Java/Kotlin实现
- [ ] 权限配置
- [ ] 测试验证

### 里程碑3: iOS实现 (完成度: 0%)
- [ ] Swift Package配置
- [ ] Swift实现
- [ ] Info.plist配置
- [ ] 测试验证

### 里程碑4: Web实现 (完成度: 0%)
- [ ] Web SDK集成
- [ ] TypeScript实现
- [ ] 浏览器兼容性测试
- [ ] 安全性验证

### 里程碑5: 集成测试 (完成度: 0%)
- [ ] 示例应用更新
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能测试

### 里程碑6: 文档和发布 (完成度: 30%)
- [x] 开发规则文档
- [x] 基础README
- [ ] 完整API文档
- [ ] 配置指南
- [ ] 发布准备

## 风险评估

### 高风险
- Line SDK版本兼容性变化
- 平台特定的安全要求
- 第三方依赖更新

### 中风险
- 网络连接稳定性
- 用户权限管理
- 跨平台行为差异

### 低风险
- UI/UX优化
- 性能微调
- 文档更新

## 质量保证

### 代码质量
- TypeScript严格模式
- ESLint规则检查
- 代码覆盖率>80%

### 测试策略
- 单元测试: Jest
- 集成测试: 真实设备测试
- 端到端测试: 示例应用验证

### 安全审查
- 令牌存储安全性
- 网络传输加密
- 权限最小化原则

## 后续维护

### 版本管理
- 语义化版本控制
- 变更日志维护
- 向后兼容性保证

### 社区支持
- GitHub Issues响应
- 文档持续更新
- 示例代码维护

### 技术债务
- 定期依赖更新
- 代码重构优化
- 性能监控改进

---

**预计完成时间**: 2-3周
**团队规模**: 1-2名开发者
**技术难度**: 中等
**维护复杂度**: 低-中等 