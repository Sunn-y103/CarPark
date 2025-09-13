# Firebase iOS Setup

## Step 1: Add iOS App in Firebase Console
1. Go to your Firebase Console
2. Select your project
3. Click "Add app" → Select iOS
4. **iOS bundle ID**: Enter `com.major-carpark` (or check your actual bundle ID in Xcode)
5. **App nickname**: Enter "CarPark iOS"
6. **App Store ID**: Leave empty for now
7. Click "Register app"

## Step 2: Download and Add GoogleService-Info.plist
1. Download the `GoogleService-Info.plist` file from Firebase Console
2. Copy the file to: `C:\Users\sunny\Major_CarPark\ios\CarPark\GoogleService-Info.plist`
3. **IMPORTANT**: You must also add it to Xcode project:
   - Open Xcode
   - Right-click on "CarPark" folder in project navigator
   - Select "Add Files to CarPark"
   - Choose the `GoogleService-Info.plist` file
   - Make sure "Copy items if needed" is checked
   - Make sure "CarPark" target is selected
   - Click "Add"

## Step 3: Update Podfile (Already Done)
The Podfile has been updated to include Firebase pods.

## Step 4: Install Pods
Run these commands:
```bash
cd ios
pod install
```

## Step 5: Update AppDelegate
The AppDelegate will be updated automatically by the React Native Firebase library.

**Note**: If you encounter bundle ID issues, check your actual bundle ID in:
- Xcode project settings
- Or look for it in Info.plist files

Once completed, you can delete this instruction file.
