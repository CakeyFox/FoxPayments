package net.cakeyfox.foxpayments.utils

import kotlinx.serialization.Serializable

@Serializable
data class RelayMessage(
    var content: String? = null,
    var embeds: List<RelayEmbed>? = null
)

@Serializable
data class RelayEmbed(
    var title: String? = null,
    var description: String? = null,
    var url: String? = null,
    var color: Int? = null,
    var timestamp: String? = null,
    var footer: RelayEmbedFooter? = null,
    var author: RelayEmbedAuthor? = null,
    var fields: List<RelayEmbedField>? = null
)

@Serializable
data class RelayEmbedFooter(var text: String, var icon_url: String? = null)

@Serializable
data class RelayEmbedAuthor(var name: String, var url: String? = null, var icon_url: String? = null)

@Serializable
data class RelayEmbedField(var name: String, var varue: String, var inline: Boolean = false)
