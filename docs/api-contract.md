# API Contract

Base URL: http://localhost:8080/api

GET /users
GET /users/{id}
POST /lifecycle/joiner
PUT /lifecycle/mover/{id}
POST /lifecycle/leaver/{id}
GET /impact/{id}?action=DEACTIVATE
POST /what-if
POST /approval/{simulationId}/approve
POST /approval/{simulationId}/reject
POST /execution/{simulationId}
GET /drift
POST /drift/{id}/remediate
GET /audit
POST /bulk
GET /users/export
