export interface LineLoginPlugin {
  /**
   * 初始化Line Login SDK
   * @param options 配置选项
   */
  initialize(options: LineLoginConfig): Promise<void>;

  /**
   * 执行Line登录
   * @param options 登录选项
   * @returns 登录结果
   */
  login(options?: LoginOptions): Promise<LoginResult>;

  /**
   * 获取用户信息
   * @returns 用户个人资料
   */
  getUserProfile(): Promise<UserProfile>;

  /**
   * 检查登录状态
   * @returns 登录状态
   */
  isLoggedIn(): Promise<{ isLoggedIn: boolean }>;

  /**
   * 登出
   */
  logout(): Promise<void>;

  /**
   * 刷新访问令牌
   * @returns 新的令牌信息
   */
  refreshToken(): Promise<TokenResult>;

  /**
   * Echo方法（测试用）
   * @param options 
   * @returns 
   */
  echo(options: { value: string }): Promise<{ value: string }>;
}

/**
 * Line Login 配置接口
 */
export interface LineLoginConfig {
  /**
   * Line Channel ID
   */
  channelId: string;

  /**
   * Universal Link URL (iOS)
   */
  universalLinkURL?: string;

  /**
   * 重定向 URI (Web)
   */
  redirectUri?: string;

  /**
   * 权限范围
   */
  scope?: string[];

  /**
   * Bot 提示信息
   */
  botPrompt?: string;

  /**
   * 调试模式
   */
  debug?: boolean;
}

/**
 * 登录选项接口
 */
export interface LoginOptions {
  /**
   * 仅使用Web登录
   */
  onlyWebLogin?: boolean;

  /**
   * Bot提示模式
   */
  botPrompt?: 'normal' | 'aggressive';

  /**
   * 权限范围
   */
  scopes?: string[];
}

/**
 * 登录结果接口
 */
export interface LoginResult {
  /**
   * 访问令牌
   */
  accessToken: string;

  /**
   * 令牌过期时间（秒）
   */
  expiresIn: number;

  /**
   * 刷新令牌
   */
  refreshToken?: string;

  /**
   * 权限范围
   */
  scope: string;

  /**
   * 令牌类型
   */
  tokenType: string;

  /**
   * 用户个人资料
   */
  userProfile: UserProfile;
}

/**
 * 用户个人资料接口
 */
export interface UserProfile {
  /**
   * 用户ID
   */
  userId: string;

  /**
   * 显示名称
   */
  displayName: string;

  /**
   * 头像URL
   */
  pictureUrl?: string;

  /**
   * 状态消息
   */
  statusMessage?: string;

  /**
   * 语言
   */
  language?: string;
}

/**
 * 令牌结果接口
 */
export interface TokenResult {
  /**
   * 访问令牌
   */
  accessToken: string;

  /**
   * 令牌过期时间（秒）
   */
  expiresIn: number;

  /**
   * 刷新令牌
   */
  refreshToken?: string;

  /**
   * 令牌类型
   */
  tokenType?: string;
}

/**
 * 错误接口
 */
export interface LineLoginError {
  /**
   * 错误代码
   */
  code: string;

  /**
   * 错误消息
   */
  message: string;

  /**
   * 错误详情
   */
  details?: any;
}
