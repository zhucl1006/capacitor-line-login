# iOS Universal Links 配置指南

## 概述

Universal Links 是 iOS 9+ 支持的一种深度链接技术，可以让用户通过网页链接直接打开应用。对于 Line Login，Universal Links 提供了比 URL Scheme 更安全和用户友好的登录体验。

## 配置步骤

### 1. 在 Xcode 中启用 Associated Domains

1. 在 Xcode 中打开您的项目
2. 选择您的应用 target
3. 点击 "Signing & Capabilities" 选项卡
4. 点击 "+ Capability" 按钮
5. 添加 "Associated Domains" 功能
6. 在 Associated Domains 中添加：
   ```
   applinks:your-domain.com
   ```

### 2. 创建 apple-app-site-association 文件

在您的网站根目录创建 `apple-app-site-association` 文件（无扩展名）：

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.BUNDLE_ID",
        "paths": [
          "/line-login/*"
        ]
      }
    ]
  }
}
```

### 3. 配置 Web 服务器

确保您的 Web 服务器满足以下要求：

- 文件必须通过 HTTPS 提供
- 文件必须位于域名根目录或 `.well-known` 目录下
- 文件的 Content-Type 必须是 `application/json`
- 文件大小不能超过 128KB

### 4. 在 AppDelegate 中处理 Universal Links

在您的 `AppDelegate.swift` 文件中添加以下代码：

```swift
import LineSDK

func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    
    // Handle Line Login Universal Links
    if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
       let url = userActivity.webpageURL {
        
        // Check if this is a Line Login URL
        if url.absoluteString.contains("line-login") {
            return LoginManager.shared.application(application, open: url)
        }
    }
    
    return false
}
```

### 5. 在 Line Developers Console 中配置

1. 登录到 [Line Developers Console](https://developers.line.biz/)
2. 选择您的 Channel
3. 在 "LINE Login" 选项卡中配置：
   - **iOS bundle ID**: 您的应用 Bundle ID
   - **iOS universal link**: `https://your-domain.com/line-login`

## 完整示例

### 示例配置

假设您的配置如下：
- Team ID: `ABC123DEF4`
- Bundle ID: `com.example.myapp`
- 域名: `myapp.example.com`

### 1. Xcode Associated Domains 配置：
```
applinks:myapp.example.com
```

### 2. apple-app-site-association 文件：
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "ABC123DEF4.com.example.myapp",
        "paths": [
          "/line-login/*"
        ]
      }
    ]
  }
}
```

### 3. Line Developers Console 配置：
- iOS bundle ID: `com.example.myapp`
- iOS universal link: `https://myapp.example.com/line-login`

### 4. AppDelegate.swift 完整示例：
```swift
import UIKit
import LineSDK

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    // Handle URL Scheme (fallback)
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        if LoginManager.shared.application(app, open: url, options: options) {
            return true
        }
        return false
    }

    // Handle Universal Links
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL {
            
            // Handle Line Login Universal Links
            if url.absoluteString.contains("line-login") {
                return LoginManager.shared.application(application, open: url)
            }
        }
        
        return false
    }
}
```

## 测试配置

### 1. 验证 apple-app-site-association 文件

使用 Apple 的验证工具：
```bash
curl -I https://your-domain.com/apple-app-site-association
```

确认返回：
- HTTP 200 状态码
- Content-Type: application/json

### 2. 测试 Universal Links

1. 在 Safari 中打开：`https://your-domain.com/line-login/test`
2. 如果配置正确，应该会显示"在 App 中打开"的横幅
3. 点击横幅应该会打开您的应用

### 3. 使用 Apple 的 Universal Links 测试工具

您可以使用以下工具验证配置：
- [Apple App Site Association Validator](https://branch.io/resources/aasa-validator/)
- [Universal Links Tester](https://search.developer.apple.com/appsearch-validation-tool/)

## 故障排除

### 常见问题：

1. **Universal Links 不工作**
   - 检查 apple-app-site-association 文件是否可通过 HTTPS 访问
   - 确认 Team ID 和 Bundle ID 配置正确
   - 检查 Associated Domains 配置是否正确

2. **文件无法访问**
   - 确认文件位于正确的路径（根目录或 .well-known 目录）
   - 检查 Web 服务器配置是否支持无扩展名文件
   - 确认 HTTPS 证书有效

3. **应用不响应 Universal Links**
   - 检查 AppDelegate 中的处理代码
   - 确认 NSUserActivity 的处理逻辑
   - 验证 URL 匹配逻辑

### 调试技巧：

1. **使用 Xcode 控制台查看日志**
   ```swift
   print("Universal Link received: \(url.absoluteString)")
   ```

2. **检查 Associated Domains 配置**
   - 在设备设置中查看应用的 Associated Domains
   - 确认域名验证成功

3. **使用 Apple 的验证工具**
   - 验证 apple-app-site-association 文件格式
   - 检查域名配置是否正确

## 注意事项

- Universal Links 需要 iOS 9.0+
- 首次安装应用后，Universal Links 可能需要一些时间才能生效
- 如果用户手动在 Safari 中打开链接，Universal Links 会被禁用，需要下拉刷新页面重新启用
- 建议同时配置 URL Scheme 作为备用方案
- apple-app-site-association 文件更新后，可能需要重新安装应用才能生效

## 相关文档

- [Apple Universal Links 官方文档](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content)
- [Line SDK Universal Links 配置](https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/universal-links/)
- [Associated Domains 配置指南](https://developer.apple.com/documentation/xcode/configuring-an-associated-domain) 