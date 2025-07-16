# 故障排除指南

本文档提供了使用 Capacitor Line Login Plugin 时可能遇到的常见问题和解决方案。

## 目录

- [安装问题](#安装问题)
- [配置问题](#配置问题)
- [登录问题](#登录问题)
- [平台特定问题](#平台特定问题)
- [网络问题](#网络问题)
- [调试技巧](#调试技巧)

## 安装问题

### 1. npm 安装失败

**问题**: 运行 `npm install aile-capacitor-line-login` 时出错

**可能原因**:
- 网络连接问题
- npm 权限问题
- 版本冲突

**解决方案**:
```bash
# 清除 npm 缓存
npm cache clean --force

# 使用 yarn 替代 npm
yarn add aile-capacitor-line-login

# 或者使用 npm 的备用源
npm install aile-capacitor-line-login --registry https://registry.npm.taobao.org
```

### 2. Capacitor 同步失败

**问题**: 运行 `npx cap sync` 时出错

**可能原因**:
- Capacitor 版本不兼容
- 平台配置问题

**解决方案**:
```bash
# 检查 Capacitor 版本
npx cap doctor

# 更新 Capacitor
npm update @capacitor/core @capacitor/cli

# 重新同步
npx cap sync
```

## 配置问题

### 1. Channel ID 无效

**错误**: `INVALID_CHANNEL_ID`

**原因**: Channel ID 配置错误或未设置

**解决方案**:
1. 检查 Line Developers Console 中的 Channel ID
2. 确保 Channel ID 是字符串格式
3. 验证 Channel ID 没有额外的空格或特殊字符

```typescript
// 正确的配置
await LineLogin.initialize({
  channelId: '1234567890', // 确保是字符串
  scope: ['profile']
});
```

### 2. 重定向 URI 配置错误

**错误**: `INVALID_REDIRECT_URI`

**原因**: 重定向 URI 与 Line Console 配置不匹配

**解决方案**:
1. 检查 Line Developers Console 中的 Callback URL 设置
2. 确保 Web 和移动端的重定向 URI 正确配置

```typescript
// Web 平台
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  redirectUri: 'https://yourdomain.com/callback', // 必须与 Console 配置一致
  scope: ['profile']
});
```

## 登录问题

### 1. 用户取消登录

**错误**: `USER_CANCELLED`

**原因**: 用户在登录过程中取消了操作

**解决方案**:
```typescript
try {
  const result = await LineLogin.login();
  // 处理登录成功
} catch (error) {
  if (error.code === 'USER_CANCELLED') {
    console.log('用户取消了登录');
    // 不需要显示错误消息
  } else {
    console.error('登录失败:', error);
  }
}
```

### 2. 认证失败

**错误**: `AUTHENTICATION_FAILED`

**原因**: 
- 网络问题
- 服务器配置问题
- 用户账号问题

**解决方案**:
1. 检查网络连接
2. 验证 Line Console 配置
3. 尝试重新登录
4. 检查 Line 服务状态

## 平台特定问题

### Android 问题

#### 1. AndroidManifest.xml 配置错误

**问题**: Android 应用无法启动或登录失败

**解决方案**:
检查 `android/app/src/main/AndroidManifest.xml` 文件：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application>
    <!-- 添加 Line Login Activity -->
    <activity
      android:name="com.linecorp.linesdk.auth.LineAuthenticationActivity"
      android:exported="true"
      android:launchMode="singleTop"
      android:theme="@android:style/Theme.Translucent.NoTitleBar" />
  </application>
</manifest>
```

### iOS 问题

#### 1. Info.plist 配置错误

**问题**: iOS 应用无法启动或登录失败

**解决方案**:
检查 `ios/App/App/Info.plist` 文件：

```xml
<dict>
  <!-- 添加 URL Scheme -->
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
</dict>
```

## 网络问题

### 1. 网络超时

**问题**: 请求超时错误

**解决方案**:
```typescript
// 实现重试机制
async function loginWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await LineLogin.login();
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' && i < maxRetries - 1) {
        console.log(`重试登录 (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

## 调试技巧

### 1. 启用调试模式

```typescript
await LineLogin.initialize({
  channelId: 'YOUR_CHANNEL_ID',
  scope: ['profile'],
  debug: true // 启用调试模式
});
```

### 2. 检查插件状态

```typescript
// 检查插件是否正确安装
try {
  const result = await LineLogin.echo({ value: 'test' });
  console.log('插件工作正常:', result);
} catch (error) {
  console.error('插件安装有问题:', error);
}
```

## 常见错误代码

| 错误代码 | 描述 | 解决方案 |
|---------|------|----------|
| INVALID_CHANNEL_ID | Channel ID 无效 | 检查 Line Console 配置 |
| INVALID_REDIRECT_URI | 重定向 URI 无效 | 检查 Callback URL 配置 |
| USER_CANCELLED | 用户取消登录 | 正常行为，无需处理 |
| NETWORK_ERROR | 网络错误 | 检查网络连接，实现重试 |
| AUTHENTICATION_FAILED | 认证失败 | 检查配置，重新登录 |
| TOKEN_EXPIRED | 令牌过期 | 刷新令牌或重新登录 |
| USER_NOT_LOGGED_IN | 用户未登录 | 提示用户登录 |
| PLATFORM_NOT_SUPPORTED | 平台不支持 | 检查平台兼容性 |

## 获取帮助

如果以上解决方案都无法解决您的问题，请：

1. **检查文档**: 查看 [API 参考文档](api-reference.md) 和 [使用指南](usage-guide.md)
2. **搜索已知问题**: 在 GitHub Issues 中搜索相似问题
3. **提交问题**: 在 GitHub 仓库中创建新的 Issue，包含：
   - 详细的错误描述
   - 完整的错误日志
   - 环境信息（平台、版本等）
   - 重现步骤
   - 相关代码片段

4. **联系支持**: 如果是紧急问题，可以联系技术支持 