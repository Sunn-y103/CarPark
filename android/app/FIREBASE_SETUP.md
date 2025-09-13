# Firebase Android Setup

## Step 1: Download google-services.json
1. Go to your Firebase Console
2. Select your project
3. Go to Project Settings (gear icon)
4. Under "Your apps" section, find the Android app
5. Download the `google-services.json` file

## Step 2: Place the file
Copy the downloaded `google-services.json` file to:
`android/app/google-services.json`

**IMPORTANT**: The file must be placed directly in the `android/app/` directory, not in any subdirectory.

## Step 3: Verify
After placing the file, you should have:
```
android/
  app/
    google-services.json  ← This file
    build.gradle
    src/
    ...
```

Once you've completed these steps, you can delete this instruction file.
