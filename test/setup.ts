// Jest setup file
import 'jest';

// Mock Capacitor
const mockCapacitor = {
  getPlatform: jest.fn(() => 'web'),
  isNativePlatform: jest.fn(() => false),
  isPluginAvailable: jest.fn(() => true),
  Plugins: {}
};

// Mock window.Capacitor
Object.defineProperty(window, 'Capacitor', {
  value: mockCapacitor,
  writable: true
});

// Mock fetch for web tests
global.fetch = jest.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

// Mock location
const mockLocation = {
  origin: 'http://localhost',
  href: 'http://localhost',
  search: '',
  pathname: '/'
};

// Use a different approach for mocking location
(global as any).location = mockLocation;

// Mock crypto for PKCE
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32)))
    }
  },
  writable: true
});

// Mock TextEncoder
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn((str: string) => new Uint8Array(str.split('').map((c: string) => c.charCodeAt(0))))
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset fetch mock
  (global.fetch as jest.Mock).mockClear();
  
  // Reset sessionStorage mock
  mockSessionStorage.getItem.mockClear();
  mockSessionStorage.setItem.mockClear();
  mockSessionStorage.removeItem.mockClear();
  mockSessionStorage.clear.mockClear();
  
  // Reset location
  mockLocation.search = '';
  mockLocation.pathname = '/';
}); 