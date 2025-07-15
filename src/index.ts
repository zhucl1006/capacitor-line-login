import { registerPlugin } from '@capacitor/core';

import type { LineLoginPlugin } from './definitions';

const LineLogin = registerPlugin<LineLoginPlugin>('LineLogin', {
  web: () => import('./web').then((m) => new m.LineLoginWeb()),
});

export * from './definitions';
export { LineLogin };

// 导出便于使用的辅助函数
export const LineLoginHelpers = {
  /**
   * 检查当前平台是否支持Line登录
   */
  isPlatformSupported(): boolean {
    const platform = (window as any).Capacitor?.getPlatform();
    return ['web', 'ios', 'android'].includes(platform);
  },

  /**
   * 获取当前平台信息
   */
  getCurrentPlatform(): string {
    return (window as any).Capacitor?.getPlatform() || 'web';
  },

  /**
   * 检查是否为Web平台
   */
  isWebPlatform(): boolean {
    return this.getCurrentPlatform() === 'web';
  },

  /**
   * 检查是否为原生平台
   */
  isNativePlatform(): boolean {
    const platform = this.getCurrentPlatform();
    return platform === 'ios' || platform === 'android';
  }
};
