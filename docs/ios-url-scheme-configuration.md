# iOS URL Scheme 配置指南

## 概述

为了让 Line Login 在 iOS 平台上正常工作，您需要在您的 iOS 应用中配置 URL Scheme。这个配置需要在使用此插件的主应用中完成。

## 配置步骤

### 1. 在 Info.plist 中配置 URL Scheme

在您的 iOS 应用的 `Info.plist` 文件中添加以下配置：

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>line-login</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>line3rdp.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
        </array>
    </dict>
</array>
```

### 2. 在 AppDelegate 中处理 URL Scheme

在您的 `AppDelegate.swift` 文件中添加以下代码：

```swift
import LineSDK

func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    // Handle Line Login URL Scheme
    if LoginManager.shared.application(app, open: url, options: options) {
        return true
    }
    
    // Handle other URL schemes
    return false
}
```

### 3. 在 Line Developers Console 中配置

1. 登录到 [Line Developers Console](https://developers.line.biz/)
2. 选择您的 Channel
3. 在 "LINE Login" 选项卡中，找到 "iOS bundle ID" 配置
4. 添加您的应用的 Bundle ID
5. 在 "iOS scheme" 中添加：`line3rdp.{YOUR_BUNDLE_ID}`

## 示例配置

假设您的应用 Bundle ID 是 `com.example.myapp`，那么：

### Info.plist 配置示例：
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>line-login</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>line3rdp.com.example.myapp</string>
        </array>
    </dict>
</array>
```

### Line Developers Console 配置：
- iOS bundle ID: `com.example.myapp`
- iOS scheme: `line3rdp.com.example.myapp`

## 测试配置

您可以通过以下方式测试 URL Scheme 配置是否正确：

1. 在 Safari 中打开：`line3rdp.com.example.myapp://`
2. 如果配置正确，应该会打开您的应用
3. 在应用中调用 Line Login 功能，验证登录流程是否正常

## 故障排除

### 常见问题：

1. **URL Scheme 不工作**
   - 检查 Info.plist 中的配置是否正确
   - 确认 Bundle ID 与 Line Developers Console 中的配置一致

2. **登录后没有回调**
   - 检查 AppDelegate 中的 URL 处理代码
   - 确认 LoginManager.shared.application() 被正确调用

3. **编译错误**
   - 确认已正确导入 LineSDK
   - 检查 Line SDK 版本是否兼容

## 注意事项

- URL Scheme 必须以 `line3rdp.` 开头
- Bundle ID 必须与 Line Developers Console 中的配置完全一致
- 确保在应用的主 target 中配置，而不是在插件中
- 建议在应用启动时就配置好 LoginManager

## 相关文档

- [Line SDK for iOS 官方文档](https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/)
- [Capacitor iOS 配置指南](https://capacitorjs.com/docs/ios/configuration) 