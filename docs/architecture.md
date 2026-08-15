# Architecture

React + MUI
    |
    v
Spring Boot
    |
    +-- Workstream 4 API
    +-- Workstream 3 Simulation/Security
    +-- Workstream 2 Graph/Impact
    +-- Workstream 1 JML/Policy
    |
    v
OktaClient
    |
    v
Okta REST API
    |
    v
Okta Tenant

Spring Data JPA -> MySQL
