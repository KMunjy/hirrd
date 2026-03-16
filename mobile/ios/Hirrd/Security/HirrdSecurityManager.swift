//
// HirrdSecurityManager.swift
// Hirrd — Career Intelligence | South Africa
//
// OWASP Mobile Top 10 compliance
// iOS 16+ | Swift 5.9+
// Enterprise security standards

import Foundation
import Security
import CryptoKit
import LocalAuthentication
import UIKit
import OSLog

// MARK: - Security Logger (structured, no PII)
private let secLog = Logger(subsystem: "com.hirrd.app", category: "Security")

// MARK: - Keychain Manager (M1: Secure Credential Storage)
/// Replaces UserDefaults/localStorage for all sensitive data
/// OWASP M1 — Improper Credential Usage: mitigated
/// OWASP M9 — Insecure Data Storage: mitigated
final class KeychainManager {
    static let shared = KeychainManager()
    private let service = "com.hirrd.app"
    private init() {}

    enum KeychainKey: String {
        case accessToken    = "hirrd.access_token"
        case refreshToken   = "hirrd.refresh_token"
        case userID         = "hirrd.user_id"
        case biometricToken = "hirrd.biometric_token"
    }

    enum KeychainError: Error {
        case unhandledError(status: OSStatus)
        case noData
        case unexpectedData
    }

    // Store with biometric protection option
    func store(key: KeychainKey, value: String, requireBiometric: Bool = false) throws {
        guard let data = value.data(using: .utf8) else { return }

        var query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: key.rawValue,
            kSecValueData: data,
            kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly, // Not backed up to iCloud
        ]

        if requireBiometric {
            let access = SecAccessControlCreateWithFlags(
                nil,
                kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
                .biometryCurrentSet, // Invalidates if biometric changes
                nil
            )!
            query[kSecAttrAccessControl] = access
        }

        // Delete existing before insert (update pattern)
        SecItemDelete(query as CFDictionary)

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            secLog.error("Keychain store failed: \(status)")
            throw KeychainError.unhandledError(status: status)
        }
    }

    func retrieve(key: KeychainKey) throws -> String {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: key.rawValue,
            kSecReturnData: true,
            kSecMatchLimit: kSecMatchLimitOne,
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess else { throw KeychainError.noData }
        guard let data = item as? Data, let value = String(data: data, encoding: .utf8) else {
            throw KeychainError.unexpectedData
        }
        return value
    }

    func delete(key: KeychainKey) {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: key.rawValue,
        ]
        SecItemDelete(query as CFDictionary)
    }

    func clearAll() {
        KeychainKey.allCases.forEach { delete(key: $0) }
        secLog.info("Keychain cleared — user session wiped")
    }
}

extension KeychainManager.KeychainKey: CaseIterable {}

// MARK: - Jailbreak Detection (OWASP M8)
/// Detects common jailbreak indicators
/// Not foolproof — defence in depth strategy
enum JailbreakDetector {
    static func isJailbroken() -> Bool {
        #if targetEnvironment(simulator)
        return false // Simulators always "fail" checks
        #else
        return checkSuspiciousPaths() || checkSchemeURLs() || checkDyldBinaries() || checkFork()
        #endif
    }

    private static func checkSuspiciousPaths() -> Bool {
        let paths = [
            "/Applications/Cydia.app",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",
            "/bin/bash", "/usr/sbin/sshd", "/etc/apt",
            "/private/var/lib/apt/",
            "/private/var/stash",
        ]
        return paths.contains { FileManager.default.fileExists(atPath: $0) }
    }

    private static func checkSchemeURLs() -> Bool {
        let schemes = ["cydia://", "sileo://", "zbra://"]
        return schemes.contains { URL(string: $0).flatMap { UIApplication.shared.canOpenURL($0) } ?? false }
    }

    private static func checkDyldBinaries() -> Bool {
        // Check for substrate injection
        let count = _dyld_image_count()
        for i in 0..<count {
            if let name = _dyld_get_image_name(i) {
                let imageName = String(cString: name)
                if imageName.contains("MobileSubstrate") || imageName.contains("substrate") {
                    return true
                }
            }
        }
        return false
    }

    private static func checkFork() -> Bool {
        let pid = fork()
        if pid >= 0 {
            if pid > 0 { kill(pid, SIGTERM) }
            return true // fork succeeded — jailbroken
        }
        return false
    }
}

// MARK: - Certificate Pinning (OWASP M3)
/// URLSession delegate for certificate pinning
/// Pins both Supabase and Vercel/Hirrd API endpoints
final class HirrdURLSessionDelegate: NSObject, URLSessionDelegate {
    // SHA-256 hashes of the public keys of pinned certificates
    // Update these when certificates are rotated (CRITICAL)
    private let pinnedHashes: [String: Set<String>] = [
        "hirrd-web.vercel.app": [
            // Replace with actual SHA-256 of Vercel's certificate public key
            "PLACEHOLDER_VERCEL_CERT_HASH_SHA256",
        ],
        "nzanxokgpfurtkrvjfhw.supabase.co": [
            // Replace with actual SHA-256 of Supabase's certificate public key
            "PLACEHOLDER_SUPABASE_CERT_HASH_SHA256",
        ],
    ]

    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let serverTrust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            secLog.warning("Certificate challenge failed — unexpected auth method")
            return
        }

        let host = challenge.protectionSpace.host
        guard let expectedHashes = pinnedHashes[host] else {
            // Not a pinned host — use default validation
            completionHandler(.performDefaultHandling, nil)
            return
        }

        // Validate certificate chain
        let policy = SecPolicyCreateSSL(true, host as CFString)
        SecTrustSetPolicies(serverTrust, policy)

        var error: CFError?
        guard SecTrustEvaluateWithError(serverTrust, &error) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            secLog.error("TLS validation failed for \(host)")
            return
        }

        // Extract and hash the leaf certificate's public key
        guard let leafCert = SecTrustGetCertificateAtIndex(serverTrust, 0),
              let publicKey = SecCertificateCopyKey(leafCert),
              let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, nil) as Data? else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        let hash = SHA256.hash(data: publicKeyData).map { String(format: "%02x", $0) }.joined()
        
        if expectedHashes.contains(hash) {
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            secLog.critical("Certificate pin mismatch for \(host) — possible MITM attack")
            completionHandler(.cancelAuthenticationChallenge, nil)
            // In production: report to Sentry, lock app, force update
        }
    }
}

// MARK: - Biometric Authentication
final class BiometricAuth {
    static func authenticate(reason: String) async -> Bool {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            secLog.info("Biometrics unavailable — falling back to passcode")
            return await authenticateWithPasscode(context: context)
        }
        do {
            return try await context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason)
        } catch {
            secLog.error("Biometric auth failed: \(error.localizedDescription)")
            return false
        }
    }

    private static func authenticateWithPasscode(context: LAContext) async -> Bool {
        do {
            return try await context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "Confirm your identity")
        } catch {
            return false
        }
    }
}

// MARK: - Session Manager (OWASP M4 — Insecure Authentication)
/// Handles token refresh and session expiry
/// 30-minute idle timeout for sensitive operations
final class SessionManager: ObservableObject {
    static let shared = SessionManager()
    private let idleTimeout: TimeInterval = 30 * 60 // 30 minutes
    private var lastActivity = Date()
    private var refreshTimer: Timer?
    @Published var isSessionValid = false

    private init() {}

    func recordActivity() {
        lastActivity = Date()
    }

    var isIdle: Bool {
        Date().timeIntervalSince(lastActivity) > idleTimeout
    }

    func startSessionMonitor() {
        refreshTimer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { [weak self] _ in
            Task { @MainActor in
                if self?.isIdle == true {
                    self?.expireSession()
                }
            }
        }
    }

    func expireSession() {
        KeychainManager.shared.clearAll()
        isSessionValid = false
        secLog.info("Session expired due to inactivity")
        NotificationCenter.default.post(name: .sessionExpired, object: nil)
    }
}

extension Notification.Name {
    static let sessionExpired = Notification.Name("hirrd.session.expired")
}
