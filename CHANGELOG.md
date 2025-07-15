# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Capacitor Line Login Plugin
- Full cross-platform support (Android, iOS, Web)
- Complete OAuth 2.0 implementation with PKCE security
- TypeScript support with full type definitions
- Comprehensive documentation and examples

### Features
- **Cross-platform Login**: Seamless Line Login across Android, iOS, and Web
- **Security**: PKCE implementation, CSRF protection, and state verification
- **Native Integration**: Uses official Line SDK for Android and iOS
- **Web Support**: Complete OAuth 2.0 flow for web platforms
- **TypeScript**: Full type definitions and IntelliSense support
- **Error Handling**: Comprehensive error handling and user-friendly messages

## [0.0.1] - 2024-07-15

### Added
- Initial project setup with Capacitor plugin architecture
- Basic plugin structure for Android, iOS, and Web platforms
- TypeScript interface definitions
- Line SDK integration for Android (v5.11.1+)
- Line SDK integration for iOS (v5.8.0+)
- Web OAuth 2.0 implementation using Line Login Web API v2.1
- Example application with complete testing interface

### Core Features
- `initialize()` - Initialize the plugin with Line Channel ID
- `login()` - Execute Line Login flow
- `getUserProfile()` - Get user profile information
- `isLoggedIn()` - Check current login status
- `logout()` - Logout and clear session data
- `refreshToken()` - Token refresh handling (with platform limitations)
- `echo()` - Test method for plugin verification

### Platform Support
- **Android**: Line SDK 5.11.1+ with Activity lifecycle handling
- **iOS**: Line SDK 5.8.0+ with URL Scheme and Universal Links support
- **Web**: Line Login Web API v2.1 with complete OAuth 2.0 flow

### Security Features
- PKCE (Proof Key for Code Exchange) implementation for Web
- State parameter validation for CSRF protection
- Secure token storage and session management
- Automatic cleanup of sensitive data

### Developer Experience
- Complete TypeScript definitions
- Comprehensive error handling
- Platform detection utilities
- Detailed documentation with examples
- Migration guide from other solutions
- Example application for testing

### Documentation
- Complete README with installation and usage instructions
- Detailed usage guide with best practices
- Platform-specific configuration guides
- Migration guide from Cordova and native implementations
- API documentation with examples
- Troubleshooting guide

### Configuration
- Flexible initialization options
- Platform-specific configuration support
- Debug mode for development
- Customizable scope and permissions
- Redirect URI configuration for Web

### Testing
- Example application with full feature testing
- Cross-platform compatibility testing
- Error scenario testing
- Authentication flow validation

---

## Release Notes

### Version 0.0.1 - Initial Release

This is the initial release of the Capacitor Line Login Plugin. The plugin provides a complete solution for integrating Line Login into Capacitor applications across Android, iOS, and Web platforms.

#### Key Highlights:
- **Universal Compatibility**: Works seamlessly across all major platforms
- **Security First**: Implements latest OAuth 2.0 security best practices
- **Developer Friendly**: Complete TypeScript support and comprehensive documentation
- **Production Ready**: Includes error handling, testing, and real-world examples

#### What's Included:
- Full source code for all platforms
- Complete documentation and guides
- Example application for testing
- Migration tools and guides
- TypeScript definitions

#### Getting Started:
```bash
npm install capacitor-line-login
npx cap sync
```

#### Quick Example:
```typescript
import { LineLogin } from 'capacitor-line-login';

// Initialize
await LineLogin.initialize({
  channelId: 'YOUR_LINE_CHANNEL_ID'
});

// Login
const result = await LineLogin.login();
console.log('User:', result.userProfile);
```

For detailed instructions, see the [README](README.md) and [Usage Guide](docs/usage-guide.md).

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- 📚 [Documentation](README.md)
- 🐛 [Issues](https://github.com/zhucl1006/capacitor-line-login/issues)
- 💬 [Discussions](https://github.com/zhucl1006/capacitor-line-login/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 