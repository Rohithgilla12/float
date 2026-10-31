# 💰 Monetization Strategy & Apple Signing Guide

## 1. The $4.99 One-Time License Strategy

### Why $4.99 is the Perfect Price Point

| Dimension | $4.99 One-Time Lifetime License (Recommended) | $4/Month Subscription | Free with Donation |
| :--- | :--- | :--- | :--- |
| **Buyer Friction** | **Zero / Impulse Buy** (Under $5 requires no thought) | High (Users cancel or refuse recurring charges for utility apps) | Very high (Less than 0.5% donate) |
| **User Goodwill** | **Extremely High** ("Fair pricing, no SaaS greed") | Low / Fatigue ("Another subscription for notes?!") | Moderate |
| **Cashflow** | **Instant upfront revenue** to fund development & Apple dev fees | Slow trickle with high churn | Negligible |
| **Market Precedent** | **Maccy ($9.99)**, **Shottr ($10)**, **Boop (Free + $4.99 Mac App Store)** | Routine failure for single-purpose utilities | Unsustainable |

---

### The Open Source + Commercial Distribution Playbook (The "Maccy / Shottr" Model)

You asked: **"Can we open source the repo AND sell it for $4.99?"**

**YES! In fact, this is the most successful playbook in the macOS developer community.**

#### How It Works:
1. **GitHub Repository is Open Source (MIT License)**:
   - Builds developer trust and community momentum.
   - Developers star, audit, submit PRs, and report bugs.
   - Showcases your engineering craft to hiring managers, users, and the tech community on Twitter/X.
2. **Pre-Built, Signed & Notarized `.dmg` is Sold for $4.99**:
   - 98% of users do not have Node, Rust, Xcode, and Tauri installed, nor do they want to compile from source.
   - macOS Gatekeeper automatically blocks unsigned community builds with scary warnings (*"App cannot be opened because Apple cannot verify..."*).
   - Users happily pay $4.99 for a one-click signed `.dmg` that auto-updates cleanly.

#### Best Merchant Platforms to Sell For $4.99:
1. **Lemon Squeezy** *(Recommended)*:
   - Built specifically for digital software & desktop licenses.
   - Acts as **Merchant of Record (MoR)**: Handles all global sales taxes, EU VAT, and invoicing automatically.
   - Provides a built-in License Key generation API if you want to gate any features or just issue license receipts.
   - Takes ~5% + $0.50 per transaction.
2. **Gumroad**:
   - Very popular, but higher fees (10% flat).
3. **Mac App Store**:
   - High discovery, but Apple takes 15% (Small Business Program) and requires sandboxing compliance.

---

## 2. Apple Code Signing & Notarization Architecture

To distribute a native macOS app outside the App Store without Gatekeeper warnings, Apple requires two steps:
1. **Code Signing**: Signing your `.app` with an Apple **Developer ID Application** certificate.
2. **Notarization**: Uploading your app bundle to Apple's **Notary Service**, which scans it for malware and attaches an authentic cryptographic "staple" ticket.

---

### Step-by-Step Apple Signing Setup

#### Step 1: Join Apple Developer Program
- Enroll at [developer.apple.com/programs](https://developer.apple.com/programs/) ($99/year).
- Note your 10-character **Team ID** (e.g. `ABC1234XYZ`).

#### Step 2: Create Developer ID Application Certificate
1. Open **Keychain Access** on your Mac.
2. Go to **Keychain Access &rarr; Certificate Assistant &rarr; Request a Certificate from a Certificate Authority...**
3. Save the `.certSigningRequest` file to disk.
4. Go to [developer.apple.com &rarr; Certificates](https://developer.apple.com/account/resources/certificates/list).
5. Click **+** and choose **Developer ID Application**.
6. Upload the CSR and download the `.cer` file.
7. Double-click the downloaded certificate to install it in your Keychain.
8. Verify your certificate name in Terminal:
   ```bash
   security find-identity -v -p codesigning
   # Output: "Developer ID Application: Your Name (ABC1234XYZ)"
   ```

#### Step 3: Create an App-Specific Password for Notarization
1. Log in to [appleid.apple.com](https://appleid.apple.com).
2. Go to **Sign-In and Security &rarr; App-Specific Passwords**.
3. Generate a password labeled `tauri-notary` (e.g., `abcd-efgh-ijkl-mnop`).

---

### Local Production Build & Sign (macOS)

Set environment variables in your local terminal:
```bash
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (ABC1234XYZ)"
export APPLE_ID="your-apple-id@email.com"
export APPLE_PASSWORD="abcd-efgh-ijkl-mnop"
export APPLE_TEAM_ID="ABC1234XYZ"

npm run tauri build
```
Tauri v2 will automatically:
1. Compile your optimized release binary.
2. Sign the `.app` using `src-tauri/entitlements.plist` with Hardened Runtime enabled.
3. Package it into a `.dmg`.
4. Upload to Apple's `notarytool`, wait for approval, and staple the ticket!

The resulting `.dmg` in `src-tauri/target/release/bundle/dmg/` can be uploaded directly to **Lemon Squeezy** or **Gumroad** for customers!

---

### Automated GitHub Actions CI/CD Pipeline

We have configured [`.github/workflows/release.yml`](.github/workflows/release.yml).

To enable 1-click releases:
1. Export your Developer ID Certificate from Keychain Access as a `.p12` file.
2. Base64-encode it:
   ```bash
   base64 -i Certificate.p12 | pbcopy
   ```
3. Add the following **Secrets** in your GitHub repository (**Settings &rarr; Secrets and variables &rarr; Actions**):
   - `APPLE_CERTIFICATE`: *(pasted base64 string)*
   - `APPLE_CERTIFICATE_PASSWORD`: *(password you set on the .p12)*
   - `APPLE_SIGNING_IDENTITY`: `"Developer ID Application: Your Name (ABC1234XYZ)"`
   - `APPLE_ID`: `your-email@example.com`
   - `APPLE_PASSWORD`: `abcd-efgh-ijkl-mnop`
   - `APPLE_TEAM_ID`: `ABC1234XYZ`

Whenever you push a tag:
```bash
git tag v0.1.0
git push origin v0.1.0
```
GitHub Actions will automatically build, sign with Apple Developer ID, notarize with Apple, and generate a downloadable `.dmg` release!
