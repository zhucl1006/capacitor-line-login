import { WebPlugin } from '@capacitor/core';

import type { 
  LineLoginPlugin, 
  LineLoginConfig, 
  LoginOptions, 
  LoginResult, 
  UserProfile, 
  TokenResult 
} from './definitions';

export class LineLoginWeb extends WebPlugin implements LineLoginPlugin {
  private config: LineLoginConfig | null = null;
  private currentUser: UserProfile | null = null;
  private accessToken: string | null = null;
  private isInitialized = false;
  private readonly CONFIG_STORAGE_KEY = 'line_login_config';

  constructor() {
    super();
    // 尝试从localStorage恢复配置
    this.loadConfig();
  }

  private debugLog(...args: any[]): void {
    if (this.config?.debug) {
      console.log(...args);
    }
  }

  private debugWarn(...args: any[]): void {
    if (this.config?.debug) {
      console.warn(...args);
    }
  }

  private saveConfig(): void {
    if (this.config) {
      try {
        localStorage.setItem(this.CONFIG_STORAGE_KEY, JSON.stringify(this.config));
      } catch (error) {
        this.debugWarn('Failed to save Line Login config to localStorage:', error);
      }
    }
  }

  private loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem(this.CONFIG_STORAGE_KEY);
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        this.isInitialized = true;
        this.debugLog('LineLoginWeb: config restored from localStorage');
      }
    } catch (error) {
      // 这里不使用debugWarn，因为config可能还没加载，所以总是输出警告
      console.warn('Failed to load Line Login config from localStorage:', error);
      this.clearConfig();
    }
  }

  private clearConfig(): void {
    try {
      localStorage.removeItem(this.CONFIG_STORAGE_KEY);
    } catch (error) {
      this.debugWarn('Failed to clear Line Login config from localStorage:', error);
    }
  }

  async initialize(options: LineLoginConfig): Promise<void> {
    // 先临时设置debug，以便能输出初始化日志
    const tempDebug = options.debug;
    if (tempDebug) {
      console.log('LineLoginWeb: initialize', options);
    }
    
    // 验证必需参数
    if (!options) {
      throw new Error('LineLoginConfig is required');
    }
    
    if (!options.channelId) {
      throw new Error('channelId is required in LineLoginConfig');
    }
    
    if (typeof options.channelId !== 'string' || options.channelId.trim() === '') {
      throw new Error('channelId must be a non-empty string');
    }
    
    // 验证可选参数
    if (options.redirectUri && typeof options.redirectUri !== 'string') {
      throw new Error('redirectUri must be a string');
    }
    
    if (options.scope && !Array.isArray(options.scope)) {
      throw new Error('scope must be an array');
    }
    
    if (options.botPrompt && typeof options.botPrompt !== 'string') {
      throw new Error('botPrompt must be a string');
    }
    
    // 存储配置
    this.config = {
      channelId: options.channelId.trim(),
      redirectUri: options.redirectUri || window.location.origin + '/line-callback',
      scope: options.scope || ['profile'],
      botPrompt: options.botPrompt,
      debug: options.debug || false
    };
    
    this.isInitialized = true;
    
    // 保存配置到localStorage
    this.saveConfig();
    
    this.debugLog('LineLoginWeb: initialized successfully', {
      channelId: this.config.channelId,
      scope: this.config.scope,
      hasRedirectUri: !!this.config.redirectUri,
      hasBotPrompt: !!this.config.botPrompt,
      debug: this.config.debug
    });
  }

  async login(options?: LoginOptions): Promise<LoginResult> {
    this.debugLog('LineLoginWeb: login', options);
    
    // 如果未初始化，尝试从localStorage恢复配置
    if (!this.isInitialized) {
      this.loadConfig();
    }
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }

    // 检查是否是回调处理
    if (window.location.search.includes('code=')) {
      return this.handleLoginCallback();
    }

    if (window.location.search.includes('error=')) {
      throw new Error('Line login failed: ' + window.location.search);
    }

    // 生成PKCE参数
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateRandomString(16);

    // 存储验证参数
    sessionStorage.setItem('line_code_verifier', codeVerifier);
    sessionStorage.setItem('line_state', state);

    // 构建授权URL
    const authUrl = this.buildAuthUrl(state, codeChallenge);

    this.debugLog('LineLoginWeb: redirecting to', authUrl.toString());

    // 执行重定向
    window.location.assign(authUrl.toString());
    
    // 这里不会执行到，因为页面会重定向
    // 返回一个永不resolve的Promise，因为页面会重定向
    return new Promise<LoginResult>(() => {
      // 这个Promise永远不会resolve，因为页面会重定向
    });
  }

  private async handleLoginCallback(): Promise<LoginResult> {
    // 确保配置已加载
    if (!this.isInitialized) {
      this.loadConfig();
    }
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Configuration lost after redirect.');
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      throw new Error(`Line login failed: ${error} - ${errorDescription || 'Unknown error'}`);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    // 验证state参数
    const storedState = sessionStorage.getItem('line_state');
    if (state !== storedState) {
      throw new Error('State parameter mismatch - possible CSRF attack');
    }

    const codeVerifier = sessionStorage.getItem('line_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found in session storage');
    }

    try {
      // 交换授权码获取访问令牌
      const tokenResponse = await this.exchangeCodeForToken(code, codeVerifier);
      
      // 获取用户信息
      const userProfile = await this.fetchUserProfile(tokenResponse.access_token);
      
      // 存储状态
      this.accessToken = tokenResponse.access_token;
      this.currentUser = userProfile;
      
      // 清理session storage
      sessionStorage.removeItem('line_code_verifier');
      sessionStorage.removeItem('line_state');
      
      return {
        accessToken: tokenResponse.access_token,
        expiresIn: tokenResponse.expires_in || 2592000, // 默认30天
        refreshToken: tokenResponse.refresh_token,
        scope: this.config?.scope?.join(' ') || 'profile',
        tokenType: tokenResponse.token_type || 'Bearer',
        userProfile: userProfile
      };
    } catch (error) {
      // 清理session storage
      sessionStorage.removeItem('line_code_verifier');
      sessionStorage.removeItem('line_state');
      throw error;
    }
  }

  private async exchangeCodeForToken(code: string, codeVerifier: string): Promise<{ 
    access_token: string; 
    expires_in?: number;
    refresh_token?: string;
    token_type?: string;
    id_token?: string;
  }> {
    const tokenUrl = 'https://api.line.me/oauth2/v2.1/token';
    
    const redirectUri = this.config?.redirectUri || window.location.origin + '/line-callback';
    const channelId = this.config?.channelId || '';
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: channelId
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Token exchange failed: ${response.status} - ${errorData.error_description || 'Unknown error'}`);
    }

    return response.json();
  }

  private async fetchUserProfile(accessToken: string): Promise<UserProfile> {
    const response = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const profile = await response.json();
    
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
      language: profile.language
    };
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(b => chars[b % chars.length])
      .join('');
  }

  private buildAuthUrl(state: string, codeChallenge: string): URL {
    if (!this.config) {
      throw new Error('Plugin not initialized');
    }
    
    const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', this.config.channelId);
    authUrl.searchParams.append('redirect_uri', this.config.redirectUri || '');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', this.config.scope?.join(' ') || 'profile');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    if (this.config.botPrompt) {
      authUrl.searchParams.append('bot_prompt', this.config.botPrompt);
    }

    return authUrl;
  }

  async getUserProfile(): Promise<UserProfile> {
    this.debugLog('LineLoginWeb: getUserProfile');
    
    // 如果未初始化，尝试从localStorage恢复配置
    if (!this.isInitialized) {
      this.loadConfig();
    }
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
    
    if (!this.currentUser) {
      throw new Error('User not logged in. Call login() first.');
    }

    return this.currentUser;
  }

  async isLoggedIn(): Promise<{ isLoggedIn: boolean }> {
    this.debugLog('LineLoginWeb: isLoggedIn');
    
    // 如果未初始化，尝试从localStorage恢复配置
    if (!this.isInitialized) {
      this.loadConfig();
    }
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
    
    return { isLoggedIn: this.accessToken !== null && this.currentUser !== null };
  }

  async logout(): Promise<void> {
    this.debugLog('LineLoginWeb: logout');
    
    // 如果未初始化，尝试从localStorage恢复配置
    if (!this.isInitialized) {
      this.loadConfig();
    }
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
    
    // 清除本地状态
    this.currentUser = null;
    this.accessToken = null;
    
    // 清理可能存在的session storage
    sessionStorage.removeItem('line_code_verifier');
    sessionStorage.removeItem('line_state');
    
    // 清理localStorage中的配置（可选，根据需求决定是否保留配置）
    // this.clearConfig();
    // this.isInitialized = false;
    
    // 可选：重定向到Line登出URL
    // window.location.href = 'https://access.line.me/oauth2/v2.1/logout';
  }

  async refreshToken(): Promise<TokenResult> {
    this.debugLog('LineLoginWeb: refreshToken');
    
    // 如果未初始化，尝试从localStorage恢复配置
    if (!this.isInitialized) {
      this.loadConfig();
    }
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
    
    if (!this.accessToken) {
      throw new Error('No access token available. User not logged in.');
    }

    // Line Web API 不支持刷新令牌，需要重新登录
    throw new Error('Token refresh not supported in web environment. Please re-login.');
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    this.debugLog('LineLoginWeb: echo', options);
    return options;
  }
}
