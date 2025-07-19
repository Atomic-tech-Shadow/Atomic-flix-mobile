# F-Droid Submission Guide for Atomic Flix

## Configuration Completed ✅

Your project is now ready for F-Droid submission with the following structure:

### Fastlane Metadata (Auto-populated)
```
fastlane/metadata/android/en-US/
├── short_description.txt        # Brief app description (78 chars)
├── full_description.txt         # Detailed description with features
├── title.txt                    # App name: "Atomic Flix"
├── changelogs/1.txt            # Version 1 changelog
└── images/
    └── icon.png                # App icon (copied from assets)
```

### F-Droid Metadata Template
`metadata-fdroid/com.atomicflix.mobile.yml` - Ready-to-use YAML configuration

## Submission Steps

### 1. Prerequisites
- [ ] Create a **public Git repository** with your source code
- [ ] Add proper **open source license** (currently set as MIT)
- [ ] Create **version tags** (e.g., `v1.0.0` for version 1.0)
- [ ] Update the `SourceCode` URL in the YAML file

### 2. Repository Setup
```bash
# Add license file if not present
echo "MIT License..." > LICENSE

# Create version tag
git add .
git commit -m "Add F-Droid metadata and prepare v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 3. F-Droid Submission
1. Fork the [fdroiddata](https://gitlab.com/fdroid/fdroiddata) repository on GitLab
2. Copy `metadata-fdroid/com.atomicflix.mobile.yml` to `metadata/com.atomicflix.mobile.yml`
3. Update the SourceCode URL to your actual repository
4. Create merge request with title: "New App: com.atomicflix.mobile"

### 4. What F-Droid Will Do
- Build your app from source using Expo/React Native
- Extract metadata from your fastlane folder automatically
- Review and merge (typically 1-2 days)
- Publish to F-Droid store (1-2 days after merge)

## Key Benefits of This Setup
- **Automatic metadata**: F-Droid will use your fastlane descriptions
- **Professional presentation**: Custom icon and detailed description
- **Version tracking**: Changelog system for updates
- **Open source compliance**: Proper license and source transparency

## Next Steps
1. Upload your code to a public Git repository
2. Update the SourceCode URL in the YAML
3. Submit to F-Droid following the steps above

Your app will then be available to millions of F-Droid users worldwide!