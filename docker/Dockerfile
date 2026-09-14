FROM eclipse-temurin:25-jdk

ARG BUILD_NUMBER
ARG COMMIT_HASH

ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV COMMIT_HASH=${COMMIT_HASH}

WORKDIR /app

COPY build/libs/FoxPayments-*.jar FoxPayments.jar

ENV JAVA_OPTS="-Xms2G -Xmx4G"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar FoxPayments.jar"]