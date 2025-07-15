# iOS 平台配置指南

本指南详细说明如何在 iOS 平台上配置和集成 Line Login Plugin。

## 前提条件

- iOS 12.0 或更高版本
- Xcode 12.0 或更高版本
- Swift 5.0 或更高版本
- 有效的 Line Developer Channel ID
- Apple Developer Account（用于真机测试和发布）

## 配置步骤

### 1. 依赖配置

插件使用 Swift Package Manager 自动管理依赖。您可以在 `ios/Podfile` 中验证：

```ruby
# ios/Podfile
platform :ios, '12.0'

target 'App' do
  use_frameworks!
  
  # Capacitor 依赖
  pod 'Capacitor', :path => '../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../node_modules/@capacitor/ios'
  
  # Line Login Plugin 依赖
  pod 'LineSDKSwift', '~> 5.8.0'
  
  # 其他依赖...
end
```

### 2. Info.plist 配置

在 `ios/App/App/Info.plist` 中添加以下配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- 现有配置... -->
    
    <!-- Line SDK 配置 -->
    <key>LineSDKConfig</key>
    <dict>
        <key>ChannelID</key>
        <string>YOUR_LINE_CHANNEL_ID</string>
    </dict>
    
    <!-- URL Scheme 配置 -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>line3rdp.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>line3rdp.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
            </array>
        </dict>
    </array>
    
    <!-- 应用传输安全配置 -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSExceptionDomains</key>
        <dict>
            <key>line.me</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <false/>
                <key>NSExceptionMinimumTLSVersion</key>
                <string>TLSv1.2</string>
                <key>NSExceptionRequiresForwardSecrecy</key>
                <false/>
            </dict>
            <key>access.line.me</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <false/>
                <key>NSExceptionMinimumTLSVersion</key>
                <string>TLSv1.2</string>
                <key>NSExceptionRequiresForwardSecrecy</key>
                <false/>
            </dict>
        </dict>
    </dict>
    
    <!-- 查询方案配置 -->
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>lineauth2</string>
    </array>
</dict>
</plist>
```

**重要**: 将 `YOUR_LINE_CHANNEL_ID` 替换为您从 Line Developers Console 获取的实际 Channel ID。

### 3. AppDelegate.swift 配置

在 `ios/App/App/AppDelegate.swift` 中添加 Line SDK 初始化：

```swift
import UIKit
import Capacitor
import LineSDK

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 从 Info.plist 读取 Channel ID
        guard let path = Bundle.main.path(forResource: "Info", ofType: "plist"),
              let plist = NSDictionary(contentsOfFile: path),
              let config = plist["LineSDKConfig"] as? [String: Any],
              let channelId = config["ChannelID"] as? String else {
            fatalError("Line Channel ID not found in Info.plist")
        }
        
        // 初始化 Line SDK
        LoginManager.shared.setup(channelID: channelId, universalLinkURL: nil)
        
        return true
    }

    // MARK: UISceneSession Lifecycle (iOS 13+)
    @available(iOS 13.0, *)
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    // MARK: URL Handling
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // 处理 Line SDK 回调
        if LoginManager.shared.application(app, open: url, options: options) {
            return true
        }
        
        // 处理其他 URL schemes
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
    
    // iOS 13+ Scene Delegate 支持
    @available(iOS 13.0, *)
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // 处理 Universal Links
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
```

### 4. SceneDelegate.swift 配置（iOS 13+）

如果您的应用使用 Scene Delegate，在 `ios/App/App/SceneDelegate.swift` 中添加：

```swift
import UIKit
import LineSDK

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let _ = (scene as? UIWindowScene) else { return }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        
        // 处理 Line SDK 回调
        if LoginManager.shared.application(UIApplication.shared, open: url, options: [:]) {
            return
        }
        
        // 处理其他 URL schemes
        // 您的其他 URL 处理逻辑
    }
}
```

## 高级配置

### 1. Universal Links 配置

如果您想使用 Universal Links 而不是 URL Scheme，请参考 [iOS Universal Links 配置指南](ios-universal-links-configuration.md)。

### 2. 多环境配置

对于不同的构建配置（如 Debug、Staging、Production），您可以创建不同的配置文件：

```
ios/App/App/Info-Debug.plist
ios/App/App/Info-Staging.plist
ios/App/App/Info-Production.plist
```

在 Xcode 的 Build Settings 中，为每个配置设置不同的 Info.plist 文件。

### 3. 自定义 UI 配置

您可以自定义 Line Login 的 UI 主题：

```swift
// 在 AppDelegate.swift 中
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // 自定义 Line Login UI
    LoginManager.shared.setup(channelID: channelId, universalLinkURL: nil)
    
    // 设置自定义主题色
    if let navigationController = window?.rootViewController as? UINavigationController {
        navigationController.navigationBar.tintColor = UIColor(red: 0.0, green: 0.7, blue: 0.4, alpha: 1.0) // Line Green
    }
    
    return true
}
```

### 4. 权限配置

如果您需要访问特定的用户信息，确保在 Info.plist 中添加相应的权限描述：

```xml
<!-- 如果需要访问用户照片 -->
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to set profile picture</string>

<!-- 如果需要访问相机 -->
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take profile picture</string>
```

## 测试配置

### 1. 模拟器测试

Line Login 在 iOS 模拟器上有一些限制：

- 无法启动 Line 应用
- 只能使用 Web 登录流程
- 某些功能可能不可用

建议使用真实设备进行完整测试。

### 2. 调试配置

在开发过程中，您可以启用详细日志：

```swift
// 在 AppDelegate.swift 中
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    #if DEBUG
    // 启用调试日志
    LoginManager.shared.isDebugMode = true
    #endif
    
    return true
}
```

### 3. 证书配置

对于真机测试，确保：

1. 在 Apple Developer Portal 中创建了正确的 App ID
2. 配置了正确的 Bundle ID
3. 创建了开发证书和 Provisioning Profile
4. 在 Xcode 中选择了正确的 Team 和 Signing Certificate

## 常见问题

### 构建问题

**Q: 构建时出现 "LineSDK module not found" 错误**
A: 运行 `npx cap sync ios` 重新同步依赖，然后在 Xcode 中 Clean Build Folder。

**Q: 无法导入 LineSDK**
A: 确保在 `ios/Podfile` 中正确添加了 LineSDK 依赖，并运行 `pod install`。

### 运行时问题

**Q: 登录时应用崩溃**
A: 检查 Info.plist 中的 Channel ID 配置是否正确。

**Q: URL Scheme 回调不工作**
A: 确保 URL Scheme 配置正确，格式为 `line3rdp.YOUR_BUNDLE_ID`。

**Q: 应用无法打开 Line 应用**
A: 确保在 Info.plist 中添加了 `LSApplicationQueriesSchemes` 配置。

### 配置问题

**Q: Channel ID 无效**
A: 确保 Channel ID 来自 Line Developers Console，并且格式正确。

**Q: Bundle ID 不匹配**
A: 确保 Xcode 中的 Bundle ID 与 Line Developers Console 中配置的一致。

## 性能优化

### 1. 启动时间优化

```swift
// 延迟初始化 Line SDK
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // 在后台队列中初始化 Line SDK
    DispatchQueue.global(qos: .background).async {
        LoginManager.shared.setup(channelID: channelId, universalLinkURL: nil)
    }
    
    return true
}
```

### 2. 内存管理

```swift
// 在适当的时机清理资源
func applicationDidEnterBackground(_ application: UIApplication) {
    // 清理 Line SDK 缓存
    LoginManager.shared.logout { _ in }
}
```

## 安全考虑

1. **Channel Secret 保护**: 永远不要在客户端代码中硬编码 Channel Secret
2. **证书固定**: 考虑实现证书固定以增强安全性
3. **代码混淆**: 在发布版本中启用代码混淆
4. **Keychain 保护**: 敏感数据存储在 Keychain 中
5. **应用传输安全**: 确保 ATS 配置正确

## App Store 发布

### 1. 构建配置

```swift
// 在 Release 配置中禁用调试
#if !DEBUG
LoginManager.shared.isDebugMode = false
#endif
```

### 2. 隐私清单

确保在 App Store 提交时包含正确的隐私信息：

- 网络使用说明
- 数据收集说明
- 第三方 SDK 使用说明

## 下一步

- 查看 [URL Scheme 配置指南](ios-url-scheme-configuration.md) 了解详细的 URL Scheme 配置
- 阅读 [Universal Links 配置指南](ios-universal-links-configuration.md) 了解 Universal Links 设置
- 参考 [故障排除指南](troubleshooting.md) 解决常见问题
- 查看 [初始化示例](initialization-example.md) 了解如何在代码中使用插件 