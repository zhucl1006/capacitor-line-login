# Line Login 插件初始化示例

## 基本初始化

```typescript
import { LineLogin } from 'aile-capacitor-line-login';

// 基本初始化
await LineLogin.initialize({
  channelId: 'your-line-channel-id'
});
```

## 完整配置初始化

```typescript
import { LineLogin } from 'aile-capacitor-line-login';

// 完整配置初始化
await LineLogin.initialize({
  channelId: 'your-line-channel-id',
  redirectUri: 'https://your-domain.com/callback',  // Web 端重定向 URI
  scope: ['profile', 'openid'],                     // 权限范围
  botPrompt: 'normal',                              // Bot 提示模式
  universalLinkURL: 'https://your-domain.com',     // iOS Universal Link
  debug: true                                       // 调试模式
});
```

## 错误处理

```typescript
import { LineLogin } from 'aile-capacitor-line-login';

try {
  await LineLogin.initialize({
    channelId: 'your-line-channel-id'
  });
  console.log('Line Login 初始化成功');
} catch (error) {
  console.error('Line Login 初始化失败:', error);
  
  // 常见错误类型：
  // - 'LineLoginConfig is required' - 配置参数为空
  // - 'channelId is required in LineLoginConfig' - 缺少 channelId
  // - 'channelId must be a non-empty string' - channelId 无效
  // - 'redirectUri must be a string' - redirectUri 类型错误
  // - 'scope must be an array' - scope 类型错误
  // - 'botPrompt must be a string' - botPrompt 类型错误
}
```

## 参数说明

### 必需参数

- **channelId** (string): Line Channel ID，从 LINE Developers Console 获取

### 可选参数

- **redirectUri** (string): Web 端 OAuth 重定向 URI
- **scope** (string[]): 权限范围，默认为 ['profile']
- **botPrompt** (string): Bot 提示模式
- **universalLinkURL** (string): iOS Universal Link URL
- **debug** (boolean): 是否启用调试模式

## 在不同平台上的注意事项

### Web 平台

```typescript
// Web 平台需要配置 redirectUri
await LineLogin.initialize({
  channelId: 'your-line-channel-id',
  redirectUri: 'https://your-domain.com/callback'
});
```

### iOS 平台

```typescript
// iOS 平台可以配置 Universal Link
await LineLogin.initialize({
  channelId: 'your-line-channel-id',
  universalLinkURL: 'https://your-domain.com'
});
```

### Android 平台

```typescript
// Android 平台基本配置即可
await LineLogin.initialize({
  channelId: 'your-line-channel-id'
});
```

## 完整使用流程

```typescript
import { LineLogin } from 'aile-capacitor-line-login';

async function initializeLineLogin() {
  try {
    // 1. 初始化插件
    await LineLogin.initialize({
      channelId: 'your-line-channel-id',
      scope: ['profile', 'openid'],
      debug: true
    });
    
    console.log('Line Login 初始化成功');
    
    // 2. 检查登录状态
    const { isLoggedIn } = await LineLogin.isLoggedIn();
    
    if (isLoggedIn) {
      console.log('用户已登录');
      
      // 3. 获取用户信息
      const profile = await LineLogin.getUserProfile();
      console.log('用户信息:', profile);
    } else {
      console.log('用户未登录');
    }
    
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

// 在应用启动时调用
initializeLineLogin();
```

## 最佳实践

1. **在应用启动时初始化**: 建议在应用的主入口文件中调用 `initialize()`
2. **错误处理**: 始终使用 try-catch 包装初始化调用
3. **参数验证**: 确保 channelId 是有效的字符串
4. **平台特定配置**: 根据目标平台配置相应的参数
5. **调试模式**: 开发时启用 debug 模式以获取更多日志信息

## 常见问题

### Q: 初始化失败怎么办？
A: 检查 channelId 是否正确，确保已在 LINE Developers Console 中正确配置。

### Q: 可以多次调用 initialize() 吗？
A: 可以，后续的调用会覆盖之前的配置。

### Q: 初始化后如何验证是否成功？
A: 可以调用其他方法（如 `isLoggedIn()`），如果没有抛出初始化错误，说明初始化成功。

### Q: 不同平台需要不同的配置吗？
A: 基本配置相同，但某些平台特定功能需要额外配置（如 Web 的 redirectUri）。 