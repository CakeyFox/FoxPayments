plugins {
    kotlin("jvm") version "2.2.20"
    kotlin("plugin.serialization") version "2.2.20"
    id("com.github.johnrengelman.shadow") version "7.0.0"
}

group = "net.cakeyfox"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
    mavenLocal()
    maven("https://jitpack.io")
}

dependencies {
    implementation("com.mercadopago:sdk-java:2.5.0") {
        exclude(group = "com.google.collections", module = "google-collections")
    }
    implementation("net.cakeyfox.foxy:DatabaseUtils:1.0")
//    implementation("com.github.CakeyFox:DatabaseUtils:1.2.4")
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.3.3")
    implementation("io.ktor:ktor-client-core:3.2.2")
    implementation("io.ktor:ktor-client-cio:3.2.2")
    implementation("io.ktor:ktor-client-content-negotiation:3.2.2")
    implementation("io.ktor:ktor-serialization-kotlinx-json:3.2.2")
    implementation("io.ktor:ktor-htmx:3.2.2")
    implementation("io.ktor:ktor-htmx-html:3.2.2")
    implementation("io.ktor:ktor-server-htmx:3.2.2")
    implementation("io.ktor:ktor-server-auth:3.2.2")
    implementation("io.ktor:ktor-server-cio:3.2.2")
    implementation("io.ktor:ktor-server-netty:3.2.2")
    implementation("io.ktor:ktor-server-core:3.2.2")
    implementation("io.ktor:ktor-client-content-negotiation:3.2.2")
    implementation("io.ktor:ktor-server-content-negotiation:3.2.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-hocon:1.8.1")
    implementation("io.github.microutils:kotlin-logging:2.1.23")
    implementation("com.google.guava:guava:33.5.0-jre")
}

tasks {
    shadowJar {
        archiveBaseName.set("FoxPayments")
        archiveVersion.set(version.toString())
        archiveClassifier.set("")

        manifest {
            attributes["Main-Class"] = "net.cakeyfox.foxpayments.FoxPaymentsLauncher"
        }
    }
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(21)
}