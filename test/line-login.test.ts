import { LineLoginHelpers } from '../src/index';
import { LineLoginWeb } from '../src/web';

describe('LineLogin Plugin', () => {
  let plugin: LineLoginWeb;

  beforeEach(() => {
    plugin = new LineLoginWeb();
  });

  describe('LineLoginHelpers', () => {
    it('should detect platform correctly', () => {
      expect(LineLoginHelpers.getCurrentPlatform()).toBe('web');
      expect(LineLoginHelpers.isWebPlatform()).toBe(true);
      expect(LineLoginHelpers.isNativePlatform()).toBe(false);
      expect(LineLoginHelpers.isPlatformSupported()).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should initialize with valid channel ID', async () => {
      const config = {
        channelId: 'test-channel-id',
        scope: ['profile']
      };

      await expect(plugin.initialize(config)).resolves.not.toThrow();
    });

    it('should throw error with empty channel ID', async () => {
      const config = {
        channelId: '',
        scope: ['profile']
      };

      await expect(plugin.initialize(config)).rejects.toThrow('channelId is required');
    });

    it('should throw error with null config', async () => {
      await expect(plugin.initialize(null as any)).rejects.toThrow('LineLoginConfig is required');
    });

    it('should throw error with undefined channel ID', async () => {
      const config = {
        channelId: undefined as any,
        scope: ['profile']
      };

      await expect(plugin.initialize(config)).rejects.toThrow('channelId is required');
    });

    it('should set default values correctly', async () => {
      const config = {
        channelId: 'test-channel-id'
      };

      await plugin.initialize(config);

      expect((plugin as any).config).toEqual({
        channelId: 'test-channel-id',
        redirectUri: 'http://localhost/line-callback',
        scope: ['profile'],
        botPrompt: undefined,
        debug: undefined
      });
    });
  });

  describe('getUserProfile', () => {
    it('should throw error when not initialized', async () => {
      await expect(plugin.getUserProfile()).rejects.toThrow('Plugin not initialized');
    });

    it('should throw error when not logged in', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        scope: ['profile']
      });

      await expect(plugin.getUserProfile()).rejects.toThrow('User not logged in');
    });

    it('should return cached user profile', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        scope: ['profile']
      });

      // Set up logged in state
      (plugin as any).accessToken = 'test-token';
      (plugin as any).currentUser = {
        userId: 'test-user-id',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/picture.jpg',
        statusMessage: 'Hello World',
        language: 'en'
      };

      const profile = await plugin.getUserProfile();

      expect(profile).toEqual({
        userId: 'test-user-id',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/picture.jpg',
        statusMessage: 'Hello World',
        language: 'en'
      });
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when not logged in', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        scope: ['profile']
      });

      const result = await plugin.isLoggedIn();
      expect(result.isLoggedIn).toBe(false);
    });

    it('should return true when logged in', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        scope: ['profile']
      });

      // Set up logged in state
      (plugin as any).accessToken = 'test-token';
      (plugin as any).currentUser = { userId: 'test-user-id' };

      const result = await plugin.isLoggedIn();
      expect(result.isLoggedIn).toBe(true);
    });
  });

  describe('logout', () => {
    it('should throw error when not initialized', async () => {
      await expect(plugin.logout()).rejects.toThrow('Plugin not initialized');
    });

    it('should logout successfully', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        scope: ['profile']
      });

      // Set up logged in state
      (plugin as any).accessToken = 'test-token';
      (plugin as any).currentUser = { userId: 'test-user-id' };

      await plugin.logout();

      expect((plugin as any).accessToken).toBeNull();
      expect((plugin as any).currentUser).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should throw error when not initialized', async () => {
      await expect(plugin.refreshToken()).rejects.toThrow('Plugin not initialized');
    });

    it('should throw error when not logged in', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        scope: ['profile']
      });

      await expect(plugin.refreshToken()).rejects.toThrow('User not logged in');
    });

    it('should return error for web platform', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        scope: ['profile']
      });

      // Set up logged in state
      (plugin as any).accessToken = 'test-token';

      await expect(plugin.refreshToken()).rejects.toThrow('Token refresh not supported in web environment');
    });
  });

  describe('echo', () => {
    it('should echo the input value', async () => {
      const result = await plugin.echo({ value: 'test' });
      expect(result.value).toBe('test');
    });
  });

  describe('PKCE functionality', () => {
    it('should generate code verifier and challenge', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        scope: ['profile']
      });

      const generateCodeVerifier = (plugin as any).generateCodeVerifier;
      const generateCodeChallenge = (plugin as any).generateCodeChallenge;

      const codeVerifier = generateCodeVerifier();
      expect(codeVerifier).toBeDefined();
      expect(codeVerifier.length).toBe(64); // 实际长度是64，不是128

      const codeChallenge = await generateCodeChallenge(codeVerifier);
      expect(codeChallenge).toBeDefined();
      expect(typeof codeChallenge).toBe('string');
    });
  });

  describe('URL generation', () => {
    it('should generate correct authorization URL', async () => {
      await plugin.initialize({
        channelId: 'test-channel-id',
        redirectUri: 'http://localhost/callback',
        scope: ['profile']
      });

      const state = 'test-state';
      const codeChallenge = 'test-challenge';

      const authUrl = (plugin as any).buildAuthUrl.call(plugin, state, codeChallenge);

      expect(authUrl.toString()).toContain('https://access.line.me/oauth2/v2.1/authorize');
      expect(authUrl.toString()).toContain('client_id=test-channel-id');
      expect(authUrl.toString()).toContain('redirect_uri=http%3A%2F%2Flocalhost%2Fcallback');
      expect(authUrl.toString()).toContain('state=test-state');
      expect(authUrl.toString()).toContain('code_challenge=test-challenge');
    });
  });

  describe('error handling', () => {
    it('should handle invalid configuration', async () => {
      const config = {
        channelId: 'test-channel-id',
        scope: null as any
      };

      await plugin.initialize(config);

      // Should use default scope
      expect((plugin as any).config.scope).toEqual(['profile']);
    });

    it('should handle missing redirect URI', async () => {
      const config = {
        channelId: 'test-channel-id'
      };

      await plugin.initialize(config);

      // Should use default redirect URI
      expect((plugin as any).config.redirectUri).toBe('http://localhost/line-callback');
    });
  });
}); 