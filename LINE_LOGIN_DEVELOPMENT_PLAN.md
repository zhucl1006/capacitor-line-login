# Line Login Capacitor Plugin 开发计划

## 项目概述

基于 Cursor 规则文件和产品需求文档，制定 Line Login Capacitor Plugin 的完整开发计划。该插件将为 Android、iOS 和 Web 平台提供统一的 Line Login 功能。

## 开发阶段

### 第一阶段：项目基础设施和接口定义

#### 1.1 更新 TypeScript 接口定义
**文件**: `src/definitions.ts`
**参考规则**: `line-login-typescript.mdc`

**任务内容**:
- 替换现有的 `echo` 方法
- 实现完整的 `LineLoginPlugin` 接口
- 定义所有相关的类型和错误枚举

**实现细节**:
```typescript
export interface LineLoginPlugin {
  initialize(options: LineLoginConfig): Promise<void>;
  login(options?: LoginOptions): Promise<LoginResult>;
  getUserProfile(): Promise<UserProfile>;
  logout(): Promise<void>;
  refreshToken(): Promise<RefreshTokenResult>;
  isLoggedIn(): Promise<{ isLoggedIn: boolean }>;
}

export interface LineLoginConfig {
  channelId: string;
  universalLinkURL?: string;
  webLoginURL?: string;
}

export interface LoginOptions {
  scopes?: string[];
  onlyWebLogin?: boolean;
  botPrompt?: 'normal' | 'aggressive';
}

export interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope: string;
  tokenType: string;
  idToken?: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope: string;
  tokenType: string;
}

export interface LineLoginError {
  code: string;
  message: string;
  details?: any;
}

export enum LineLoginErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  LOGIN_CANCELLED = 'LOGIN_CANCELLED',
  LOGIN_FAILED = 'LOGIN_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  USER_NOT_LOGGED_IN = 'USER_NOT_LOGGED_IN',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}
```

#### 1.2 更新 Web 实现
**文件**: `src/web.ts`
**参考规则**: `line-login-typescript.mdc`

**任务内容**:
- 实现 Web 平台的 Line Login 功能
- 使用 Line Login Web API
- 处理 OAuth 2.0 流程
- 实现错误处理和状态管理

**实现细节**:
```typescript
export class LineLoginWeb extends WebPlugin implements LineLoginPlugin {
  private isInitialized = false;
  private config?: LineLoginConfig;
  private currentToken?: string;

  async initialize(options: LineLoginConfig): Promise<void> {
    this.config = options;
    this.isInitialized = true;
  }

  async login(options?: LoginOptions): Promise<LoginResult> {
    if (!this.isInitialized) {
      throw this.createError(LineLoginErrorCode.INITIALIZATION_FAILED, 'Plugin not initialized');
    }

    // 实现 Web OAuth 流程
    const authUrl = this.buildAuthUrl(options);
    const result = await this.handleWebLogin(authUrl);
    
    this.currentToken = result.accessToken;
    return result;
  }

  // 其他方法实现...
}
```

### 第二阶段：Android 平台实现

#### 2.1 更新 Android 构建配置
**文件**: `android/build.gradle`
**参考规则**: `line-login-build.mdc`

**任务内容**:
- 添加 Line SDK for Android 依赖
- 更新 Gradle 配置
- 配置 ProGuard 规则

**实现细节**:
```gradle
dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation project(':capacitor-android')
    implementation 'com.linecorp:linesdk:5.8.1'
    
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
}
```

#### 2.2 更新 AndroidManifest.xml
**文件**: `android/src/main/AndroidManifest.xml`
**参考规则**: `line-login-build.mdc`

**任务内容**:
- 添加必要的权限
- 配置 Line Login Activity
- 设置 Intent Filter

**实现细节**:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<activity
    android:name="com.linecorp.linesdk.auth.LineAuthenticationActivity"
    android:exported="true"
    android:launchMode="singleTop"
    android:theme="@android:style/Theme.Translucent.NoTitleBar">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="line3rdp.{CHANNEL_ID}" />
    </intent-filter>
</activity>
```

#### 2.3 实现 Android 核心逻辑
**文件**: `android/src/main/java/com/aile/plugins/linelogin/LineLogin.java`
**参考规则**: `line-login-android.mdc`

**任务内容**:
- 实现 Line SDK 集成
- 处理登录流程
- 管理令牌和用户信息
- 实现错误处理

**实现细节**:
```java
public class LineLogin {
    private Context context;
    private String channelId;
    private boolean isInitialized = false;
    private LineApiClient lineApiClient;

    public void initialize(Context context, String channelId) {
        this.context = context;
        this.channelId = channelId;
        
        LineApiClientBuilder apiClientBuilder = new LineApiClientBuilder(context, channelId);
        this.lineApiClient = apiClientBuilder.build();
        
        this.isInitialized = true;
    }

    public void login(List<String> scopes, boolean onlyWebLogin, LoginCallback callback) {
        if (!isInitialized) {
            callback.onError("Plugin not initialized");
            return;
        }

        // 实现登录逻辑
        LoginRequestBuilder loginRequestBuilder = new LoginRequestBuilder()
                .scopes(scopes);

        if (onlyWebLogin) {
            loginRequestBuilder.webLoginOnly();
        }

        LoginRequest loginRequest = loginRequestBuilder.build();
        
        // 启动登录流程
        // 实现具体的登录逻辑
    }

    // 其他方法实现...
}
```

#### 2.4 实现 Android 插件桥接
**文件**: `android/src/main/java/com/aile/plugins/linelogin/LineLoginPlugin.java`
**参考规则**: `line-login-android.mdc`

**任务内容**:
- 更新插件方法
- 处理 Capacitor 调用
- 实现参数转换和错误处理

**实现细节**:
```java
@CapacitorPlugin(name = "LineLogin")
public class LineLoginPlugin extends Plugin {
    private LineLogin implementation = new LineLogin();

    @PluginMethod
    public void initialize(PluginCall call) {
        String channelId = call.getString("channelId");
        if (channelId == null) {
            call.reject("channelId is required");
            return;
        }

        implementation.initialize(getContext(), channelId);
        call.resolve();
    }

    @PluginMethod
    public void login(PluginCall call) {
        JSArray scopesArray = call.getArray("scopes");
        List<String> scopes = new ArrayList<>();
        
        if (scopesArray != null) {
            for (int i = 0; i < scopesArray.length(); i++) {
                try {
                    scopes.add(scopesArray.getString(i));
                } catch (JSONException e) {
                    // 处理错误
                }
            }
        }

        boolean onlyWebLogin = call.getBoolean("onlyWebLogin", false);

        implementation.login(scopes, onlyWebLogin, new LoginCallback() {
            @Override
            public void onSuccess(LoginResult result) {
                JSObject ret = new JSObject();
                ret.put("accessToken", result.getAccessToken());
                ret.put("refreshToken", result.getRefreshToken());
                ret.put("expiresIn", result.getExpiresIn());
                ret.put("scope", result.getScope());
                ret.put("tokenType", result.getTokenType());
                call.resolve(ret);
            }

            @Override
            public void onError(String error) {
                call.reject(error);
            }
        });
    }

    // 其他方法实现...
}
```

### 第三阶段：iOS 平台实现

#### 3.1 更新 iOS 依赖配置
**文件**: `Package.swift`
**参考规则**: `line-login-build.mdc`

**任务内容**:
- 添加 Line SDK for iOS 依赖
- 更新 Swift Package Manager 配置

**实现细节**:
```swift
dependencies: [
    .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0"),
    .package(url: "https://github.com/line/line-sdk-ios-swift.git", from: "5.8.0")
],
targets: [
    .target(
        name: "LineLoginPlugin",
        dependencies: [
            .product(name: "Capacitor", package: "capacitor-swift-pm"),
            .product(name: "Cordova", package: "capacitor-swift-pm"),
            .product(name: "LineSDK", package: "line-sdk-ios-swift")
        ],
        path: "ios/Sources/LineLoginPlugin"
    )
]
```

#### 3.2 更新 CocoaPods 配置
**文件**: `CapacitorLineLogin.podspec`
**参考规则**: `line-login-build.mdc`

**任务内容**:
- 添加 LineSDK 依赖
- 更新 podspec 配置

**实现细节**:
```ruby
s.dependency 'Capacitor'
s.dependency 'LineSDK'
```

#### 3.3 实现 iOS 核心逻辑
**文件**: `ios/Sources/LineLoginPlugin/LineLogin.swift`
**参考规则**: `line-login-ios.mdc`

**任务内容**:
- 实现 Line SDK 集成
- 处理登录流程和用户信息
- 实现错误处理和状态管理

**实现细节**:
```swift
import Foundation
import LineSDK

@objc public class LineLogin: NSObject {
    private var channelId: String?
    private var isInitialized = false
    private var loginManager: LoginManager?

    @objc public func initialize(channelId: String, completion: @escaping (Result<Void, LineLoginError>) -> Void) {
        self.channelId = channelId
        
        guard !channelId.isEmpty else {
            completion(.failure(LineLoginError.invalidChannelId))
            return
        }

        LoginManager.shared.setup(channelID: channelId, universalLinkURL: nil)
        self.loginManager = LoginManager.shared
        
        self.isInitialized = true
        completion(.success(()))
    }

    @objc public func login(
        scopes: [String],
        onlyWebLogin: Bool,
        completion: @escaping (Result<LoginResult, LineLoginError>) -> Void
    ) {
        guard isInitialized else {
            completion(.failure(LineLoginError.notInitialized))
            return
        }

        guard let loginManager = self.loginManager else {
            completion(.failure(LineLoginError.notInitialized))
            return
        }

        let permissions = scopes.compactMap { LoginPermission(rawValue: $0) }
        
        loginManager.login(
            permissions: permissions.isEmpty ? [.profile] : permissions,
            in: nil
        ) { result in
            switch result {
            case .success(let loginResult):
                let result = LoginResult(
                    accessToken: loginResult.accessToken.value,
                    refreshToken: loginResult.refreshToken?.value,
                    expiresIn: loginResult.accessToken.expiresIn,
                    scope: loginResult.permissions.map { $0.rawValue }.joined(separator: " "),
                    tokenType: "Bearer",
                    idToken: loginResult.idToken?.value
                )
                completion(.success(result))
                
            case .failure(let error):
                completion(.failure(self.handleLineSDKError(error)))
            }
        }
    }

    // 其他方法实现...
}
```

#### 3.4 实现 iOS 插件桥接
**文件**: `ios/Sources/LineLoginPlugin/LineLoginPlugin.swift`
**参考规则**: `line-login-ios.mdc`

**任务内容**:
- 更新插件方法
- 处理 Capacitor 调用
- 实现参数转换和错误处理

**实现细节**:
```swift
@objc(LineLoginPlugin)
public class LineLoginPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LineLoginPlugin"
    public let jsName = "LineLogin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "login", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getUserProfile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "refreshToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isLoggedIn", returnType: CAPPluginReturnPromise)
    ]
    
    private let implementation = LineLogin()
    
    @objc func initialize(_ call: CAPPluginCall) {
        guard let channelId = call.getString("channelId") else {
            call.reject("channelId is required")
            return
        }
        
        implementation.initialize(channelId: channelId) { result in
            switch result {
            case .success:
                call.resolve()
            case .failure(let error):
                self.handleError(call: call, error: error)
            }
        }
    }

    @objc func login(_ call: CAPPluginCall) {
        let scopes = call.getArray("scopes", String.self) ?? []
        let onlyWebLogin = call.getBool("onlyWebLogin") ?? false
        
        implementation.login(
            scopes: scopes,
            onlyWebLogin: onlyWebLogin
        ) { result in
            switch result {
            case .success(let loginResult):
                let response: [String: Any] = [
                    "accessToken": loginResult.accessToken,
                    "refreshToken": loginResult.refreshToken ?? "",
                    "expiresIn": loginResult.expiresIn,
                    "scope": loginResult.scope,
                    "tokenType": loginResult.tokenType,
                    "idToken": loginResult.idToken ?? ""
                ]
                call.resolve(response)
                
            case .failure(let error):
                self.handleError(call: call, error: error)
            }
        }
    }

    // 其他方法实现...
}
```

### 第四阶段：示例应用和测试

#### 4.1 更新示例应用
**文件**: `example-app/src/js/example.js`

**任务内容**:
- 实现完整的 Line Login 功能演示
- 添加所有 API 方法的测试
- 创建用户友好的界面

**实现细节**:
```javascript
import { LineLogin } from 'capacitor-line-login';

// 初始化
window.initializeLineLogin = async () => {
    try {
        await LineLogin.initialize({
            channelId: 'YOUR_CHANNEL_ID'
        });
        console.log('Line Login initialized successfully');
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};

// 登录
window.loginWithLine = async () => {
    try {
        const result = await LineLogin.login({
            scopes: ['profile', 'openid']
        });
        console.log('Login successful:', result);
        document.getElementById('loginResult').innerText = JSON.stringify(result, null, 2);
    } catch (error) {
        console.error('Login failed:', error);
    }
};

// 获取用户信息
window.getUserProfile = async () => {
    try {
        const profile = await LineLogin.getUserProfile();
        console.log('User profile:', profile);
        document.getElementById('userProfile').innerText = JSON.stringify(profile, null, 2);
    } catch (error) {
        console.error('Get user profile failed:', error);
    }
};

// 登出
window.logout = async () => {
    try {
        await LineLogin.logout();
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};
```

#### 4.2 更新示例应用 HTML
**文件**: `example-app/src/index.html`

**任务内容**:
- 创建完整的测试界面
- 添加所有功能的按钮和显示区域

**实现细节**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Line Login Plugin Example</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { margin: 10px; padding: 10px 20px; }
        .result { background: #f5f5f5; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Line Login Plugin Example</h1>
    
    <div>
        <button onclick="initializeLineLogin()">Initialize</button>
        <button onclick="loginWithLine()">Login</button>
        <button onclick="getUserProfile()">Get Profile</button>
        <button onclick="logout()">Logout</button>
        <button onclick="checkLoginStatus()">Check Status</button>
    </div>

    <div>
        <h3>Login Result:</h3>
        <pre id="loginResult" class="result"></pre>
    </div>

    <div>
        <h3>User Profile:</h3>
        <pre id="userProfile" class="result"></pre>
    </div>

    <div>
        <h3>Login Status:</h3>
        <pre id="loginStatus" class="result"></pre>
    </div>

    <script type="module" src="js/example.js"></script>
</body>
</html>
```

### 第五阶段：文档和配置

#### 5.1 更新 README.md
**文件**: `README.md`

**任务内容**:
- 完整的安装和配置指南
- 所有 API 方法的文档
- 平台特定的配置说明
- 故障排除指南

#### 5.2 更新 package.json
**文件**: `package.json`
**参考规则**: `line-login-build.mdc`

**任务内容**:
- 更新项目描述和关键词
- 添加必要的脚本
- 更新依赖版本

#### 5.3 创建配置指南
**文件**: `CONFIGURATION.md`

**任务内容**:
- 详细的平台配置指南
- Line Developer Console 设置
- 常见问题解答

### 第六阶段：测试和优化

#### 6.1 单元测试
**文件**: `tests/` 目录

**任务内容**:
- 为所有平台创建单元测试
- 测试覆盖率 > 80%
- 模拟 Line SDK 响应

#### 6.2 集成测试
**任务内容**:
- 跨平台集成测试
- 真实设备测试
- 性能测试

#### 6.3 代码质量检查
**任务内容**:
- ESLint 检查
- SwiftLint 检查
- TypeScript 严格模式检查

## 实施顺序

1. **第一阶段** (1-2 周): 基础接口定义和 Web 实现
2. **第二阶段** (2-3 周): Android 平台完整实现
3. **第三阶段** (2-3 周): iOS 平台完整实现
4. **第四阶段** (1 周): 示例应用和基础测试
5. **第五阶段** (1 周): 文档和配置完善
6. **第六阶段** (1-2 周): 全面测试和优化

## 关键里程碑

- [ ] TypeScript 接口定义完成
- [ ] Web 平台基础实现完成
- [ ] Android 平台实现完成
- [ ] iOS 平台实现完成
- [ ] 示例应用可运行
- [ ] 所有平台测试通过
- [ ] 文档完整
- [ ] 发布准备就绪

## 技术风险和缓解措施

### 风险1: Line SDK 版本兼容性
**缓解措施**: 
- 使用稳定版本的 Line SDK
- 定期检查 SDK 更新
- 维护兼容性矩阵

### 风险2: 平台特定配置复杂性
**缓解措施**:
- 详细的配置文档
- 自动化配置脚本
- 示例项目参考

### 风险3: 安全性问题
**缓解措施**:
- 遵循 OWASP 安全指南
- 定期安全审计
- 使用最新的安全实践

## 质量保证

- 代码审查流程
- 自动化测试流程
- 持续集成/持续部署
- 性能监控
- 用户反馈收集

## 后续维护

- 定期更新 Line SDK
- 响应用户反馈
- 修复 Bug 和安全漏洞
- 添加新功能
- 维护文档更新

这个开发计划基于我们创建的 Cursor 规则文件，确保了：
- 遵循 Capacitor 插件开发最佳实践
- 正确集成 Line SDK 到各个平台
- 保持代码质量和一致性
- 提供完整的文档和示例 