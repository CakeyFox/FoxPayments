package net.cakeyfox.foxpayments.utils

import java.io.File
import kotlin.system.exitProcess

fun checkConfigFile(): File {
    val configFile = File(System.getProperty("conf") ?: "./settings.conf")

    if (!configFile.exists()) {
        println(
            """                            
                   Welcome to FoxPayments!

     I created a config file for you, called "settings.conf"!
     You need to configure me before you can run anything!

     Please edit the file and then run me again!
"""
        )

        copyFromJar("/settings.conf", "./settings.conf")
        exitProcess(1)

    } else return configFile
}