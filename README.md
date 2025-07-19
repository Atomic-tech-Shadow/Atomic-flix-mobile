# Atomic Flix

Mobile app for streaming anime and reading manga with modern interface.

## Features

- 🎬 Stream anime episodes with multiple server options
- 📚 Read manga with intuitive reader interface  
- 🔍 Global search functionality across all content
- 🎨 Modern dark UI with cyan accent colors
- 🌐 Episode navigation and language selection (VF/VO)
- 📱 Telegram integration for community features
- 🛡️ Optimized for Android devices with safe area support

## Technology Stack

- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **React Navigation** for screen management
- **AsyncStorage** for local data persistence
- **React Query** for API state management
- **React Native WebView** for video streaming

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd atomic-flix-mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android
```

### Build

```bash
# Build for production
npx eas build --platform android --profile production
```

## F-Droid

This app is configured for F-Droid submission with complete metadata and build instructions. See `F-DROID-SUBMISSION.md` for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and feature requests, please use the GitHub Issues tracker.