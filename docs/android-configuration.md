# Android 平台配置指南

本指南详细说明如何在 Android 平台上配置和集成 Line Login Plugin。

## 前提条件

- Android API Level 21 (Android 5.0) 或更高
- Android Studio 4.0 或更高版本
- Gradle 7.0 或更高版本
- 有效的 Line Developer Channel ID

## 配置步骤

### 1. 依赖配置

插件会自动添加必要的依赖，但您可以在 `android/app/build.gradle` 中验证：

```gradle
dependencies {
    implementation 'com.linecorp.linesdk:linesdk:5.11.1'
    // 其他依赖...
}
```

### 2. AndroidManifest.xml 配置

在 `android/app/src/main/AndroidManifest.xml` 中添加以下配置：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
        
        <!-- Line Channel ID 配置 -->
        <meta-data
            android:name="com.linecorp.linesdk.ChannelId"
            android:value="@string/line_channel_id" />
        
        <!-- Line Login Activity -->
        <activity
            android:name="com.linecorp.linesdk.auth.LineAuthActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@android:style/Theme.Translucent.NoTitleBar" />
            
        <!-- 您的主 Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 3. 字符串资源配置

在 `android/app/src/main/res/values/strings.xml` 中添加：

```xml
<resources>
    <string name="app_name">您的应用名称</string>
    <string name="line_channel_id">YOUR_LINE_CHANNEL_ID</string>
</resources>
```

**重要**: 将 `YOUR_LINE_CHANNEL_ID` 替换为您从 Line Developers Console 获取的实际 Channel ID。

### 4. Proguard 配置（如果使用代码混淆）

如果您的应用使用了代码混淆，在 `android/app/proguard-rules.pro` 中添加：

```proguard
# Line SDK
-keep class com.linecorp.linesdk.** { *; }
-dontwarn com.linecorp.linesdk.**

# Capacitor Line Login Plugin
-keep class com.aile.plugins.linelogin.** { *; }
-dontwarn com.aile.plugins.linelogin.**
```

### 5. 网络安全配置（可选）

如果您的应用需要额外的网络安全配置，在 `android/app/src/main/res/xml/network_security_config.xml` 中添加：

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">access.line.me</domain>
        <domain includeSubdomains="true">api.line.me</domain>
    </domain-config>
</network-security-config>
```

然后在 `AndroidManifest.xml` 的 `<application>` 标签中添加：

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... >
```

## 高级配置

### 1. 自定义主题

您可以为 Line Login Activity 创建自定义主题：

```xml
<!-- android/app/src/main/res/values/styles.xml -->
<resources>
    <style name="LineLoginTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="android:windowBackground">@color/line_green</item>
        <item name="android:statusBarColor">@color/line_green_dark</item>
    </style>
</resources>
```

然后在 `AndroidManifest.xml` 中应用：

```xml
<activity
    android:name="com.linecorp.linesdk.auth.LineAuthActivity"
    android:theme="@style/LineLoginTheme" />
```

### 2. 多环境配置

对于不同的构建变体（如 debug、staging、production），您可以创建不同的配置：

```
android/app/src/debug/res/values/strings.xml
android/app/src/staging/res/values/strings.xml  
android/app/src/release/res/values/strings.xml
```

每个文件包含对应环境的 Channel ID：

```xml
<!-- debug 环境 -->
<resources>
    <string name="line_channel_id">DEBUG_CHANNEL_ID</string>
</resources>

<!-- production 环境 -->
<resources>
    <string name="line_channel_id">PRODUCTION_CHANNEL_ID</string>
</resources>
```

### 3. 权限处理

虽然 Line Login 不需要特殊权限，但您可能需要处理网络状态：

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 测试配置

### 1. 调试模式

在开发过程中，您可以启用调试日志：

```java
// 在 MainActivity.java 中
import com.linecorp.linesdk.LineApiClient;
import com.linecorp.linesdk.LineApiClientBuilder;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 启用调试模式
        if (BuildConfig.DEBUG) {
            LineApiClientBuilder.setLogLevel(Log.DEBUG);
        }
    }
}
```

### 2. 模拟器测试

Line Login 在 Android 模拟器上可能有限制。建议使用真实设备进行测试。

如果必须在模拟器上测试，确保：
- 模拟器安装了 Google Play Services
- 模拟器连接到互联网
- 模拟器的 API Level 为 21 或更高

## 常见问题

### 构建问题

**Q: 构建时出现 "Duplicate class" 错误**
A: 检查是否有重复的依赖项，运行 `./gradlew app:dependencies` 查看依赖树。

**Q: 无法找到 Line SDK 类**
A: 确保在 `build.gradle` 中正确添加了 Line SDK 依赖。

### 运行时问题

**Q: 登录时应用崩溃**
A: 检查 `AndroidManifest.xml` 中的配置是否正确，特别是 Channel ID 和 Activity 配置。

**Q: 回调不工作**
A: 确保 `LineAuthActivity` 的 `launchMode` 设置为 `singleTop`。

**Q: 网络请求失败**
A: 检查网络权限和网络安全配置。

### 配置问题

**Q: Channel ID 无效**
A: 确保 Channel ID 来自 Line Developers Console，并且没有额外的空格或特殊字符。

**Q: 签名不匹配**
A: 确保应用签名与 Line Developers Console 中配置的签名一致。

## 性能优化

### 1. 减少 APK 大小

如果您只需要特定功能，可以排除不必要的依赖：

```gradle
dependencies {
    implementation('com.linecorp.linesdk:linesdk:5.11.1') {
        exclude group: 'com.google.android.gms', module: 'play-services-base'
    }
}
```

### 2. 启动优化

为了优化应用启动时间，可以延迟初始化 Line SDK：

```java
// 在适当的时机初始化，而不是在 onCreate 中
private void initializeLineSDK() {
    // Line SDK 初始化逻辑
}
```

## 安全考虑

1. **Channel Secret 保护**: 永远不要在客户端代码中硬编码 Channel Secret
2. **证书固定**: 考虑实现证书固定以增强安全性
3. **代码混淆**: 在发布版本中启用代码混淆
4. **权限最小化**: 只请求必要的权限

## 下一步

- 查看 [初始化示例](initialization-example.md) 了解如何在代码中使用插件
- 阅读 [使用指南](usage-guide.md) 了解完整的 API 使用方法
- 参考 [故障排除指南](troubleshooting.md) 解决常见问题 