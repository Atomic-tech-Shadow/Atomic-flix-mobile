# ATOMIC FLIX - Mobile APK Build Solution with Local Keystore

## Overview
This document provides the complete solution for building ATOMIC FLIX mobile APK using the provided local keystore for signing.

## Keystore Configuration

### Files Added
- `signing.keystore` - Your signing keystore file
- `signing-key-info.txt` - Keystore credentials and information
- `credentials.json` - EAS credentials configuration
- `build-with-keystore.sh` - Automated build script

### Keystore Details
- **File**: signing.keystore
- **Password**: Q9TSIc286YHu
- **Key Alias**: atomic-flix-key
- **Key Password**: Q9TSIc286YHu
- **Signer**: ATOMIC FLIX Admin
- **Organization**: ATOMIC FLIX - Streaming d'Anime

## Build Methods

### Method 1: Automated Build Script (Recommended)
```bash
# Navigate to mobile directory
cd mobile

# Run automated build script
./build-with-keystore.sh
```

### Method 2: Manual EAS Build with Local Keystore
```bash
# Install EAS CLI
npm install -g @expo/cli@latest

# Login to Expo
npx expo login

# Build APK with local credentials
npx eas build --platform android --profile preview --local

# For production build
npx eas build --platform android --profile production --local
```

### Method 3: EAS Build with Remote Keystore Upload
```bash
# Upload keystore to EAS
npx eas credentials:configure --platform android

# Then build normally
npx eas build --platform android --profile preview
```

## Configuration Files

### EAS Configuration (eas.json)
```json
{
  "cli": {
    "version": ">= 5.7.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease --no-daemon",
        "credentialsSource": "local"
      },
      "env": {
        "NODE_ENV": "production",
        "EXPO_USE_HERMES": "false"
      }
    },
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "credentialsSource": "local"
      }
    }
  }
}
```

### Credentials Configuration (credentials.json)
```json
{
  "android": {
    "keystore": {
      "keystorePath": "./signing.keystore",
      "keystorePassword": "Q9TSIc286YHu",
      "keyAlias": "atomic-flix-key",
      "keyPassword": "Q9TSIc286YHu"
    }
  }
}
```

## Build Commands

### Quick Build Commands
```bash
# Navigate to mobile directory
cd mobile

# Build with local keystore (preview)
npx eas build --platform android --profile preview --local

# Build with local keystore (production)
npx eas build --platform android --profile production --local

# Check build status
npx eas build:list
```

## Security Notes

### Keystore Security
- Keep `signing.keystore` and `signing-key-info.txt` secure
- Never commit keystore files to version control
- Store credentials in a secure location
- Use the same keystore for all app updates

### Environment Variables
The build script sets these variables:
- `ANDROID_KEYSTORE_PATH="./signing.keystore"`
- `ANDROID_KEYSTORE_PASSWORD="Q9TSIc286YHu"`
- `ANDROID_KEY_ALIAS="atomic-flix-key"`
- `ANDROID_KEY_PASSWORD="Q9TSIc286YHu"`

## App Configuration

### Package Details
- **Package**: com.atomicflix.mobile
- **Version**: 1.0.2
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 33 (Android 13)

### Permissions
- Internet access
- Network state access
- Audio recording (for media playback)
- Audio settings modification

## Troubleshooting

### Common Issues
1. **Keystore not found**: Ensure `signing.keystore` is in mobile directory
2. **Invalid credentials**: Check passwords in `credentials.json`
3. **Build fails**: Try cleaning cache with `--clear-cache` flag
4. **Memory issues**: Add `GRADLE_OPTS="-Xmx4096m"`

### Debug Commands
```bash
# Check keystore info
keytool -list -v -keystore signing.keystore

# Verify credentials
cat credentials.json

# Check EAS configuration
npx eas build:configure
```

## Output
- Signed APK will be generated in build directory
- APK can be installed on Android devices
- Same keystore must be used for Google Play Store uploads

## Notes
- APK includes full ATOMIC FLIX functionality
- Uses anime-sama-scraper.vercel.app API for data
- Identical to web version with native mobile UX
- Keystore enables Google Play Store publishing