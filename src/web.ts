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

  async initialize(options: LineLoginConfig): Promise<void> {
    console.log('LineLoginWeb: initialize', options);
    
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
      redirectUri: options.redirectUri,
      scope: options.scope || ['profile'],
      botPrompt: options.botPrompt
    };
    
    this.isInitialized = true;
    
    console.log('LineLoginWeb: initialized successfully', {
      channelId: this.config.channelId,
      scope: this.config.scope,
      hasRedirectUri: !!this.config.redirectUri,
      hasBotPrompt: !!this.config.botPrompt
    });
    
    // TODO: 实现Web端的Line SDK初始化
    // 这里将在后续任务中实现具体的Web登录逻辑
    // 目前只是验证参数并存储配置
  }

  async login(options?: LoginOptions): Promise<LoginResult> {
    console.log('LineLoginWeb: login', options);
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }

    // TODO: 实现Web端的Line登录逻辑
    // 这里将在后续任务中实现具体的OAuth 2.0流程
    throw new Error('Web login implementation not yet available. Please use native platforms.');
  }

  async getUserProfile(): Promise<UserProfile> {
    console.log('LineLoginWeb: getUserProfile');
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
    
    if (!this.currentUser) {
      throw new Error('User not logged in. Call login() first.');
    }

    // TODO: 实现Web端的用户信息获取逻辑
    return this.currentUser;
  }

  async isLoggedIn(): Promise<{ isLoggedIn: boolean }> {
    console.log('LineLoginWeb: isLoggedIn');
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
    
    // TODO: 实现Web端的登录状态检查逻辑
    return { isLoggedIn: this.accessToken !== null };
  }

  async logout(): Promise<void> {
    console.log('LineLoginWeb: logout');
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
    
    // TODO: 实现Web端的登出逻辑
    this.currentUser = null;
    this.accessToken = null;
  }

  async refreshToken(): Promise<TokenResult> {
    console.log('LineLoginWeb: refreshToken');
    
    if (!this.isInitialized || !this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
    
    if (!this.accessToken) {
      throw new Error('No access token available. User not logged in.');
    }

    // TODO: 实现Web端的令牌刷新逻辑
    throw new Error('Token refresh implementation not yet available. Please use native platforms.');
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('LineLoginWeb: echo', options);
    return options;
  }
}
