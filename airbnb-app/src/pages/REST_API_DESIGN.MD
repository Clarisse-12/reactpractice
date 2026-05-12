# REST API Design Blueprint

Imara Financial Services - REST API Design Blueprint
Rwanda merchant credit and remittance platform serving small merchants, field agents, and lending partners.

## Executive

This document defines the REST API blueprint for the first working module of the platform. which connects field like agents, small merchants, and lending institutions in a regulated financial environment where financial platform,  it designed to avoid duplicate transactions and keeping a clear audit tail is more important that processing huge traffic volumes..

The API is designed around five core resources: merchants, agents, financing requests, disbursements, and repayments. Each resource includes validation rules, relationships, and consistent error handling. The endpoint map follows REST conventions with standard HTTP methods and predictable URI structures.

Two important design choice shape this:

- Idempotency keys are required on all state-changing endpoints.
- Disbursements are modeled as a first-class resource instead of a nested action.

These choices reduce operational risk in a financial system where duplicate disbursements and repayments cannot be safely ignored.

## Domain Analysis

### System Actors

| Actor | Role | Primary Concerns |
|---|---|---|
| Field agent | Onboards merchants, collects documents, and facilitates repayments | Repayment recording, status checks, and merchant registration |
| Merchant | End borrower and remittance sender, typically a small trader | Access to credit, repayment tracking, and transaction history |
| Lending partner | Financial institution or fund providing capital for merchant credit | Financing request approval, portfolio visibility, and disbursement confirmation |
| Platform system | Internal automated services such as scoring and notifications | Consistent, machine-readable API responses |

Merchants, field agents, and lending partners are the primary actors. internal services like scoring or notification will also consume the API, but indirectly through the existing endpoints.

### Core Workflows

- Merchant onboarding: a field agent registers a merchant, captures business details, mobile money information, and identity documents, and the merchant enters `pending_verification` until approved.
- Financing request lifecycle: a verified merchant, or a field agent on the merchant’s behalf, submits a request that moves through `submitted` -> `under_review` -> `approved` or `rejected` -> `disbursed`.
- Repayment recording: repayments are recorded against a disbursed financing request, updating total repaid, outstanding balance, and due dates.
- Remittance: cross-border remittance is out of scope for the first slice and intentionally deferred.

### Data Priority

| Data point | Priority | Rationale |
|---|---|---|
| Merchant legal name, mobile number, national ID | Essential | Required for identity verification and regulatory compliance |
| Merchant business type, location | Essential | Used in credit risk assessment |
| Financing amount, purpose, duration | Essential | Core fields for any lending decision |
| Disbursement channel, reference | Essential | Required for audit trail and reconciliation |
| Merchant social graph or referral data | Optional | Useful for future credit scoring; not needed in the first slice |
| Detailed transaction metadata such as GPS or device data | Optional | Useful for fraud detection; adds complexity and is deferred |

### Real-World Constraints

- Mobile money integration: transfers happen through systems such as  Airtel Money bank and MTN-momo, so account numbers or bank and network identifiers are required for disbursements.
- Identity verification: regulators require customer due diligence before credit is extended, so unverified merchants must not be allowed to submit financing requests.
- Currency accuracy: monetary values are stored as integer minor units, never floating point.
- Idempotency: intermittent connectivity means write operations must be safe to retry without duplicating disbursements or repayments.
- State machine consistency: invalid transitions, such as disbursing a rejected request, must fail.

## Resource Model

### Disbursement

Primary purpose: represents the actual transfer of approved funds to a merchant’s mobile money account. It is modeled as a first-class resource to support audit, reconciliation, and retry logic independently of the financing request.

| Field name | Data type | Required | Notes |
|---|---|---|---|
| id | String(UUID) | System generated | Universally unique identifier |
| financing_request_id | String(UUID) | Yes | Must reference an approved financing request |
| merchant_id | String(UUID) | Yes | Denormalized for query convenience |
| amount | Integer | Yes | Must equal `approved_amount` on the financing request |
| currency | String | System generated | Currency code |
| channel | Enum | Yes | MTN, AIRTEL, MPESA, TIGO, BANK_TRANSFER |
| destination_account | String | Yes | Mobile number or bank account |
| external_reference | String | Yes | Reference from the mobile money or bank provider |
| status | Enum | System managed | pending, processing, completed, failed |
| onboarded_by_agent_id | String(UUID) | Yes | References the field agent |
| initiated_at | String | System generated | N/A |
| completed_at | String | System generated | Null until completion |
| idempotency_key | String | Yes | Client supplied; enforced for deduplication |

Business rules:

- A financing request can have at most one completed disbursement.
- A disbursement can only be created when `financing_request.status` is `approved`.
- On successful disbursement, `financing_request.status` transitions to `disbursed` automatically.
- `amount` must exactly equal `financing_request.approved_amount`.

Relationships:

- Belongs to one financing request.
- Belongs to one merchant, denormalized for convenience.
### Agent

Primary purpose: represents a hired or contracted field agent.

| Field name | Data type | Required | Notes |
|---|---|---|---|
| id | String(UUID) | System generated | Universally unique identifier |
| full_name | String | Yes | Legal name as it appears on the national ID |
| phone_number | String | Yes | Mobile money number |
| employee_code | String | Yes | Internal staff identifier |
| region | String | Yes | Operating region |
| status | Enum | System managed | Active, suspended, inactive |
| created_at | String | System generated | N/A |

Business rules:

- A field agent with `status` set to `suspended` or `inactive` cannot register new merchants.
- `employee_code` must be unique.

Relationships:

- One field agent may have more than one merchant.

### Financing Request

Primary purpose: represents a merchant’s application for a short-term credit facility and is the central transactional resource in the lending workflow.

| Field name | Data type | Required | Notes |
|---|---|---|---|
| id | String(UUID) | System generated | Universally unique identifier |
| merchant_id | String(UUID) | Yes | Must reference a verified merchant |
| requested_amount | Integer | Yes | Stored in minor currency units |
| currency | String | Yes | For example RWF or KES |
| purpose | String | Yes | Free text, max 500 characters |
| duration_days | Integer | Yes | Requested repayment period |
| status | Enum | System managed | submitted, under_review, approved, rejected, disbursed, fully_repaid, defaulted |
| reviewed_by_partner_id | String(UUID) | Conditional | Required when status transitions to approved or rejected |
| approved_amount | Integer | Conditional | Set on approval and may differ from requested_amount |
| rejection_reason | String | Conditional | Required if status is rejected |
| reviewed_at | String | System generated | N/A |
| submitted_at | String | System generated | N/A |
| updated_at | String | System generated | N/A |

Business rules:

- Only merchants with `kyc_status` set to `verified` can be referenced.
- `requested_amount` must be at least 1 and within the merchant’s configured credit limit.
- `duration_days` must be between 7 and 180.
- A merchant may not have more than one financing request in `submitted` or `under_review` status at the same time.
- The financing lifecycle follow strict sequence to avoid inconsistent states: `submitted` -> `under_review` -> `approved` or `rejected` -> `disbursed` -> `fully_repaid` or `defaulted`.

Relationships:

- Belongs to one merchant.
- Reviewed by one lending partner through `reviewed_by_partner_id`.
- Has one disbursement after approval.
- Has many repayments.


### Repayment

Primary purpose: records each repayment event made against a disbursed financing request. Supports partial repayments, full settlement tracking, and field-agent-assisted repayment recording.

| Field name | Data type | Required | Notes |
|---|---|---|---|
| id | String(UUID) | System generated | Universally unique identifier |
| financing_request_id | String(UUID) | Yes | Must reference a disbursed financing request |
| merchant_id | String(UUID) | Yes | N/A |
| amount | Integer | Yes | Amount repaid in this transaction |
| currency | String | System generated | Currency code |
| channel | Enum | Yes | MTN, AIRTEL, MPESA, TIGO, BANK_TRANSFER |
| recorded_by_agent_id | String(UUID) | Conditional | Required if channel is CASH |
| external_reference | String | Conditional | Required for mobile money channels |
| repaid_at | String | Yes | Timestamp of the payment event |
| initiated_at | String | System generated | N/A |
| idempotency_key | String | Yes | Client supplied |

Business rules:

- Repayments can only be recorded against financing requests with status `disbursed`.
- `amount` must be greater than 0.
- `amount` must not exceed the outstanding balance on the financing request.
- When cumulative repayments equal `approved_amount` plus any service-layer fees, the financing request status transitions to `fully_repaid`.
- Cash repayments must be recorded by an active field agent.

Relationships:

- Belongs to one financing request.
- Optionally recorded by one agent.

### Merchant

Primary purpose: represents a registered merchant on the platform and acts as the anchor for financing requests and repayment records.

| Field name | Data type | Required | Notes |
|---|---|---|---|
| id | String(UUID) | System generated | Universally unique identifier |
| full_name | String | Yes | Legal name as it appears on the national ID |
| phone_number | String | Yes | Mobile money number |
| mobile_money_network | Enum | Yes | MTN, AIRTEL, MPESA, TIGO |
| business_name | String | Yes | Registered or trading name |
| business_type | Enum | Yes | Retail, wholesale, services, agriculture, other |
| district_location | String | Yes | Administrative district |
| country | String | Yes | For example RW, KE, or UG |
| kyc_status | Enum | System managed | Pending, verified, rejected |
| onboarded_by_agent_id | String(UUID) | Yes | References the field agent |
| created_at | String | System generated | N/A |
| updated_at | String | System generated | N/A |

Business rules:

- Mobile number must be unique across the platform.
- National ID must be unique across the platform.
- The system blocks financing requests until KYC verification is completed to satisfy compliance requirement.
- `kyc_status` can only be updated by a lending partner or internal system actor, not by a field agent.

Relationships:

- A merchant belongs to one agent.
- A merchant may have more than one financing request.
- A merchant may have many repayments.

## Endpoint Map

### Merchant Endpoints

| Resource | Action | Method | URI | Request body or params | Success response | Error responses |
|---|---|---|---|---|---|---|
| Merchant | Register merchant | POST | `/api/v1/merchants` | See example below | 201 Created | 400, 409, 422 |
| Merchant | List merchants | GET | `/api/v1/merchants?kyc_status=verified&country=RW&page=1&limit=20` | Query params | 200 OK | 400 |
| Merchant | Get merchant | GET | `/api/v1/merchants/{merchant_id}` | — | 200 OK | 404 |
| Merchant | Update KYC status | PATCH | `/api/v1/merchants/{merchant_id}/kyc` | `{ "kyc_status": "verified" }` | 200 OK | 400, 403, 404, 422 |

**Request example:**

```
{
  "full_name": "Clarisse Uwamahoro",
  "national_id_number": "1199880012345890",
  "mobile_number": "+250728123789",
  "mobile_money_network": "AIRTEL",
  "business_name": "Clarisse Kigali Store",
  "business_type": "retail",
  "location_district": "Nyarugenge",
  "location_country": "RW",
  "onboarded_by_agent_id": "agt_01J2K3L4M5N6P7Q8R9d0"
}
```

**Success response example:**

```
{
  "id": "mer_01J2K3L4M5N6P7Q8R9d0",
  "full_name": "Clarisse Uwamahoro",
  "business_name": "Clarisse Kigali Store",
  "kyc_status": "pending",
  "created_at": "2025-05-10T08:30:00Z"
}
```

**Error response example:**

```
{
  "error": {
    "code": "DUPLICATE_MOBILE_NUMBER",
    "message": "A merchant with mobile number +250788123789 already exists.",
    "field": "mobile_number"
  }
}

```

### Agent Endpoints

| Resource | Action | Method | URI | Request body or params | Success response | Error responses |
|---|---|---|---|---|---|---|
| Agent | Register agent | POST | `/api/v1/agents` | See example below | 201 Created | 400, 409, 422 |
| Agent | Update agent status | PATCH | `/api/v1/agents/{agent_id}/status` | `{ "status": "suspended" }` | 200 OK | 400, 403, 404 |
| Agent | Get agent | GET | `/api/v1/agents/{agent_id}` | — | 200 OK | 404 |

**Request example:**

```
{
  "full_name": "david Byiringiro",
  "employee_code": "AGT-KGL-123",
  "mobile_number": "+250722987123",
  "region": "Rwanda"
}
```

### Financing Request Endpoints

| Resource | Action | Method | URI | Request body or params | Success response | Error responses |
|---|---|---|---|---|---|---|
| Financing request | Submit request | POST | `/api/v1/financing-requests` | See example below | 201 Created | 400, 409, 422 |
| Financing request | Get request | GET | `/api/v1/financing-requests/{request_id}` | — | 200 OK | 404 |
| Financing request | List requests | GET | `/api/v1/financing-requests?merchant_id=&status=submitted&page=1&limit=20` | Query params | 200 OK | 404 |
| Financing request | Review request | PATCH | `/api/v1/financing-requests/{request_id}/review` | See example below | 200 OK | 400, 403, 404, 409, 422 |

 **Request example:**

```
{
  "merchant_id": "mer_01J2K3L4M5N6P7Q8R9d0",
  "requested_amount": 150000,
  "currency": "RWF",
  "purpose": "manage stock for client.",
  "duration_days": 10
}
```

**Approval example:**

```
{
  "decision": "approved",
  "approved_amount": 120000,
  "reviewed_by_partner_id": "lp_01J9K3M5N7P8Q2R4S6c0"
}
```

**Invalid state transition example:**

```{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot review a financing request with status 'disbursed'.",
    "current_status": "disbursed"
  }
}
```

### Disbursement Endpoints

| Resource | Action | Method | URI | Request Body / Params | Success Response | Error Responses |
|---|---|---|---|---|---|---|
| Disbursement | Initiate disbursement | `POST` | `api/v1/disbursements` | See below | `201 Created` + disbursement object | `400`, `404`, `409`, `422` |
| Disbursement | Get disbursement | `GET` | `api/v1/disbursements/{disbursement_id}` | — | `200 OK` + disbursement object | `404` |
| Disbursement | List by financing request | `GET` | `api/v1/financing-requests/{request_id}/disbursements` | — | `200 OK` + list | `404` |
 
**POST api/v1/disbursements — Request Example:**
```json
{
  "financing_request_id": "frq_01J5M7N9P0Q2R4S6T8l0",
  "channel": "AIRTEL",
  "destination_account": "+250728123345",
  "idempotency_key": "disb-frq01J5M7N9P0Q2R4S6T8U0-20250123"
}
```
 
**Success Response (201):**
```json
{
  "id": "dsb_01J6N8P0Q2R4S6T8Udg0",
  "financing_request_id": "frq_01J5M7N9P0Q2R4S6T8l0",
  "amount": 120000,
  "currency": "RWF",
  "channel": "AIRTEL",
  "status": "pending",
  "initiated_at": "2025-05-09T09:00:00Z"
}
```
 
**Error Response (409 — duplicate idempotency key):**
```json
{
  "error": {
    "code": "DUPLICATE_IDEMPOTENCY_KEY",
    "message": "A disbursement with this idempotency key has already been processed.",
    "existing_disbursement_id": "dsb_01J6N8P0Q2R4S6T8U0V2"
  }
}
```
 
---
### 4.5 Repayment Endpoints
 
| Resource | Action | Method | URI | Request Body / Params | Success Response | Error Responses |
|---|---|---|---|---|---|---|
| Repayment | Record repayment | `POST` | `api/v1/repayments` | See below | `201 Created` + repayment object | `400`, `404`, `409`, `422` |
| Repayment | List repayments | `GET` | `api/v1/financing-requests/{request_id}/repayments` | `?page=1&limit=20` | `200 OK` + paginated list + summary | `404` |
| Repayment | Get repayment | `GET` | `api/v1/repayments/{repayment_id}` | — | `200 OK` + repayment object | `404` |
 
**POST api/v1/repayments — Request Example:**
```json
{
  "financing_request_id": "frq_01J5M7N9P0Q2R4S6T8U0",
  "amount": 40000,
  "currency": "RWF",
  "channel": "AIRTEL",
  "external_reference": "MTN-TXN-2025050901234",
  "repaid_at": "2025-05-09T10:15:00Z",
  "idempotency_key": "rpmt-AIRTEL-TXN-2025050901234"
}
```
 
**GET api/v1/financing-requests/{request_id}/repayments — Response Example:**
```json
{
  "financing_request_id": "frq_01J5M7N9P0Q2R4S6T8U0",
  "approved_amount": 120000,
  "total_repaid": 40000,
  "outstanding_balance": 80000,
  "repayments": [
    {
      "id": "rpt_01J7P9Q1R3S5T7U9V1W3",
      "amount": 40000,
      "channel": "AIRTEL",
      "repaid_at": "2025-05-09T10:15:00Z"
    }
  ]
}
```
 
---

## 5. Validation and Error Strategy
 
### 5.1 Validation Philosophy
 
The API applies validation in three layers, in order:
 
1. **Syntactic validation** — Are required fields present? Are types and formats correct? (Handled before any business logic.)
2. **Referential validation** — Do referenced IDs exist and belong to the right state? (e.g. does the merchant exist and is it verified?)
3. **Business-rule validation** — Does the request violate domain rules? (e.g. is the amount within permitted limits? Is the status transition valid?)
**All error responses share a consistent structure:**
 
```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable explanation.",
    "field": "affected_field_name (optional)",
    "details": {} 
  }
}
```
 
### 5.2 Key Validation Rules and Examples
 
**Rule 1: KYC Gate on Financing Requests**
 
A merchant without `kyc_status: verified` must not be permitted to submit a financing request.
 
- **Check:** Before creating a `FinancingRequest`, resolve the referenced `Merchant` and assert `kyc_status === "verified"`.
- **HTTP Status:** `422 Unprocessable Entity`
- **Response:**
```json
{
  "error": {
    "code": "MERCHANT_NOT_KYC_VERIFIED",
    "message": "Financing requests can only submitted by merchants with verified KYC status.",
    "field": "merchant_id",
    "details": {
      "merchant_kyc_status": "pending"
    }
  }
}
```
 
**Rule 2: Duplicate Active Financing Request**
 
A merchant may not have more than one financing request in `submitted` or `under_review` status at the same time.
 
- **Check:** Before inserting a new financing request, query for any existing request for the same `merchant_id` with `status IN ("submitted", "under_review")`.
- **HTTP Status:** `409 Conflict`
- **Response:**
```json
{
  "error": {
    "code": "ACTIVE_REQUEST_EXISTS",
    "message": "This merchant has already  a financing request under review.",
    "field": "merchant_id",
    "details": {
      "existing_request_id": "frq_01J5M7N9P0Q2R4S6T8U0",
      "existing_request_status": "under_review"
    }
  }
}
```
 
**Rule 3: Repayment Exceeds Outstanding Balance**
 
A repayment must not exceed the remaining outstanding balance on a financing request.
 
- **Check:** Before inserting a repayment, calculate `outstanding = approved_amount - SUM(repayments.amount)`. Reject if `repayment.amount > outstanding`.
- **HTTP Status:** `422 Unprocessable Entity`
- **Response:**
```json
{
  "error": {
    "code": "REPAYMENT_EXCEEDS_BALANCE",
    "message": "The repayment amount exceeds the outstanding balance.",
    "field": "amount",
    "details": {
      "outstanding_balance": 30000,
      "submitted_amount": 50000,
      "currency": "RWF"
    }
  }
}
```
 
**Rule 4: Invalid Status Transition**
 
The financing request status machine must be enforced at the API layer.
 
- **Check:** On any `PATCH` to a review or status endpoint, validate that the requested transition is permitted from the current status.
- **HTTP Status:** `422 Unprocessable Entity`
- **Response:**
```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot approve a financing request with current status 'rejected'.",
    "details": {
      "current_status": "rejected",
      "requested_transition": "approved",
      "allowed_transitions": []
    }
  }
}
```
 
**Rule 5: Idempotency Key Collision**
 
Retried requests with an already-processed idempotency key must return the original response, not create a duplicate.
 
- **Check:** On `POST api/v1/disbursements` and `POST api/v1/repayments`, look up the idempotency key before processing. If found and status is terminal, return the original record.
- **HTTP Status:** `200 OK` (returning original resource) or `409 Conflict` if the key exists but is still processing.
### 5.3 Standard HTTP Status Code Usage
 
| Code | When Used |
|---|---|
| `200 OK` | Successful `GET` or `PATCH`; idempotent replay of completed request |
| `201 Created` | Successful `POST` that created a new resource |
| `400 Bad Request` | Malformed request, missing required fields, invalid format |
| `403 Forbidden` | Authenticated actor lacks permission for this action |
| `404 Not Found` | Referenced resource does not exist |
| `409 Conflict` | Duplicate unique constraint violation; conflicting state |
| `422 Unprocessable Entity` | Request is well-formed but violates business rules |
| `500 Internal Server Error` | Unexpected server-side failure (never expose internal details) |
 
---
 
## 6. Trade-off Rationale
 
### Trade-off 1: Disbursements as a First-Class Resource
 
**Decision:** Disbursements are designed as a standalone resource at `api/v1/disbursements` rather than as a nested action on a financing request (e.g. `POST api/v1/financing-requests/{id}/disburse`).
 
**Benefit this creates:**
- Disbursements can be queried, audited, and reconciled independently. When a mobile money provider returns an asynchronous callback — common in East African payment networks — the platform can update a disbursement record without coupling that update to the financing request entity's lifecycle.
- It enables clean idempotency handling. The `idempotency_key` lives on the disbursement record, not embedded inside the financing request.
- Lending partners and auditors can access disbursement history without filtering through the financing request object.
**What it makes harder:**
- It adds a second resource for developers to understand, create, and query when the mental model of "approve then disburse" might feel like a single action.
- It requires a join or two-step query to get the full picture of a financing request's lifecycle.
**Why this trade-off is reasonable:**
In a financial platform, disbursements and lending decisions are separate concerns even if they happen sequentially. Disbursement failure does not invalidate approval. Disbursement retry logic must be independent. The operational complexity of mobile money callbacks alone justifies treating disbursements as their own lifecycle. The extra endpoint is a small cost for a significant gain in correctness and auditability.
 
---
 
### Trade-off 2: Mandatory Idempotency Keys on All Write Operations
 
**Decision:** `idempotency_key` is a required field on `POST api/v1/disbursements` and `POST api/v1/repayments`. The API enforces deduplication at the application layer using this key.
 
**Benefit this creates:**
- Field agents often operate in low-connectivity environments and will retry failed requests. Mandatory idempotency keys eliminate the risk of recording a repayment twice or initiating two disbursements for the same approval, both of which would be costly and difficult to reverse in a real financial system.
- It places responsibility for safe retry behaviour on the calling client in a structured way, rather than relying on timeout-based deduplication or manual reconciliation.
**What it makes harder:**
- Client developers must generate and manage idempotency keys, which adds implementation burden on every mobile or agent app consuming the API.
- Key generation strategies (UUIDs vs. composite business keys) need to be documented and consistently applied by all clients.
**Why this trade-off is reasonable:**
For any financial write operation, the cost of a duplicate is almost always higher than the cost of requiring a key. Disbursing funds twice to a merchant who did not request it, or double-recording a repayment that reduces the reported outstanding balance, are both serious financial errors. This design makes correctness the default path and makes careless clients fail loudly at development time, rather than silently in production.
 
---
 
## 7. AI Use Appendix
 

This document was developed with limited AI assistance(claude) for formating and refining explanations.

AI tools were mainly used to:

- Generate initial drafts of resource definitions and endpoint structures.
- Provide examples of error responses and validation rules.
- Suggest consistent formatting for the API blueprint.
- improve clarity of explanation
- help structure endpoint documentation

All design decisions, business rules, validation and trade-off discussions were reviewed and adjusted by the author to reflect the assignment requirement and system behaviour.
 
