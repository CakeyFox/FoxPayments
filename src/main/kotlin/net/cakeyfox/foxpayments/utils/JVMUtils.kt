package net.cakeyfox.foxpayments.utils

import net.cakeyfox.foxpayments.FoxPaymentsLauncher
import java.io.File

fun copyFromJar(input: String, output: String) {
    val inputStream = FoxPaymentsLauncher::class.java.getResourceAsStream(input) ?: return
    File(output).writeBytes(inputStream.readAllBytes())
}