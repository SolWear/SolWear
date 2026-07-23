package com.example.solvare.data

import com.example.solvare.data.price.PriceApi
import com.example.solvare.data.price.PriceRepository
import com.example.solvare.data.solana.SolanaRepository
import com.example.solvare.data.solana.SolanaRpcApi
import com.example.solvare.BuildConfig
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import java.io.IOException
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        // JSON-RPC: поля jsonrpc / id с дефолтами должны попадать в тело запроса
        encodeDefaults = true
    }

    private fun responseWithJsonBody(response: Response, json: String): Response {
        val mediaType = "application/json; charset=utf-8".toMediaType()
        return response.newBuilder().body(json.toResponseBody(mediaType)).build()
    }

    /**
     * Тело читается один раз и подставляется заново (иначе конвертер Retrofit падает на EOF).
     * Для **Solana** при пустом успешном теле подставляем `{}`, чтобы не ловить англ. «empty response»
     * от парсера; дальше [SolanaRepository] вернёт понятную ошибку про отсутствие `result`.
     */
    private val rewriteResponseBodyInterceptor = Interceptor { chain ->
        val request = chain.request()
        val response = chain.proceed(request)
        val host = request.url.host
        val solanaJsonRpc = host.contains("solana", ignoreCase = true)

        val body = response.body
        if (body == null) {
            if (response.isSuccessful && solanaJsonRpc) {
                return@Interceptor responseWithJsonBody(response, "{}")
            }
            return@Interceptor response
        }

        val text = try {
            body.string()
        } catch (_: Exception) {
            return@Interceptor response
        }

        if (text.isBlank()) {
            if (response.isSuccessful && solanaJsonRpc) {
                return@Interceptor responseWithJsonBody(response, "{}")
            }
            throw IOException(
                "Порожня відповідь сервера (HTTP ${response.code}). Повторіть запит пізніше."
            )
        }

        val mediaType = body.contentType() ?: "application/json; charset=utf-8".toMediaType()
        response.newBuilder().body(text.toResponseBody(mediaType)).build()
    }

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .apply {
                if (BuildConfig.DEBUG) {
                    addInterceptor(HttpLoggingInterceptor().apply {
                        level = HttpLoggingInterceptor.Level.BODY
                    })
                }
            }
            .addInterceptor(rewriteResponseBodyInterceptor)
            .build()
    }

    private val contentType = "application/json".toMediaType()

    val solanaApi: SolanaRpcApi by lazy {
        Retrofit.Builder()
            .baseUrl(SolanaRepository.DEVNET_URL_PRIMARY)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(SolanaRpcApi::class.java)
    }

    val priceApi: PriceApi by lazy {
        Retrofit.Builder()
            .baseUrl(PriceRepository.COINGECKO_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(PriceApi::class.java)
    }

    val solanaRepository: SolanaRepository by lazy { SolanaRepository(solanaApi) }
    val priceRepository: PriceRepository by lazy { PriceRepository(priceApi) }
}
