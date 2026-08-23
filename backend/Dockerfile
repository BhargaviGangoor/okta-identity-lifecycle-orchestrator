# Stage 1: Build the Spring Boot application using Maven & Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 17 runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/identity-orchestrator-backend-0.0.1-SNAPSHOT.jar app.jar

ENV SERVER_PORT=8080
ENV API_CONTEXT_PATH=/api
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
