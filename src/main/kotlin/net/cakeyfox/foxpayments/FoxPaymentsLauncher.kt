package net.cakeyfox.foxpayments

import kotlinx.io.IOException
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.hocon.Hocon
import net.cakeyfox.foxpayments.utils.FoxPaymentsSettings
import net.cakeyfox.foxpayments.utils.HoconUtils.decodeFromString
import net.cakeyfox.foxpayments.utils.checkConfigFile
import java.io.File
import kotlin.system.exitProcess

@OptIn(ExperimentalSerializationApi::class)
val HOCON = Hocon { useArrayPolymorphism = true }

object FoxPaymentsLauncher {
    @JvmStatic
    fun main(args: Array<String>) {
        val configFile = checkConfigFile()
        val config = readConfigFile<FoxPaymentsSettings>(configFile)

        FoxPaymentsInstance(config)
    }

    @OptIn(ExperimentalSerializationApi::class)
    inline fun <reified T> readConfigFile(file: File): T {
        try {
            val json = file.readText()
            return HOCON.decodeFromString<T>(json)
        } catch (e: IOException) {
            e.printStackTrace()
            exitProcess(1)
        }
    }
}