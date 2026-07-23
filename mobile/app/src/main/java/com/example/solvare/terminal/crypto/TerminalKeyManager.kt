package com.example.solvare.terminal.crypto

import android.content.Context
import android.content.SharedPreferences
import android.util.Base64
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.example.solvare.util.Base58
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters
import org.bouncycastle.crypto.signers.Ed25519Signer
import java.security.SecureRandom

class TerminalKeyManager(context: Context) {

    private val prefs: SharedPreferences = run {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            "solwear_wallet_keys",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    private var privateKey: Ed25519PrivateKeyParameters? = null
    private var publicKey: Ed25519PublicKeyParameters? = null

    init {
        loadOrGenerate()
    }

    val publicKeyBytes: ByteArray
        get() = publicKey!!.encoded

    val publicKeyBase58: String
        get() = Base58.encode(publicKeyBytes)

    fun sign(message: ByteArray): ByteArray {
        val signer = Ed25519Signer()
        signer.init(true, privateKey)
        signer.update(message, 0, message.size)
        return signer.generateSignature()
    }

    fun resetKeys() {
        prefs.edit().clear().apply()
        loadOrGenerate()
    }

    private fun loadOrGenerate() {
        val storedSeed = prefs.getString(KEY_SEED, null)
        if (storedSeed != null) {
            val seed = Base64.decode(storedSeed, Base64.NO_WRAP)
            privateKey = Ed25519PrivateKeyParameters(seed, 0)
            publicKey = privateKey!!.generatePublicKey()
        } else {
            val seed = ByteArray(32)
            SecureRandom().nextBytes(seed)
            privateKey = Ed25519PrivateKeyParameters(seed, 0)
            publicKey = privateKey!!.generatePublicKey()
            prefs.edit()
                .putString(KEY_SEED, Base64.encodeToString(seed, Base64.NO_WRAP))
                .apply()
        }
    }

    companion object {
        private const val KEY_SEED = "ed25519_seed"
    }
}
