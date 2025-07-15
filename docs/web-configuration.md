# Web 平台配置指南

本指南详细说明如何在 Web 平台上配置和集成 Line Login Plugin。

## 前提条件

- 现代浏览器支持（Chrome 88+, Firefox 78+, Safari 14+, Edge 88+）
- HTTPS 协议（生产环境必须，本地开发可以使用 HTTP）
- 有效的 Line Developer Channel ID
- 正确配置的 Callback URL

## 配置步骤

### 1. Line Developers Console 配置

#### 1.1 创建 Line Login Channel

1. 访问 [Line Developers Console](https://developers.line.biz/console/)
2. 选择或创建一个 Provider
3. 创建新的 Channel，选择 "Line Login"
4. 填写基本信息：
   - Channel name: 您的应用名称
   - Channel description: 应用描述
   - App type: Web app

#### 1.2 配置 Callback URL

在 Line Login 设置中配置 Callback URL：

```
开发环境:
- http://localhost:3000/line-callback
- http://localhost:8100/line-callback (Ionic 默认端口)

生产环境:
- https://yourdomain.com/line-callback
- https://app.yourdomain.com/line-callback
```

**重要**: 
- 生产环境必须使用 HTTPS
- Callback URL 必须与实际的重定向 URL 完全匹配
- 支持多个 Callback URL，每行一个

#### 1.3 配置权限范围

在 "Scopes" 部分选择需要的权限：

- `profile`: 获取用户基本信息（必需）
- `openid`: OpenID Connect 支持
- `email`: 获取用户邮箱地址（如果可用）

### 2. 应用配置

#### 2.1 基本初始化

```typescript
import { LineLogin } from 'capacitor-line-login';

// 基本配置
await LineLogin.initialize({
  channelId: 'YOUR_LINE_CHANNEL_ID',
  redirectUri: 'https://yourdomain.com/line-callback',
  scope: ['profile', 'openid']
});
```

#### 2.2 开发环境配置

```typescript
// 开发环境配置
const isDevelopment = process.env.NODE_ENV === 'development';

await LineLogin.initialize({
  channelId: isDevelopment ? 'DEV_CHANNEL_ID' : 'PROD_CHANNEL_ID',
  redirectUri: isDevelopment 
    ? 'http://localhost:3000/line-callback'
    : 'https://yourdomain.com/line-callback',
  scope: ['profile'],
  debug: isDevelopment
});
```

#### 2.3 生产环境配置

```typescript
// 生产环境配置
await LineLogin.initialize({
  channelId: 'YOUR_PRODUCTION_CHANNEL_ID',
  redirectUri: 'https://yourdomain.com/line-callback',
  scope: ['profile', 'openid'],
  botPrompt: 'normal' // 或 'aggressive'
});
```

### 3. 回调处理

#### 3.1 创建回调页面

创建一个专门的回调页面来处理 Line Login 的重定向：

```html
<!-- line-callback.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Line Login Callback</title>
</head>
<body>
    <div id="loading">正在处理登录...</div>
    
    <script>
        // 处理回调参数
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
            console.error('Line Login Error:', error);
            // 重定向到错误页面或显示错误信息
            window.location.href = '/login?error=' + encodeURIComponent(error);
        } else if (code && state) {
            // 将授权码传递给主应用
            if (window.opener) {
                window.opener.postMessage({
                    type: 'LINE_LOGIN_CALLBACK',
                    code: code,
                    state: state
                }, '*');
                window.close();
            } else {
                // 如果没有 opener，重定向到主应用
                window.location.href = '/login?code=' + encodeURIComponent(code) + '&state=' + encodeURIComponent(state);
            }
        } else {
            console.error('Invalid callback parameters');
            window.location.href = '/login?error=invalid_callback';
        }
    </script>
</body>
</html>
```

#### 3.2 处理回调消息

在主应用中监听回调消息：

```typescript
// 监听回调消息
window.addEventListener('message', (event) => {
    if (event.data.type === 'LINE_LOGIN_CALLBACK') {
        const { code, state } = event.data;
        
        // 验证 state 参数
        const expectedState = sessionStorage.getItem('line_state');
        if (state !== expectedState) {
            console.error('State mismatch');
            return;
        }
        
        // 处理授权码
        handleAuthorizationCode(code);
    }
});

async function handleAuthorizationCode(code: string) {
    try {
        // 使用授权码换取访问令牌
        const result = await exchangeCodeForToken(code);
        
        // 获取用户信息
        const userProfile = await LineLogin.getUserProfile();
        
        // 处理登录成功
        console.log('登录成功:', userProfile);
        
    } catch (error) {
        console.error('登录失败:', error);
    }
}
```

### 4. 高级配置

#### 4.1 PKCE (Proof Key for Code Exchange) 支持

插件自动支持 PKCE，无需额外配置：

```typescript
// PKCE 自动启用，增强安全性
await LineLogin.initialize({
    channelId: 'YOUR_CHANNEL_ID',
    redirectUri: 'https://yourdomain.com/line-callback',
    scope: ['profile']
});

// 登录时自动生成 code_verifier 和 code_challenge
await LineLogin.login();
```

#### 4.2 状态管理

```typescript
// 自定义状态管理
class LineLoginManager {
    private static instance: LineLoginManager;
    private isInitialized = false;
    
    static getInstance(): LineLoginManager {
        if (!LineLoginManager.instance) {
            LineLoginManager.instance = new LineLoginManager();
        }
        return LineLoginManager.instance;
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        await LineLogin.initialize({
            channelId: process.env.REACT_APP_LINE_CHANNEL_ID!,
            redirectUri: `${window.location.origin}/line-callback`,
            scope: ['profile']
        });
        
        this.isInitialized = true;
    }
    
    async login() {
        await this.initialize();
        return await LineLogin.login();
    }
    
    async logout() {
        await LineLogin.logout();
        this.isInitialized = false;
    }
}
```

#### 4.3 错误处理

```typescript
// 完整的错误处理
async function handleLineLogin() {
    try {
        await LineLogin.initialize({
            channelId: 'YOUR_CHANNEL_ID',
            redirectUri: 'https://yourdomain.com/line-callback',
            scope: ['profile']
        });
        
        const result = await LineLogin.login();
        console.log('登录成功:', result);
        
    } catch (error: any) {
        switch (error.code) {
            case 'INVALID_CHANNEL_ID':
                console.error('无效的 Channel ID');
                break;
            case 'INVALID_REDIRECT_URI':
                console.error('无效的重定向 URI');
                break;
            case 'USER_CANCELLED':
                console.log('用户取消登录');
                break;
            case 'NETWORK_ERROR':
                console.error('网络错误');
                break;
            default:
                console.error('登录失败:', error.message);
        }
    }
}
```

### 5. 框架集成

#### 5.1 React 集成

```typescript
// useLineLogin.ts
import { useState, useEffect } from 'react';
import { LineLogin } from 'capacitor-line-login';

export function useLineLogin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        initializeLineLogin();
    }, []);
    
    const initializeLineLogin = async () => {
        try {
            await LineLogin.initialize({
                channelId: process.env.REACT_APP_LINE_CHANNEL_ID!,
                redirectUri: `${window.location.origin}/line-callback`,
                scope: ['profile']
            });
            
            const loginStatus = await LineLogin.isLoggedIn();
            setIsLoggedIn(loginStatus.isLoggedIn);
            
            if (loginStatus.isLoggedIn) {
                const userProfile = await LineLogin.getUserProfile();
                setUser(userProfile);
            }
        } catch (error) {
            console.error('初始化失败:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const login = async () => {
        try {
            setLoading(true);
            await LineLogin.login();
            // 登录成功后重新检查状态
            await initializeLineLogin();
        } catch (error) {
            console.error('登录失败:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const logout = async () => {
        try {
            await LineLogin.logout();
            setIsLoggedIn(false);
            setUser(null);
        } catch (error) {
            console.error('登出失败:', error);
        }
    };
    
    return {
        isLoggedIn,
        user,
        loading,
        login,
        logout
    };
}
```

#### 5.2 Vue 集成

```typescript
// lineLogin.composable.ts
import { ref, onMounted } from 'vue';
import { LineLogin } from 'capacitor-line-login';

export function useLineLogin() {
    const isLoggedIn = ref(false);
    const user = ref(null);
    const loading = ref(true);
    
    onMounted(async () => {
        await initializeLineLogin();
    });
    
    const initializeLineLogin = async () => {
        try {
            await LineLogin.initialize({
                channelId: import.meta.env.VITE_LINE_CHANNEL_ID,
                redirectUri: `${window.location.origin}/line-callback`,
                scope: ['profile']
            });
            
            const loginStatus = await LineLogin.isLoggedIn();
            isLoggedIn.value = loginStatus.isLoggedIn;
            
            if (loginStatus.isLoggedIn) {
                const userProfile = await LineLogin.getUserProfile();
                user.value = userProfile;
            }
        } catch (error) {
            console.error('初始化失败:', error);
        } finally {
            loading.value = false;
        }
    };
    
    const login = async () => {
        try {
            loading.value = true;
            await LineLogin.login();
            await initializeLineLogin();
        } catch (error) {
            console.error('登录失败:', error);
        } finally {
            loading.value = false;
        }
    };
    
    const logout = async () => {
        try {
            await LineLogin.logout();
            isLoggedIn.value = false;
            user.value = null;
        } catch (error) {
            console.error('登出失败:', error);
        }
    };
    
    return {
        isLoggedIn,
        user,
        loading,
        login,
        logout
    };
}
```

#### 5.3 Angular 集成

```typescript
// line-login.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LineLogin } from 'capacitor-line-login';

@Injectable({
  providedIn: 'root'
})
export class LineLoginService {
    private isLoggedInSubject = new BehaviorSubject<boolean>(false);
    private userSubject = new BehaviorSubject<any>(null);
    
    public isLoggedIn$ = this.isLoggedInSubject.asObservable();
    public user$ = this.userSubject.asObservable();
    
    async initialize() {
        try {
            await LineLogin.initialize({
                channelId: environment.lineChannelId,
                redirectUri: `${window.location.origin}/line-callback`,
                scope: ['profile']
            });
            
            const loginStatus = await LineLogin.isLoggedIn();
            this.isLoggedInSubject.next(loginStatus.isLoggedIn);
            
            if (loginStatus.isLoggedIn) {
                const userProfile = await LineLogin.getUserProfile();
                this.userSubject.next(userProfile);
            }
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }
    
    async login() {
        try {
            await LineLogin.login();
            await this.initialize();
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        }
    }
    
    async logout() {
        try {
            await LineLogin.logout();
            this.isLoggedInSubject.next(false);
            this.userSubject.next(null);
        } catch (error) {
            console.error('登出失败:', error);
            throw error;
        }
    }
}
```

## 安全考虑

### 1. HTTPS 要求

```typescript
// 检查 HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    throw new Error('Line Login requires HTTPS in production');
}
```

### 2. 状态验证

```typescript
// 验证状态参数
const generateState = () => {
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('line_state', state);
    return state;
};

const validateState = (receivedState: string) => {
    const expectedState = sessionStorage.getItem('line_state');
    sessionStorage.removeItem('line_state');
    return receivedState === expectedState;
};
```

### 3. 内容安全策略 (CSP)

```html
<!-- 添加 CSP 头部 -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    connect-src 'self' https://access.line.me https://api.line.me;
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
">
```

## 性能优化

### 1. 懒加载

```typescript
// 懒加载 Line Login
const loadLineLogin = async () => {
    const { LineLogin } = await import('capacitor-line-login');
    return LineLogin;
};
```

### 2. 预加载

```typescript
// 预加载 Line Login 资源
const preloadLineLogin = () => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = 'https://access.line.me';
    document.head.appendChild(link);
};
```

## 常见问题

### 配置问题

**Q: 回调 URL 不匹配**
A: 确保 Line Developers Console 中配置的 Callback URL 与代码中的 `redirectUri` 完全匹配。

**Q: CORS 错误**
A: Line Login 使用重定向流程，不会出现 CORS 问题。如果出现，检查是否正确配置了回调处理。

**Q: 状态不匹配**
A: 确保在登录过程中正确保存和验证 state 参数。

### 运行时问题

**Q: 登录弹窗被阻止**
A: 确保登录是由用户交互触发的，不是自动触发的。

**Q: 回调页面无法访问**
A: 确保回调页面可以正常访问，并且路径配置正确。

## 测试

### 1. 本地测试

```typescript
// 本地测试配置
const testConfig = {
    channelId: 'TEST_CHANNEL_ID',
    redirectUri: 'http://localhost:3000/line-callback',
    scope: ['profile'],
    debug: true
};
```

### 2. 端到端测试

```typescript
// E2E 测试示例
describe('Line Login', () => {
    it('should login successfully', async () => {
        await page.goto('http://localhost:3000');
        await page.click('#line-login-button');
        
        // 等待重定向到 Line
        await page.waitForURL(/access\.line\.me/);
        
        // 填写登录信息
        await page.fill('#email', 'test@example.com');
        await page.fill('#password', 'password');
        await page.click('#login-button');
        
        // 等待重定向回应用
        await page.waitForURL('http://localhost:3000/line-callback');
        
        // 验证登录状态
        const isLoggedIn = await page.evaluate(() => {
            return window.localStorage.getItem('line_access_token') !== null;
        });
        
        expect(isLoggedIn).toBe(true);
    });
});
```

## 下一步

- 查看 [初始化示例](initialization-example.md) 了解完整的初始化流程
- 阅读 [使用指南](usage-guide.md) 了解所有 API 使用方法
- 参考 [故障排除指南](troubleshooting.md) 解决常见问题
- 查看 [API 参考](api-reference.md) 了解详细的 API 文档 