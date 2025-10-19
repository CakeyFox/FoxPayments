package net.cakeyfox.foxpayments.utils

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.html.MetaHttpEquiv.contentType
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject

object FoxyClusterUtils {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                ignoreUnknownKeys = true
                encodeDefaults = true
            })
        }
    }

    suspend fun relayMessageToMasterCluster(userId: String, message: RelayMessage.() -> Unit) {
        val msg = RelayMessage().apply(message)
        client.post("http://localhost:3000/api/v1/users/$userId/send") {
            header("Authorization", "Bearer senhasupersecreta")

            contentType(ContentType.Application.Json)

            setBody(msg)
        }
    }
}