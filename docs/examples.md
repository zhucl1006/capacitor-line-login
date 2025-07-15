# 示例代码

本文档提供了 Capacitor Line Login Plugin 的详细使用示例，涵盖各种使用场景和最佳实践。

## 目录

- [基础示例](#基础示例)
- [框架集成](#框架集成)
- [高级用法](#高级用法)
- [错误处理](#错误处理)
- [平台特定示例](#平台特定示例)

## 基础示例

### 1. 简单登录流程

```typescript
import { LineLogin } from 'capacitor-line-login';

class LineLoginService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await LineLogin.initialize({
        channelId: 'YOUR_CHANNEL_ID',
        scope: ['profile']
      });
      this.isInitialized = true;
      console.log('Line Login 初始化成功');
    } catch (error) {
      console.error('Line Login 初始化失败:', error);
      throw error;
    }
  }

  async login() {
    await this.initialize();

    try {
      const result = await LineLogin.login();
      console.log('登录成功:', result);
      
      // 保存用户信息到本地存储
      localStorage.setItem('lineAccessToken', result.accessToken);
      if (result.userProfile) {
        localStorage.setItem('lineUserProfile', JSON.stringify(result.userProfile));
      }
      
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await LineLogin.logout();
      
      // 清除本地存储
      localStorage.removeItem('lineAccessToken');
      localStorage.removeItem('lineUserProfile');
      
      console.log('登出成功');
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const profile = await LineLogin.getUserProfile();
      console.log('用户信息:', profile);
      return profile;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  async checkLoginStatus() {
    try {
      const status = await LineLogin.isLoggedIn();
      return status.isLoggedIn;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    }
  }
}

// 使用示例
const lineLoginService = new LineLoginService();

// 登录
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  try {
    const result = await lineLoginService.login();
    alert(`欢迎, ${result.userProfile?.displayName || '用户'}!`);
  } catch (error) {
    alert('登录失败，请重试');
  }
});

// 登出
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    await lineLoginService.logout();
    alert('已成功登出');
  } catch (error) {
    alert('登出失败');
  }
});
```

### 2. 带状态管理的登录

```typescript
import { LineLogin } from 'capacitor-line-login';

interface LoginState {
  isLoggedIn: boolean;
  user: any;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

class LineLoginManager {
  private state: LoginState = {
    isLoggedIn: false,
    user: null,
    accessToken: null,
    loading: false,
    error: null
  };

  private listeners: Array<(state: LoginState) => void> = [];

  constructor() {
    this.initialize();
  }

  subscribe(listener: (state: LoginState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private setState(updates: Partial<LoginState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  getState() {
    return this.state;
  }

  async initialize() {
    this.setState({ loading: true, error: null });

    try {
      await LineLogin.initialize({
        channelId: 'YOUR_CHANNEL_ID',
        scope: ['profile', 'openid']
      });

      // 检查是否已登录
      const status = await LineLogin.isLoggedIn();
      if (status.isLoggedIn) {
        const profile = await LineLogin.getUserProfile();
        this.setState({
          isLoggedIn: true,
          user: profile,
          loading: false
        });
      } else {
        this.setState({ loading: false });
      }
    } catch (error: any) {
      this.setState({
        loading: false,
        error: error.message || '初始化失败'
      });
    }
  }

  async login() {
    this.setState({ loading: true, error: null });

    try {
      const result = await LineLogin.login();
      
      this.setState({
        isLoggedIn: true,
        user: result.userProfile,
        accessToken: result.accessToken,
        loading: false
      });

      return result;
    } catch (error: any) {
      this.setState({
        loading: false,
        error: error.message || '登录失败'
      });
      throw error;
    }
  }

  async logout() {
    this.setState({ loading: true, error: null });

    try {
      await LineLogin.logout();
      
      this.setState({
        isLoggedIn: false,
        user: null,
        accessToken: null,
        loading: false
      });
    } catch (error: any) {
      this.setState({
        loading: false,
        error: error.message || '登出失败'
      });
      throw error;
    }
  }

  async refreshUserProfile() {
    if (!this.state.isLoggedIn) {
      throw new Error('用户未登录');
    }

    this.setState({ loading: true, error: null });

    try {
      const profile = await LineLogin.getUserProfile();
      this.setState({
        user: profile,
        loading: false
      });
      return profile;
    } catch (error: any) {
      this.setState({
        loading: false,
        error: error.message || '获取用户信息失败'
      });
      throw error;
    }
  }
}

// 使用示例
const loginManager = new LineLoginManager();

// 监听状态变化
const unsubscribe = loginManager.subscribe((state) => {
  console.log('登录状态变化:', state);
  
  // 更新UI
  updateUI(state);
});

function updateUI(state: LoginState) {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userInfo = document.getElementById('userInfo');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');

  if (loading) {
    loading.style.display = state.loading ? 'block' : 'none';
  }

  if (error) {
    error.textContent = state.error || '';
    error.style.display = state.error ? 'block' : 'none';
  }

  if (state.isLoggedIn && state.user) {
    loginBtn?.setAttribute('style', 'display: none');
    logoutBtn?.setAttribute('style', 'display: block');
    
    if (userInfo) {
      userInfo.innerHTML = `
        <h3>用户信息</h3>
        <p>姓名: ${state.user.displayName || '未知'}</p>
        <p>用户ID: ${state.user.userId}</p>
        ${state.user.pictureUrl ? `<img src="${state.user.pictureUrl}" alt="头像" width="50" height="50">` : ''}
      `;
    }
  } else {
    loginBtn?.setAttribute('style', 'display: block');
    logoutBtn?.setAttribute('style', 'display: none');
    
    if (userInfo) {
      userInfo.innerHTML = '';
    }
  }
}
```

## 框架集成

### React 集成

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LineLogin } from 'capacitor-line-login';

// 创建 Context
interface LineLoginContextType {
  isLoggedIn: boolean;
  user: any;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const LineLoginContext = createContext<LineLoginContextType | null>(null);

// Provider 组件
export const LineLoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeLineLogin();
  }, []);

  const initializeLineLogin = async () => {
    try {
      await LineLogin.initialize({
        channelId: process.env.REACT_APP_LINE_CHANNEL_ID!,
        scope: ['profile']
      });

      const status = await LineLogin.isLoggedIn();
      if (status.isLoggedIn) {
        const profile = await LineLogin.getUserProfile();
        setUser(profile);
        setIsLoggedIn(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await LineLogin.login();
      setUser(result.userProfile);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await LineLogin.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);

    try {
      const profile = await LineLogin.getUserProfile();
      setUser(profile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LineLoginContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        error,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </LineLoginContext.Provider>
  );
};

// Hook
export const useLineLogin = () => {
  const context = useContext(LineLoginContext);
  if (!context) {
    throw new Error('useLineLogin must be used within a LineLoginProvider');
  }
  return context;
};

// 使用示例组件
const LoginButton: React.FC = () => {
  const { isLoggedIn, user, loading, error, login, logout } = useLineLogin();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>错误: {error}</div>;
  }

  if (isLoggedIn && user) {
    return (
      <div>
        <h3>欢迎, {user.displayName}!</h3>
        {user.pictureUrl && (
          <img src={user.pictureUrl} alt="头像" width="50" height="50" />
        )}
        <button onClick={logout}>登出</button>
      </div>
    );
  }

  return <button onClick={login}>Line 登录</button>;
};

// App 组件
const App: React.FC = () => {
  return (
    <LineLoginProvider>
      <div>
        <h1>我的应用</h1>
        <LoginButton />
      </div>
    </LineLoginProvider>
  );
};

export default App;
```

### Vue 3 集成

```typescript
import { createApp, ref, reactive, provide, inject } from 'vue';
import { LineLogin } from 'capacitor-line-login';

// 创建 composable
export function useLineLogin() {
  const state = reactive({
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null
  });

  const initialize = async () => {
    state.loading = true;
    state.error = null;

    try {
      await LineLogin.initialize({
        channelId: import.meta.env.VITE_LINE_CHANNEL_ID,
        scope: ['profile']
      });

      const status = await LineLogin.isLoggedIn();
      if (status.isLoggedIn) {
        const profile = await LineLogin.getUserProfile();
        state.user = profile;
        state.isLoggedIn = true;
      }
    } catch (error) {
      state.error = error.message;
    } finally {
      state.loading = false;
    }
  };

  const login = async () => {
    state.loading = true;
    state.error = null;

    try {
      const result = await LineLogin.login();
      state.user = result.userProfile;
      state.isLoggedIn = true;
    } catch (error) {
      state.error = error.message;
    } finally {
      state.loading = false;
    }
  };

  const logout = async () => {
    state.loading = true;
    state.error = null;

    try {
      await LineLogin.logout();
      state.user = null;
      state.isLoggedIn = false;
    } catch (error) {
      state.error = error.message;
    } finally {
      state.loading = false;
    }
  };

  return {
    state,
    initialize,
    login,
    logout
  };
}

// Vue 组件
const LoginComponent = {
  setup() {
    const { state, initialize, login, logout } = useLineLogin();

    // 初始化
    initialize();

    return {
      state,
      login,
      logout
    };
  },
  template: `
    <div>
      <div v-if="state.loading">加载中...</div>
      <div v-else-if="state.error" style="color: red">错误: {{ state.error }}</div>
      <div v-else-if="state.isLoggedIn && state.user">
        <h3>欢迎, {{ state.user.displayName }}!</h3>
        <img v-if="state.user.pictureUrl" :src="state.user.pictureUrl" alt="头像" width="50" height="50">
        <button @click="logout">登出</button>
      </div>
      <button v-else @click="login">Line 登录</button>
    </div>
  `
};
```

### Angular 集成

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LineLogin } from 'capacitor-line-login';

interface LoginState {
  isLoggedIn: boolean;
  user: any;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LineLoginService {
  private stateSubject = new BehaviorSubject<LoginState>({
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null
  });

  public state$: Observable<LoginState> = this.stateSubject.asObservable();

  constructor() {
    this.initialize();
  }

  private setState(updates: Partial<LoginState>) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...updates });
  }

  async initialize() {
    this.setState({ loading: true, error: null });

    try {
      await LineLogin.initialize({
        channelId: 'YOUR_CHANNEL_ID',
        scope: ['profile']
      });

      const status = await LineLogin.isLoggedIn();
      if (status.isLoggedIn) {
        const profile = await LineLogin.getUserProfile();
        this.setState({
          isLoggedIn: true,
          user: profile,
          loading: false
        });
      } else {
        this.setState({ loading: false });
      }
    } catch (error: any) {
      this.setState({
        loading: false,
        error: error.message || '初始化失败'
      });
    }
  }

  async login() {
    this.setState({ loading: true, error: null });

    try {
      const result = await LineLogin.login();
      this.setState({
        isLoggedIn: true,
        user: result.userProfile,
        loading: false
      });
      return result;
    } catch (error: any) {
      this.setState({
        loading: false,
        error: error.message || '登录失败'
      });
      throw error;
    }
  }

  async logout() {
    this.setState({ loading: true, error: null });

    try {
      await LineLogin.logout();
      this.setState({
        isLoggedIn: false,
        user: null,
        loading: false
      });
    } catch (error: any) {
      this.setState({
        loading: false,
        error: error.message || '登出失败'
      });
      throw error;
    }
  }
}

// 组件
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-line-login',
  template: `
    <div>
      <div *ngIf="state.loading">加载中...</div>
      <div *ngIf="state.error" style="color: red">错误: {{ state.error }}</div>
      <div *ngIf="state.isLoggedIn && state.user">
        <h3>欢迎, {{ state.user.displayName }}!</h3>
        <img *ngIf="state.user.pictureUrl" [src]="state.user.pictureUrl" alt="头像" width="50" height="50">
        <button (click)="logout()">登出</button>
      </div>
      <button *ngIf="!state.isLoggedIn && !state.loading" (click)="login()">Line 登录</button>
    </div>
  `
})
export class LineLoginComponent implements OnInit, OnDestroy {
  state: LoginState = {
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null
  };

  private subscription: Subscription = new Subscription();

  constructor(private lineLoginService: LineLoginService) {}

  ngOnInit() {
    this.subscription.add(
      this.lineLoginService.state$.subscribe(state => {
        this.state = state;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async login() {
    try {
      await this.lineLoginService.login();
    } catch (error) {
      console.error('登录失败:', error);
    }
  }

  async logout() {
    try {
      await this.lineLoginService.logout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  }
}
```

## 高级用法

### 1. 令牌管理

```typescript
import { LineLogin } from 'capacitor-line-login';

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  async getValidToken(): Promise<string> {
    // 检查是否有有效令牌
    if (this.accessToken && this.expiresAt && Date.now() < this.expiresAt) {
      return this.accessToken;
    }

    // 尝试刷新令牌
    if (this.refreshToken) {
      try {
        const result = await LineLogin.refreshToken();
        if (result.accessToken) {
          this.accessToken = result.accessToken;
          this.refreshToken = result.refreshToken || this.refreshToken;
          this.expiresAt = result.expiresIn ? Date.now() + result.expiresIn * 1000 : null;
          return this.accessToken;
        }
      } catch (error) {
        console.warn('令牌刷新失败:', error);
      }
    }

    // 重新登录
    const loginResult = await LineLogin.login();
    this.accessToken = loginResult.accessToken;
    this.refreshToken = loginResult.refreshToken || null;
    this.expiresAt = loginResult.expiresIn ? Date.now() + loginResult.expiresIn * 1000 : null;

    return this.accessToken;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getValidToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }
}

// 使用示例
const tokenManager = new TokenManager();

// 调用需要认证的 API
async function getUserMessages() {
  try {
    const response = await tokenManager.makeAuthenticatedRequest(
      'https://api.line.me/v2/profile'
    );
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`API 调用失败: ${response.status}`);
    }
  } catch (error) {
    console.error('获取用户消息失败:', error);
    throw error;
  }
}
```

### 2. 多环境配置

```typescript
import { LineLogin } from 'capacitor-line-login';

interface EnvironmentConfig {
  channelId: string;
  redirectUri: string;
  scope: string[];
  debug: boolean;
}

class EnvironmentManager {
  private configs: Record<string, EnvironmentConfig> = {
    development: {
      channelId: 'DEV_CHANNEL_ID',
      redirectUri: 'http://localhost:3000/callback',
      scope: ['profile'],
      debug: true
    },
    staging: {
      channelId: 'STAGING_CHANNEL_ID',
      redirectUri: 'https://staging.yourdomain.com/callback',
      scope: ['profile'],
      debug: true
    },
    production: {
      channelId: 'PROD_CHANNEL_ID',
      redirectUri: 'https://yourdomain.com/callback',
      scope: ['profile', 'openid'],
      debug: false
    }
  };

  getCurrentEnvironment(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      } else if (hostname.includes('staging')) {
        return 'staging';
      }
    }
    return 'production';
  }

  getConfig(): EnvironmentConfig {
    const env = this.getCurrentEnvironment();
    const config = this.configs[env];
    
    if (!config) {
      throw new Error(`未找到环境配置: ${env}`);
    }

    return config;
  }

  async initialize() {
    const config = this.getConfig();
    
    console.log(`初始化 Line Login (${this.getCurrentEnvironment()})`, config);
    
    await LineLogin.initialize(config);
  }
}

// 使用示例
const envManager = new EnvironmentManager();

// 在应用启动时初始化
envManager.initialize().then(() => {
  console.log('Line Login 初始化完成');
}).catch(error => {
  console.error('Line Login 初始化失败:', error);
});
```

### 3. 错误重试机制

```typescript
import { LineLogin } from 'capacitor-line-login';

class RetryableLineLogin {
  private maxRetries = 3;
  private retryDelay = 1000; // 1秒

  async withRetry<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries,
    delay = this.retryDelay
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retries > 0 && this.shouldRetry(error)) {
        console.warn(`操作失败，${delay}ms 后重试. 剩余重试次数: ${retries}`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(operation, retries - 1, delay * 2);
      }
      
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // 网络错误或临时错误可以重试
    const retryableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'SERVER_ERROR',
      'RATE_LIMIT'
    ];
    
    return retryableErrors.includes(error.code);
  }

  async login() {
    return this.withRetry(async () => {
      return await LineLogin.login();
    });
  }

  async getUserProfile() {
    return this.withRetry(async () => {
      return await LineLogin.getUserProfile();
    });
  }

  async logout() {
    return this.withRetry(async () => {
      return await LineLogin.logout();
    });
  }
}

// 使用示例
const retryableLogin = new RetryableLineLogin();

// 带重试的登录
async function handleLogin() {
  try {
    const result = await retryableLogin.login();
    console.log('登录成功:', result);
  } catch (error) {
    console.error('登录失败（已重试）:', error);
    alert('登录失败，请检查网络连接后重试');
  }
}
```

## 错误处理

### 1. 全局错误处理器

```typescript
import { LineLogin } from 'capacitor-line-login';

interface ErrorHandler {
  (error: any): void;
}

class LineLoginErrorHandler {
  private errorHandlers: Record<string, ErrorHandler> = {};

  constructor() {
    this.setupDefaultHandlers();
  }

  private setupDefaultHandlers() {
    this.errorHandlers = {
      'INVALID_CHANNEL_ID': (error) => {
        console.error('Channel ID 配置错误:', error);
        alert('应用配置错误，请联系管理员');
      },
      
      'USER_CANCELLED': (error) => {
        console.log('用户取消登录');
        // 不显示错误消息，这是正常行为
      },
      
      'NETWORK_ERROR': (error) => {
        console.error('网络错误:', error);
        alert('网络连接失败，请检查网络后重试');
      },
      
      'AUTHENTICATION_FAILED': (error) => {
        console.error('认证失败:', error);
        alert('登录失败，请重试');
      },
      
      'TOKEN_EXPIRED': (error) => {
        console.error('令牌过期:', error);
        // 自动重新登录
        this.handleTokenExpired();
      },
      
      'USER_NOT_LOGGED_IN': (error) => {
        console.error('用户未登录:', error);
        // 重定向到登录页面
        this.redirectToLogin();
      },
      
      'PLATFORM_NOT_SUPPORTED': (error) => {
        console.error('平台不支持:', error);
        alert('当前平台不支持 Line 登录');
      }
    };
  }

  handleError(error: any) {
    const handler = this.errorHandlers[error.code];
    
    if (handler) {
      handler(error);
    } else {
      // 默认错误处理
      console.error('未知错误:', error);
      alert(`发生错误: ${error.message || '未知错误'}`);
    }
  }

  private async handleTokenExpired() {
    try {
      const result = await LineLogin.refreshToken();
      console.log('令牌刷新成功:', result);
    } catch (refreshError) {
      console.error('令牌刷新失败:', refreshError);
      this.redirectToLogin();
    }
  }

  private redirectToLogin() {
    // 实现重定向到登录页面的逻辑
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  registerHandler(errorCode: string, handler: ErrorHandler) {
    this.errorHandlers[errorCode] = handler;
  }
}

// 创建全局错误处理器
const errorHandler = new LineLoginErrorHandler();

// 包装 Line Login 方法
class SafeLineLogin {
  static async login() {
    try {
      return await LineLogin.login();
    } catch (error) {
      errorHandler.handleError(error);
      throw error;
    }
  }

  static async logout() {
    try {
      return await LineLogin.logout();
    } catch (error) {
      errorHandler.handleError(error);
      throw error;
    }
  }

  static async getUserProfile() {
    try {
      return await LineLogin.getUserProfile();
    } catch (error) {
      errorHandler.handleError(error);
      throw error;
    }
  }
}

// 使用示例
async function handleLogin() {
  try {
    const result = await SafeLineLogin.login();
    console.log('登录成功:', result);
  } catch (error) {
    // 错误已经被全局处理器处理
    console.log('登录流程结束');
  }
}
```

### 2. 错误恢复策略

```typescript
import { LineLogin } from 'capacitor-line-login';

class LineLoginRecovery {
  private recoveryStrategies: Record<string, () => Promise<any>> = {};

  constructor() {
    this.setupRecoveryStrategies();
  }

  private setupRecoveryStrategies() {
    this.recoveryStrategies = {
      'TOKEN_EXPIRED': async () => {
        console.log('尝试刷新令牌...');
        try {
          const result = await LineLogin.refreshToken();
          return result;
        } catch (refreshError) {
          console.log('令牌刷新失败，重新登录...');
          return await LineLogin.login();
        }
      },
      
      'PLUGIN_NOT_INITIALIZED': async () => {
        console.log('重新初始化插件...');
        await LineLogin.initialize({
          channelId: 'YOUR_CHANNEL_ID',
          scope: ['profile']
        });
        return true;
      },
      
      'NETWORK_ERROR': async () => {
        console.log('等待网络恢复...');
        await this.waitForNetwork();
        return true;
      }
    };
  }

  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    maxRecoveryAttempts = 2
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRecoveryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (attempt < maxRecoveryAttempts) {
          const recovery = this.recoveryStrategies[error.code];
          if (recovery) {
            console.log(`尝试恢复错误: ${error.code} (尝试 ${attempt + 1}/${maxRecoveryAttempts})`);
            try {
              await recovery();
              continue; // 重试操作
            } catch (recoveryError) {
              console.error('恢复失败:', recoveryError);
            }
          }
        }
        
        break; // 无法恢复或达到最大重试次数
      }
    }
    
    throw lastError;
  }

  private async waitForNetwork(): Promise<void> {
    return new Promise((resolve) => {
      const checkNetwork = () => {
        if (navigator.onLine) {
          resolve();
        } else {
          setTimeout(checkNetwork, 1000);
        }
      };
      checkNetwork();
    });
  }
}

// 使用示例
const recovery = new LineLoginRecovery();

async function robustLogin() {
  return recovery.executeWithRecovery(async () => {
    return await LineLogin.login();
  });
}

async function robustGetUserProfile() {
  return recovery.executeWithRecovery(async () => {
    return await LineLogin.getUserProfile();
  });
}
```

## 平台特定示例

### Web 平台

```typescript
import { LineLogin } from 'capacitor-line-login';

class WebLineLogin {
  private popup: Window | null = null;

  async initializeForWeb() {
    await LineLogin.initialize({
      channelId: 'YOUR_CHANNEL_ID',
      redirectUri: window.location.origin + '/line-callback',
      scope: ['profile', 'openid']
    });
  }

  async loginWithPopup() {
    try {
      // 在 Web 平台上，登录会打开新窗口
      const result = await LineLogin.login();
      
      // 处理登录结果
      if (result.userProfile) {
        this.handleLoginSuccess(result);
      }
      
      return result;
    } catch (error) {
      this.handleLoginError(error);
      throw error;
    }
  }

  private handleLoginSuccess(result: any) {
    // 存储用户信息
    sessionStorage.setItem('lineUser', JSON.stringify(result.userProfile));
    sessionStorage.setItem('lineAccessToken', result.accessToken);
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('lineLoginSuccess', {
      detail: result
    }));
  }

  private handleLoginError(error: any) {
    console.error('Line 登录失败:', error);
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('lineLoginError', {
      detail: error
    }));
  }

  // 处理回调页面
  static handleCallback() {
    // 这个方法应该在回调页面调用
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      console.error('Line 登录错误:', error);
      window.close();
      return;
    }

    if (code && state) {
      // 发送消息给父窗口
      if (window.opener) {
        window.opener.postMessage({
          type: 'LINE_LOGIN_CALLBACK',
          code,
          state
        }, window.location.origin);
      }
      
      window.close();
    }
  }
}

// 使用示例
const webLogin = new WebLineLogin();

// 初始化
webLogin.initializeForWeb();

// 监听登录事件
window.addEventListener('lineLoginSuccess', (event: any) => {
  console.log('登录成功:', event.detail);
  // 更新UI
});

window.addEventListener('lineLoginError', (event: any) => {
  console.error('登录失败:', event.detail);
  // 显示错误消息
});
```

### 移动端平台

```typescript
import { LineLogin } from 'capacitor-line-login';
import { Capacitor } from '@capacitor/core';

class MobileLineLogin {
  async initializeForMobile() {
    const platform = Capacitor.getPlatform();
    
    const config = {
      channelId: 'YOUR_CHANNEL_ID',
      scope: ['profile']
    };

    if (platform === 'android') {
      // Android 特定配置
      await this.setupAndroid(config);
    } else if (platform === 'ios') {
      // iOS 特定配置
      await this.setupIOS(config);
    }

    await LineLogin.initialize(config);
  }

  private async setupAndroid(config: any) {
    // Android 特定设置
    console.log('设置 Android 配置');
    
    // 检查是否安装了 Line 应用
    const hasLineApp = await this.checkLineApp();
    if (hasLineApp) {
      console.log('检测到 Line 应用，将使用应用内登录');
    } else {
      console.log('未检测到 Line 应用，将使用 Web 登录');
    }
  }

  private async setupIOS(config: any) {
    // iOS 特定设置
    console.log('设置 iOS 配置');
    
    // 检查是否安装了 Line 应用
    const hasLineApp = await this.checkLineApp();
    if (hasLineApp) {
      console.log('检测到 Line 应用，将使用应用内登录');
    } else {
      console.log('未检测到 Line 应用，将使用 Web 登录');
    }
  }

  private async checkLineApp(): Promise<boolean> {
    // 这里应该实现检查 Line 应用是否安装的逻辑
    // 在实际实现中，可能需要使用其他插件来检查
    return true; // 假设已安装
  }

  async loginWithNativeApp() {
    try {
      const result = await LineLogin.login();
      
      // 移动端登录成功后的处理
      await this.handleMobileLoginSuccess(result);
      
      return result;
    } catch (error) {
      await this.handleMobileLoginError(error);
      throw error;
    }
  }

  private async handleMobileLoginSuccess(result: any) {
    // 存储到设备安全存储
    if (Capacitor.isPluginAvailable('Storage')) {
      const { Storage } = await import('@capacitor/storage');
      
      await Storage.set({
        key: 'lineUser',
        value: JSON.stringify(result.userProfile)
      });
      
      await Storage.set({
        key: 'lineAccessToken',
        value: result.accessToken
      });
    }

    // 发送本地通知（如果需要）
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [{
          title: '登录成功',
          body: `欢迎, ${result.userProfile?.displayName || '用户'}!`,
          id: 1
        }]
      });
    }
  }

  private async handleMobileLoginError(error: any) {
    console.error('移动端登录失败:', error);
    
    // 显示原生提示
    if (Capacitor.isPluginAvailable('Dialog')) {
      const { Dialog } = await import('@capacitor/dialog');
      
      await Dialog.alert({
        title: '登录失败',
        message: error.message || '请重试'
      });
    }
  }
}

// 使用示例
const mobileLogin = new MobileLineLogin();

// 在应用启动时初始化
mobileLogin.initializeForMobile().then(() => {
  console.log('移动端 Line Login 初始化完成');
});
```

## 测试示例

### 单元测试

```typescript
import { LineLogin } from 'capacitor-line-login';

// Mock LineLogin
jest.mock('capacitor-line-login', () => ({
  LineLogin: {
    initialize: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getUserProfile: jest.fn(),
    isLoggedIn: jest.fn(),
    refreshToken: jest.fn(),
    echo: jest.fn()
  }
}));

describe('LineLoginService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize successfully', async () => {
    (LineLogin.initialize as jest.Mock).mockResolvedValue(undefined);

    const service = new LineLoginService();
    await service.initialize();

    expect(LineLogin.initialize).toHaveBeenCalledWith({
      channelId: 'YOUR_CHANNEL_ID',
      scope: ['profile']
    });
  });

  test('should login successfully', async () => {
    const mockResult = {
      accessToken: 'mock-token',
      userProfile: {
        userId: 'user123',
        displayName: 'Test User'
      }
    };

    (LineLogin.login as jest.Mock).mockResolvedValue(mockResult);

    const service = new LineLoginService();
    const result = await service.login();

    expect(result).toEqual(mockResult);
    expect(LineLogin.login).toHaveBeenCalled();
  });

  test('should handle login error', async () => {
    const mockError = new Error('Login failed');
    (LineLogin.login as jest.Mock).mockRejectedValue(mockError);

    const service = new LineLoginService();
    
    await expect(service.login()).rejects.toThrow('Login failed');
  });

  test('should logout successfully', async () => {
    (LineLogin.logout as jest.Mock).mockResolvedValue(undefined);

    const service = new LineLoginService();
    await service.logout();

    expect(LineLogin.logout).toHaveBeenCalled();
  });

  test('should get user profile', async () => {
    const mockProfile = {
      userId: 'user123',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/avatar.jpg'
    };

    (LineLogin.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

    const service = new LineLoginService();
    const profile = await service.getUserProfile();

    expect(profile).toEqual(mockProfile);
    expect(LineLogin.getUserProfile).toHaveBeenCalled();
  });

  test('should check login status', async () => {
    (LineLogin.isLoggedIn as jest.Mock).mockResolvedValue({ isLoggedIn: true });

    const service = new LineLoginService();
    const isLoggedIn = await service.checkLoginStatus();

    expect(isLoggedIn).toBe(true);
    expect(LineLogin.isLoggedIn).toHaveBeenCalled();
  });
});
```

### 集成测试

```typescript
import { LineLogin } from 'capacitor-line-login';

describe('Line Login Integration', () => {
  beforeAll(async () => {
    // 初始化插件
    await LineLogin.initialize({
      channelId: process.env.TEST_CHANNEL_ID || 'test-channel-id',
      scope: ['profile']
    });
  });

  test('should echo message', async () => {
    const message = 'Hello World';
    const result = await LineLogin.echo({ value: message });
    
    expect(result.value).toBe(message);
  });

  test('should handle invalid configuration', async () => {
    await expect(LineLogin.initialize({
      channelId: '', // 无效的 channel ID
      scope: ['profile']
    })).rejects.toThrow();
  });

  // 注意：以下测试需要真实的 Line 账号和手动操作
  test.skip('should login with real account', async () => {
    const result = await LineLogin.login();
    
    expect(result.accessToken).toBeDefined();
    expect(result.userProfile).toBeDefined();
    expect(result.userProfile.userId).toBeDefined();
  });
});
```

这些示例展示了如何在各种场景下使用 Capacitor Line Login Plugin，包括基础用法、框架集成、高级功能、错误处理和测试。根据您的具体需求选择合适的示例进行参考和修改。 