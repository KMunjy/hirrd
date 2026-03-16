# HIRRD MOBILE — PRIVACY & GOVERNANCE
## App Store + Google Play Compliance | POPIA SA

---

## APPLE APP STORE — PRIVACY NUTRITION LABEL

### Data Used to Track You
NONE — Hirrd does not track users across third-party apps or websites.

### Data Linked to You
| Data Type | Purpose | Required? |
|-----------|---------|-----------|
| Name | Account creation | Yes |
| Email | Authentication, notifications | Yes |
| Phone number | SMS/WhatsApp job alerts | Optional |
| CV/Resume | AI job matching | Yes (core feature) |
| Coarse location (province/city) | Local job matching | Yes |
| Photos (passport) | Profile — POPIA s.26 flagged | No — feature-flagged |

### Data NOT Collected
- Precise GPS location (only city/province — user provided)
- Health data
- Financial information  
- Browsing history
- Contacts
- Advertising identifiers (IDFA — not used)
- Clipboard content

### Required Apple Privacy Manifest (PrivacyInfo.xcprivacy)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeName</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeEmailAddress</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

---

## REQUIRED iOS PERMISSIONS (Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>Hirrd needs camera access to take a passport-size profile photo. This is optional — you can skip this.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Hirrd needs photo library access to select a profile photo or upload your CV document.</string>
<key>NSFaceIDUsageDescription</key>
<string>Hirrd uses Face ID to secure your account. You can also use your passcode.</string>
<key>NSLocalNetworkUsageDescription</key>
<string>Hirrd may use local network access for debugging purposes only. This is not used in production.</string>
```

**IMPORTANT:** Request permissions at point of use, not at app launch.
Camera: only when user clicks "Upload photo"
FaceID: only when user enables biometric lock in settings

---

## GOOGLE PLAY — DATA SAFETY FORM

### Data collected and shared
| Category | Data type | Collected | Shared | Encrypted | Optional |
|----------|-----------|-----------|--------|-----------|----------|
| Personal info | Name | ✓ | ✗ | ✓ | ✗ |
| Personal info | Email | ✓ | ✗ | ✓ | ✗ |
| Personal info | Phone number | ✓ | ✗ | ✓ | ✓ |
| Personal info | Profile photo | ✓ | ✓ | ✓ | ✓ |
| Personal info | CV/Resume | ✓ | ✓ | ✓ | ✗ |
| Location | Approximate location | ✓ | ✗ | ✓ | ✗ |

### Data sharing disclosures
- CV content is shared with AI service (Anthropic) for parsing — disclosed in app
- Verified employer details shared with matched candidates
- No data sold to third parties
- No advertising networks

### Android permissions required
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<!-- Optional — only if implementing push notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<!-- Optional — document upload -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<!-- Camera — for profile photo (request at point of use) -->
<uses-permission android:name="android.permission.CAMERA" />
<!-- Biometric -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<!-- Fingerprint (API 23-27 compat) -->
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

---

## POPIA COMPLIANCE CHECKLIST (SA-specific)

- [x] Registration form has explicit POPIA consent
- [x] ToS + Privacy Policy links visible before data collection
- [x] Marketing consent separate from core ToS (unchecked by default)
- [x] Photo upload gated behind POPIA s.26 explicit consent (feature flag: OFF)
- [x] POPIA s.26 language: "⚠️ Requires SA attorney review before enabling"
- [x] Account deletion endpoint clears all data (POPIA s.24 right to erasure)
- [x] CV stored privately (Supabase Storage — no public access)
- [x] WhatsApp STOP handler: opt-out confirmed and logged
- [x] notification_log maintained for audit trail
- [x] No sensitive data in logs or Sentry events
- [ ] Information officer registered with Information Regulator SA — KK action
- [ ] PAIA manual published — KK action
- [ ] s.26 photo consent language reviewed by SA POPIA attorney — KK action

---

## USER CONSENT FLOWS

### Registration Consent Flow
```
1. User fills in name/email/password
2. Optional: SA mobile for WhatsApp alerts
   └─► WhatsApp opt-in checkbox (default: ON, with explanation)
   └─► SMS backup checkbox (default: ON)
3. Required: [_] I agree to Terms + Privacy Policy (cannot register without)
4. Optional: [_] Marketing updates (default: OFF, POPIA compliant)
5. Submit
```

### Photo Upload Consent (when feature-flagged ON)
```
1. User navigates to Profile > Add Photo
2. Full-screen consent modal appears:
   "Your photo is special personal information under POPIA s.26.
    It will only be shared with verified SA employers reviewing
    your application. You can remove it at any time."
3. Two buttons: [I understand, continue] [Not now]
4. Consent timestamp stored in DB
5. Photo upload only proceeds after explicit consent
```

### Data Deletion Flow (POPIA s.24)
```
1. Profile > Delete account
2. Warning: "This permanently deletes your CV, profile, and all data"
3. Confirmation: "Yes, delete everything" (red button)
4. API call: DELETE /api/account/delete
   - Storage: cvs/[userId]/* deleted
   - Storage: candidate-photos/[userId]/* deleted
   - DB: profiles row deleted (cascades to candidates, applications)
   - Auth: user deleted from Supabase auth
5. Redirect to /
```
