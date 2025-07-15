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

  async initialize(options: LineLoginConfig): Promise<void> {
    console.log('LineLoginWeb: initialize', options);
    this.config = options;
    
    // TODO: 实现Web端的Line SDK初始化
    // 这里将在后续任务中实现具体的Web登录逻辑
    throw new Error('Web implementation not yet available. Please use native platforms.');
  }

  async login(options?: LoginOptions): Promise<LoginResult> {
    console.log('LineLoginWeb: login', options);
    
    if (!this.config) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }

    // TODO: 实现Web端的Line登录逻辑
    // 这里将在后续任务中实现具体的OAuth 2.0流程
    throw new Error('Web login implementation not yet available. Please use native platforms.');
  }

  async getUserProfile(): Promise<UserProfile> {
    console.log('LineLoginWeb: getUserProfile');
    
    if (!this.currentUser) {
      throw new Error('User not logged in. Call login() first.');
    }

    // TODO: 实现Web端的用户信息获取逻辑
    return this.currentUser;
  }

  async isLoggedIn(): Promise<{ isLoggedIn: boolean }> {
    console.log('LineLoginWeb: isLoggedIn');
    
    // TODO: 实现Web端的登录状态检查逻辑
    return { isLoggedIn: this.accessToken !== null };
  }

  async logout(): Promise<void> {
    console.log('LineLoginWeb: logout');
    
    // TODO: 实现Web端的登出逻辑
    this.currentUser = null;
    this.accessToken = null;
  }

  async refreshToken(): Promise<TokenResult> {
    console.log('LineLoginWeb: refreshToken');
    
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
