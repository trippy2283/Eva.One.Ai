# iOS App Setup Instructions

Your iOS app has been generated successfully. Follow these steps to get it running in Xcode.

## Quick Start

1. Open in Xcode: Double-click the `.swift` files or create a new iOS project and replace the default files.
2. Set Deployment Target: iOS 15.0 or newer.
3. Choose Device: iPhone simulator or physical device.
4. Build and Run: Press Command + R or click the Run button.

## Xcode Configuration

### Modern Info.plist Setup
Instead of a separate Info.plist file, modern Xcode projects use Generate Info.plist File.

1. Select your project in Xcode navigator.
2. Select your app target.
3. Go to Build Settings.
4. Search for Generate Info.plist File.
5. Set it to YES.

### Bundle Identifier
Set your bundle identifier in Build Settings under Product Bundle Identifier.

Example: `com.yourname.goodthenim`

## Microphone Permissions Required

Add this key to your Info.plist in Xcode:

- Key: `NSMicrophoneUsageDescription`
- Value: This app needs microphone access for voice input.

## Photo Library Permissions Required

Add this key to your Info.plist in Xcode:

- Key: `NSPhotoLibraryUsageDescription`
- Value: This app needs photo library access for user-selected media.

## Notifications Setup

For local or push notifications, no Info.plist entries are required, but you may need to:

1. Enable Push Notifications capability in your app target.
2. Request notification permissions in your code.

## Adding Info.plist Keys in Xcode

1. Select your project in Xcode.
2. Select your app target.
3. Go to the Info tab.
4. Click the plus button to add new keys.
5. Add the keys and values listed above.

Alternative method:

1. Right-click your project and choose Add Files.
2. Create a new Property List file named `Info.plist`.
3. Add the required keys and values.

## App Features Detected

Based on the generated code, the app includes:

- `EVADataModels.swift`: Core data models.
- `AppStateManager.swift`: Main app state and security control.
- `MainTabView.swift`: Main tab shell.
- `ControlView.swift`: EVA control interface.

## Troubleshooting

Build Error: Multiple commands produce Info.plist

This happens when you have both a custom Info.plist file and Generate Info.plist File enabled. Either delete the custom Info.plist file or set Generate Info.plist File to NO.

Permission Errors at Runtime

Make sure the required permission keys are added to Info.plist. The app can crash if restricted features are accessed without permission descriptions.

## Next Steps

1. Customize UI colors, fonts, and layouts in SwiftUI views.
2. Add app icons using Xcode Asset Catalog.
3. Test on a physical iPhone.
4. Archive and submit to the App Store when ready.
