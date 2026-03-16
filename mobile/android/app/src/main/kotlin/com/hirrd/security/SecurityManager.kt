package com.hirrd.security

/**
 * HirrdSecurityManager.kt
 * Hirrd — Career Intelligence | South Africa
 *
 * Android security implementation
 * OWASP Mobile Top 10 compliance
 * Android 8+ (API 26+) | Kotlin 1.9+
 */

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.io.File
import java.security.KeyStore
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import timber.log.Timber

// ── OWASP M9: Insecure Data Storage — mitigated via EncryptedSharedPreferences ──

/**
 * Secure storage backed by Android Keystore
 * Replaces SharedPreferences for all sensitive data
 */
object SecureStorage {
    private const val PREFS_FILE = "hirrd_secure_prefs"
    private var prefs: androidx.security.crypto.EncryptedSharedPreferences? = null

    fun init(context: Context) {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .setUserAuthenticationRequired(false) // Set true for biometric-only access
            .build()

        prefs = EncryptedSharedPreferences.create(
            context,
            PREFS_FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        ) as EncryptedSharedPreferences
    }

    fun put(key: Keys, value: String) = prefs?.edit()?.putString(key.name, value)?.apply()
    fun get(key: Keys): String? = prefs?.getString(key.name, null)
    fun remove(key: Keys) = prefs?.edit()?.remove(key.name)?.apply()
    fun clearAll() {
        prefs?.edit()?.clear()?.apply()
        Timber.i("SecureStorage cleared — session wiped")
    }

    enum class Keys {
        ACCESS_TOKEN,
        REFRESH_TOKEN,
        USER_ID,
        BIOMETRIC_TOKEN,
    }
}

// ── OWASP M8: Security Misconfiguration — Root Detection ──

object RootDetector {
    fun isRooted(): Boolean {
        return checkSuBinaries() ||
            checkSystemProperties() ||
            checkDangerousProps() ||
            checkWritableSystemDirs() ||
            checkInstalledApps()
    }

    private fun checkSuBinaries(): Boolean {
        val paths = arrayOf(
            "/system/bin/su", "/system/xbin/su",
            "/sbin/su", "/system/app/Superuser.apk",
            "/data/local/tmp/su", "/system/bin/.ext/.su",
            "/system/etc/.installed_su_daemon",
        )
        return paths.any { File(it).exists() }
    }

    private fun checkSystemProperties(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("/system/xbin/which", "su"))
            val input = process.inputStream.bufferedReader().readText()
            input.isNotEmpty()
        } catch (e: Exception) {
            false
        }
    }

    private fun checkDangerousProps(): Boolean {
        val props = mapOf(
            "ro.debuggable" to "1",
            "service.adb.root" to "1",
        )
        return props.any { (key, value) ->
            try {
                val process = Runtime.getRuntime().exec(arrayOf("getprop", key))
                process.inputStream.bufferedReader().readText().trim() == value
            } catch (e: Exception) { false }
        }
    }

    private fun checkWritableSystemDirs(): Boolean {
        val dirs = arrayOf("/system", "/system/bin", "/system/sbin", "/system/xbin")
        return dirs.any { path ->
            val file = File(path)
            file.exists() && file.canWrite()
        }
    }

    private fun checkInstalledApps(): Boolean {
        val rootApps = listOf(
            "com.noshufou.android.su",
            "com.thirdparty.superuser",
            "eu.chainfire.supersu",
            "com.topjohnwu.magisk",
            "io.github.vvb2060.magisk",
        )
        // Check via package manager would need Context — simplified version
        return false // Extend with PackageManager in full implementation
    }
}

// ── OWASP M3: Insecure Communication — Certificate Pinning ──

/**
 * OkHttp CertificatePinner configuration
 * Call HirrdCertPinner.buildPinner() when creating OkHttpClient
 */
object HirrdCertPinner {
    /**
     * SHA-256 hashes of public keys for pinned certificates
     * CRITICAL: Update these when certificates rotate
     * Run: openssl s_client -connect hirrd-web.vercel.app:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
     */
    private val PINS = mapOf(
        "hirrd-web.vercel.app" to listOf(
            "sha256/PLACEHOLDER_VERCEL_PIN_BASE64==",    // Primary
            "sha256/PLACEHOLDER_VERCEL_BACKUP_BASE64==", // Backup
        ),
        "nzanxokgpfurtkrvjfhw.supabase.co" to listOf(
            "sha256/PLACEHOLDER_SUPABASE_PIN_BASE64==",
            "sha256/PLACEHOLDER_SUPABASE_BACKUP_BASE64==",
        )
    )

    fun buildPinner(): okhttp3.CertificatePinner {
        val builder = okhttp3.CertificatePinner.Builder()
        PINS.forEach { (hostname, pins) ->
            pins.forEach { pin -> builder.add(hostname, pin) }
        }
        return builder.build()
    }
}

// ── Session Management ──

object SessionManager {
    private const val IDLE_TIMEOUT_MS = 30 * 60 * 1000L // 30 minutes
    private var lastActivityMs = System.currentTimeMillis()
    private var onSessionExpired: (() -> Unit)? = null

    fun recordActivity() {
        lastActivityMs = System.currentTimeMillis()
    }

    fun setExpiredCallback(callback: () -> Unit) {
        onSessionExpired = callback
    }

    val isIdle: Boolean
        get() = System.currentTimeMillis() - lastActivityMs > IDLE_TIMEOUT_MS

    fun checkSession() {
        if (isIdle) {
            expireSession()
        }
    }

    fun expireSession() {
        SecureStorage.clearAll()
        Timber.i("Session expired — inactivity timeout")
        onSessionExpired?.invoke()
    }
}
