# 安装指南

本指南将帮助您在 Capacitor 项目中安装和配置 Line Login Plugin。

## 系统要求

### 最低版本要求
- **Node.js**: 16.0.0 或更高版本
- **Capacitor**: 4.0.0 或更高版本
- **TypeScript**: 4.0.0 或更高版本

### 平台要求
- **Android**: API Level 21 (Android 5.0) 或更高
- **iOS**: iOS 12.0 或更高
- **Web**: 现代浏览器（Chrome 88+, Firefox 78+, Safari 14+）

## 安装步骤

### 1. 安装插件

```bash
npm install capacitor-line-login
npx cap sync
```

### 2. 获取 Line Developer 凭证

1. 访问 [Line Developers Console](https://developers.line.biz/console/)
2. 创建新的 Provider 或选择现有的 Provider
3. 创建新的 Channel 或选择现有的 Channel
4. 记录以下信息：
   - **Channel ID**: 用于插件初始化
   - **Channel Secret**: 用于服务器端验证（可选）

### 3. 平台特定配置

#### Android 配置

1. 在 `android/app/src/main/res/values/strings.xml` 中添加：

```xml
<resources>
    <string name="line_channel_id">YOUR_CHANNEL_ID</string>
</resources>
```

2. 在 `android/app/src/main/AndroidManifest.xml` 中添加：

```xml
<application>
    <!-- Line Login 配置 -->
    <meta-data
        android:name="com.linecorp.linesdk.ChannelId"
        android:value="@string/line_channel_id" />
    
    <!-- Line Login Activity -->
    <activity
        android:name="com.linecorp.linesdk.auth.LineAuthActivity"
        android:exported="true"
        android:launchMode="singleTop"
        android:theme="@android:style/Theme.Translucent.NoTitleBar" />
</application>
```

#### iOS 配置

1. 在 `ios/App/App/Info.plist` 中添加：

```xml
<dict>
    <key>LineSDKConfig</key>
    <dict>
        <key>ChannelID</key>
        <string>YOUR_CHANNEL_ID</string>
    </dict>
    
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
</dict>
```

2. 在 `ios/App/App/AppDelegate.swift` 中添加：

```swift
import LineSDK

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Line SDK 初始化
        LoginManager.shared.setup(channelID: "YOUR_CHANNEL_ID", universalLinkURL: nil)
        
        return true
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return LoginManager.shared.application(app, open: url, options: options)
    }
}
```

#### Web 配置

Web 平台不需要额外的配置文件，但需要确保：

1. 在 Line Developers Console 中配置正确的 Callback URL
2. 使用 HTTPS 协议（本地开发可以使用 HTTP）
3. 确保域名在 Line Channel 的白名单中

### 4. 验证安装

创建一个简单的测试文件来验证安装：

```typescript
// src/test-line-login.ts
import { LineLogin } from 'capacitor-line-login';

async function testLineLogin() {
  try {
    await LineLogin.initialize({
      channelId: 'YOUR_CHANNEL_ID'
    });
    console.log('Line Login 初始化成功');
  } catch (error) {
    console.error('Line Login 初始化失败:', error);
  }
}

testLineLogin();
```

## 常见问题

### 安装问题

**Q: 安装时出现 "peer dependencies" 警告**
A: 确保您的 Capacitor 版本符合要求，运行 `npm ls @capacitor/core` 检查版本。

**Q: Android 构建失败**
A: 检查 `android/app/build.gradle` 中的 `minSdkVersion` 是否设置为 21 或更高。

**Q: iOS 构建失败**
A: 确保 Xcode 版本为 12.0 或更高，并且 iOS Deployment Target 设置为 12.0 或更高。

### 配置问题

**Q: Channel ID 无效**
A: 确保 Channel ID 是从 Line Developers Console 获取的正确值，不包含额外的空格或特殊字符。

**Q: 回调 URL 配置错误**
A: 确保在 Line Developers Console 中配置的 Callback URL 与您的应用域名匹配。

## 下一步

- 查看 [初始化示例](initialization-example.md) 了解如何初始化插件
- 阅读 [使用指南](usage-guide.md) 了解完整的 API 使用方法
- 参考 [平台配置指南](android-configuration.md) 了解更多平台特定配置

## 技术支持

如果您在安装过程中遇到问题，请：

1. 检查 [故障排除指南](troubleshooting.md)
2. 查看 [GitHub Issues](https://github.com/your-username/capacitor-line-login/issues)
3. 提交新的 Issue 并提供详细的错误信息 