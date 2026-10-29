# Student Management - Microservice Architecture (Spring Boot + Eureka + API Gateway + JWT)

```
 Browser (frontend :5500)
        |
        v
 api-gateway :8080  ----- looks up services in ----->  service-registry (Eureka) :8761
   |  JwtValidationFilter                                    ^        ^
   |  /api/auth/**     -> lb://auth-service ----------------+        |
   |  /api/students/** -> lb://student-service ---------------------+
   v                                    v
 auth-service :9001                student-service :9002
 DB: auth_db                       DB: student_db
 (users, blacklisted_tokens)       (students)
```

| Project | Port | Job |
|---|---|---|
| service-registry | 8761 | Eureka Server. Every service registers here; dashboard at http://localhost:8761 |
| auth-service | 9001 | Register, login, logout, creates JWT, keeps the logout denylist, `/api/auth/validate` |
| student-service | 9002 | Student CRUD only. No security code inside |
| api-gateway | 8080 | The ONLY door for the browser. Routes by URL, handles CORS, checks the token before student calls |
| frontend | 5500 | HTML/CSS/JS pages, call only the gateway |

## Start order (important)
1. service-registry  (wait until http://localhost:8761 opens)
2. auth-service
3. student-service
4. api-gateway
5. frontend (`python -m http.server 5500` inside `frontend/`)

Wait ~30 seconds, then refresh http://localhost:8761: you should see AUTH-SERVICE, STUDENT-SERVICE and API-GATEWAY under "Instances currently registered".

## Import into Eclipse / STS
File -> Import -> Maven -> Existing Maven Projects -> pick this folder (it finds the 4 Spring projects).
Then File -> Import -> General -> Existing Projects into Workspace -> pick `frontend`.
MySQL must be running; password is in each service's `application.properties` (`pass123`, change if yours differs).

## Where things happen
| What | Where |
|---|---|
| Eureka Server switched on | service-registry: `@EnableEurekaServer` in ServiceRegistryApplication |
| A service registers itself | eureka-client dependency in pom.xml + `eureka.client.service-url.defaultZone` in application.properties |
| URL -> service routing | api-gateway/src/main/resources/application.yml (`routes:`; `lb://auth-service` = name looked up in Eureka) |
| Token check for protected URLs | api-gateway: `filter/JwtValidationFilter.java`; it calls `http://auth-service/api/auth/validate` |
| Token is really valid / not logged out | auth-service: JwtAuthFilter + `AuthController.validate()` |
| CORS | api-gateway application.yml (`globalcors`). Removed from the services |

## Postman checks (all via the GATEWAY, port 8080)
1. POST http://localhost:8080/api/auth/register {"username","email","password","confirmPassword"} -> 201
2. POST http://localhost:8080/api/auth/login {"email","password"} -> 200 + token; wrong password -> 401
3. GET http://localhost:8080/api/students with NO token -> 401 (stopped at the gateway)
4. GET /api/students with `Authorization: Bearer <token>` -> 200; also try POST, PUT, DELETE
5. POST /api/auth/logout with the token -> 200, then GET /api/students with the same token -> 401
6. Stop student-service and call /api/students with a valid token -> gateway error (503); start it again and it works
7. Direct health checks: http://localhost:9001/api/health and http://localhost:9002/api/health

## Notes
- Each service has its own database now: `auth_db` (users, blacklisted_tokens) and `student_db` (students). Old data in the single `student_db` is not copied over; register again.
- Port changed: frontend now calls 8080 (gateway) instead of 9191.
- Spring Boot 3.3.5 with Spring Cloud 2023.0.3 (this pair is compatible).
- student-service itself has no token check (the gateway does it), so port 9002 must not be exposed outside your machine/network. Adding JWT checks inside student-service as well is the next hardening step.
