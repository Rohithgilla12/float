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
1. **Dodo Payments** *(Configured & Built-in)*:
   - Modern, developer-first Merchant of Record (MoR) with global tax & VAT compliance.
   - Built-in **License Keys** engine: automatically generates cryptographic license keys on checkout and delivers them to buyers via email.
   - **Public Client API**: desktop apps can call `https://live.dodopayments.com/licenses/activate` directly without leaking secret API tokens.
   - Low transaction fees, instant checkout links, and clean dashboard.
2. **Gumroad / Lemon Squeezy**:
   - Alternative options, but Dodo Payments provides the fastest license validation and native developer API.
3. **Mac App Store**:
   - High discovery, but Apple takes 15% (Small Business Program) and requires sandboxing compliance.

---

## 2. Dodo Payments Setup & Integration Guide

FloatNotes includes a complete, out-of-the-box integration with Dodo Payments in [`src/utils/license.ts`](file:///Users/rohithgilla/github.com/float-notes/src/utils/license.ts) and [`src/components/LicenseModal.tsx`](file:///Users/rohithgilla/github.com/float-notes/src/components/LicenseModal.tsx).

### Step 1: Create Product in Dodo Payments
1. Log in to your [Dodo Payments Dashboard](https://app.dodopayments.com).
2. Go to **Products &rarr; Add Product**.
3. Fill in:
   - **Name**: `FloatNotes Pro Lifetime`
   - **Type**: One-Time Payment
   - **Price**: `$4.99 USD`
   - **Description**: `Lifetime license for FloatNotes on macOS with Apple notarized binaries and automatic updates.`
4. Under **License Keys**:
   - Toggle **Enable License Keys** to `ON`.
   - Set **Max Activations per Key**: `3` (allows users to activate on their MacBook and desktop iMac).
5. Copy your **Checkout Link** (e.g., `https://checkout.dodopayments.com/buy/pdt_yourproductid`).

### Step 2: Configure Checkout Link in FloatNotes
In [`src/utils/license.ts`](file:///Users/rohithgilla/github.com/float-notes/src/utils/license.ts):
```ts
export const DODO_CHECKOUT_URL = 'https://checkout.dodopayments.com/buy/pdt_yourproductid';
```

### Step 3: How License Verification Works
When a customer buys on Dodo Payments:
1. Dodo automatically generates a license key (e.g. `LK-9B8A-77C1-...`) and emails it to the customer.
2. Customer clicks **PRO** in the header or **⌘K &rarr; Enter License Key...** in FloatNotes.
3. The app sends a `POST` request to `https://live.dodopayments.com/licenses/activate`:
   ```json
   {
     "license_key": "LK-9B8A-77C1-...",
     "name": "macOS FloatNotes Device"
   }
   ```
4. Dodo responds with confirmation and an `instance_id`.
5. The license is cached in `localStorage` with offline resilience so users can take notes without internet.

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

Whenever you push a tag (`just release patch` does this for you):
```bash
git tag v0.1.0
git push origin v0.1.0
```
GitHub Actions will automatically build, sign with Apple Developer ID, notarize with Apple, and generate a downloadable `.dmg` release!

---

## 3. Release credentials inventory (no secret values here)

| What | Where it lives | Used by |
| :--- | :--- | :--- |
| Developer ID Application certificate, Rohith Gilla (7D2V3RM56T) | macOS login keychain on the dev Mac; exported copy in GitHub secrets `APPLE_CERTIFICATE` + `APPLE_CERTIFICATE_PASSWORD` | Code signing in CI and local `tauri build` |
| Apple ID for notarisation | gillarohith@gmail.com. App-specific password `float-notary` in 1Password and in GitHub secret `APPLE_PASSWORD`; keychain profile `float-notary` on the dev Mac (`xcrun notarytool --keychain-profile float-notary`) | Notarisation in CI and locally |
| Updater signing keypair | `~/.tauri/float-updater.key` (private, no password) and `.key.pub` on the dev Mac; private key in GitHub secret `TAURI_SIGNING_PRIVATE_KEY`; public key in `src-tauri/tauri.conf.json` | Signing `latest.json` so installed apps trust updates |
| Team ID and identity string | GitHub secrets `APPLE_TEAM_ID`, `APPLE_SIGNING_IDENTITY` | CI |

Backup: 1Password item "Float release credentials" in the Employee vault of fusang.1password.com holds the Developer-ID-only p12 and its password (identical to the GitHub secrets), both updater key files, and the identity, team, and Apple ID. Restore steps are in the item's notes. Never regenerate the updater key: installed apps only accept updates signed by it.

Release: `just release patch` (or `minor`, `major`, `X.Y.Z`) bumps the version in every manifest and lockfile, commits, tags `vX.Y.Z`, and pushes; the workflow then drafts the GitHub release. `just publish` waits for that build, checks the feed version, notarisation, and Gatekeeper, and publishes the draft to go live. `just ship patch` does both.
