# API-Factory & QEC Instructions

> **Document Version:** `v1.0.0`  
> **Last Updated:** 2025-12-01  
> **Status:** Active  
> **Maintainer:** FUTUREWEALTHBOT, LLC

---

## Table of Contents

- [1. QEP / QEC Command Usage](#1-qep--qec-command-usage)
  - [1.1 System Overview](#11-system-overview)
  - [1.2 Common Commands](#12-common-commands)
  - [1.3 Push Workflow](#13-push-workflow)
- [2. API-Factory Deployment & Operational SOP](#2-api-factory-deployment--operational-sop)
  - [2.1 Core Architecture](#21-core-architecture)
  - [2.2 Operational Checklist](#22-operational-checklist)
  - [2.3 Monitoring & Alerts](#23-monitoring--alerts)
- [3. Compliance & Security Instructions](#3-compliance--security-instructions)
  - [3.1 Governance & Audit](#31-governance--audit)
  - [3.2 Security Hardening Steps](#32-security-hardening-steps)
  - [3.3 Security Verification](#33-security-verification)
- [4. Financial / Monetization Operations](#4-financial--monetization-operations)
  - [4.1 Stripe Product Tiers](#41-stripe-product-tiers)
  - [4.2 Operational Steps](#42-operational-steps)
- [5. Corporate & Legal Instructions](#5-corporate--legal-instructions)
  - [5.1 Entity Compliance](#51-entity-compliance)
  - [5.2 Required Filings](#52-required-filings)
  - [5.3 Banking / Access](#53-banking--access)
- [6. References & Artifacts](#6-references--artifacts)
- [Appendix A: Version History](#appendix-a-version-history)
- [Appendix B: Artifact Tracking](#appendix-b-artifact-tracking)

---

## 1. QEP / QEC Command Usage

### 1.1 System Overview

| Component | Description |
|-----------|-------------|
| **QEP** | Command-driven automation mentor framework (FutureWealthBot) |
| **QEC** | Compliance enforcement and policy management |
| **Integration** | QEP commands trigger QEC pushes to enforce policies and update artifacts |

<details>
<summary><strong>System Architecture Diagram</strong></summary>

```
┌─────────────────────────────────────────────────────────────┐
│                      QEP Framework                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Commands  │───▶│  Processor  │───▶│   Output    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                   │            │
│         ▼                  ▼                   ▼            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   QEC Module                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │ Policies │  │ Artifacts│  │ Compliance Rules │  │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

</details>

### 1.2 Common Commands

<details>
<summary><strong>Gmail Integration Commands</strong></summary>

```bash
# Enable polling for inbox
CONNECT.GMAIL --scope inbox --alias API.LIVE
POLLING.ENABLE --channel API.LIVE --interval 60s
```

</details>

<details>
<summary><strong>QEC Push Commands</strong></summary>

```bash
# Push policies and artifacts to production simulation
APIF QEP QEC PUSH --all

# Push specific artifact
APIF QEP QEC PUSH --artifact finance-ledger-bundle.zip

# Push policy pack only
APIF QEP QEC PUSH --policy qec_policy_pack_finance_os_v2.txt
```

</details>

### 1.3 Push Workflow

**Step-by-step Push Procedure:**

1. **Ensure all artifacts are up-to-date in sandbox:**
   - `finance-ledger-bundle.zip`
   - `qec_policy_pack_finance_os_v2.txt`

2. **Execute QEC PUSH command:**
   ```bash
   APIF QEP QEC PUSH --all
   ```

3. **Confirm receipt via push log:**

<details>
<summary><strong>Example Push Log Response (JSON)</strong></summary>

```json
{
  "status": "PUSHED",
  "timestamp": "2025-12-01T09:00:00Z",
  "artifacts": [
    {
      "name": "finance-ledger-bundle.zip",
      "sha256": "a3f2b1c4d5e6f7890123456789abcdef...",
      "size_bytes": 1048576,
      "pushed_at": "2025-12-01T09:00:01Z"
    },
    {
      "name": "qec_policy_pack_finance_os_v2.txt",
      "sha256": "b4c3d2e1f0987654321fedcba9876543...",
      "size_bytes": 8192,
      "pushed_at": "2025-12-01T09:00:02Z"
    }
  ],
  "verification": {
    "integrity_check": "PASSED",
    "policy_validation": "PASSED"
  }
}
```

</details>

---

## 2. API-Factory Deployment & Operational SOP

### 2.1 Core Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **API** | Fastify REST | Typed schemas, state machines, adapter interfaces |
| **Architecture** | Multi-tenant | Row-Level Security (RLS) enforcement |
| **Backend** | Supabase | Database, authentication, storage |
| **Deployment** | Vercel | Edge/web deployment |
| **Security** | Cloudflare | DNS and WAF protection |

<details>
<summary><strong>Infrastructure Topology</strong></summary>

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (DNS + WAF)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Vercel      │
                    │  (Edge Deploy)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐ ┌───▼───┐ ┌───────▼───────┐
     │   Fastify API   │ │ Next  │ │  Static CDN   │
     │   (REST/JSON)   │ │ (SSR) │ │   (Assets)    │
     └────────┬────────┘ └───────┘ └───────────────┘
              │
     ┌────────▼────────┐
     │    Supabase     │
     │  (DB/Auth/RLS)  │
     └─────────────────┘
```

</details>

### 2.2 Operational Checklist

| # | Task | Endpoint/Item | Status |
|---|------|---------------|--------|
| 1 | Validate health endpoint | `/api/healthz` | ⬜ |
| 2 | Validate ping endpoint | `/api/v1/hello/ping` | ⬜ |
| 3 | Validate echo endpoint | `/api/v1/hello/echo` | ⬜ |
| 4 | Verify Make.com scenarios | Orchestration flows | ⬜ |
| 5 | Confirm TypeScript SDK CI | CI Pipeline | ⬜ |
| 6 | Confirm Python SDK CI | CI Pipeline | ⬜ |
| 7 | Confirm Go SDK CI | CI Pipeline | ⬜ |
| 8 | Admin portal dashboards | Dashboard functionality | ⬜ |
| 9 | API key management | Key rotation/revocation | ⬜ |
| 10 | Stripe integration | Billing enforcement | ⬜ |

### 2.3 Monitoring & Alerts

<details>
<summary><strong>Alert Configuration</strong></summary>

**Supabase + Telegram Integration:**

| Alert Type | Trigger Condition | Channel |
|------------|-------------------|---------|
| Financial Event | Transaction > $10,000 | Telegram |
| Compliance Breach | Policy violation detected | Telegram + Email |
| System Health | Health check failure | Telegram |
| Security Event | Unauthorized access attempt | Telegram + PagerDuty |

**Logging Requirements:**
- All events logged with timestamp and correlation ID
- Logs retained for minimum 7 years for auditability
- Real-time streaming to monitoring dashboard

</details>

---

## 3. Compliance & Security Instructions

### 3.1 Governance & Audit

<details>
<summary><strong>Policy Pack Management</strong></summary>

**Requirements:**
- Maintain versioned Policy Packs
- Ensure all versions are traceable and immutable
- Implement audit trail for all changes

**Compliance Matrices:**

| Regulation | Domain | Applicable |
|------------|--------|------------|
| FTC | Consumer Protection | ✅ |
| SEC | Securities | ✅ |
| HIPAA | Healthcare Data | ⬜ |
| FinCEN | Financial Crimes | ✅ |
| CCPA | CA Privacy | ✅ |
| SOX | Financial Reporting | ⬜ |

</details>

### 3.2 Security Hardening Steps

| Priority | Action | Frequency | Status |
|----------|--------|-----------|--------|
| P0 | Rotate Stripe secrets | Monthly | ⬜ |
| P0 | Rotate Mercury secrets | Monthly | ⬜ |
| P1 | Enforce idempotency on Finance-OS rails | Continuous | ⬜ |
| P1 | Admin IP allow-listing | As needed | ⬜ |
| P1 | Enable WAF (SQLi/XSS L7 filters) | On deployment | ⬜ |
| P2 | Move audit logs to immutable storage | Quarterly | ⬜ |

<details>
<summary><strong>Secret Rotation Procedure</strong></summary>

1. Generate new credentials in provider dashboard
2. Update secret in secure vault (DO NOT commit to code)
3. Deploy with new credentials in staging
4. Verify functionality in staging
5. Deploy to production
6. Revoke old credentials after 24-hour grace period
7. Document rotation in audit log

</details>

### 3.3 Security Verification

<details>
<summary><strong>Periodic Security Tasks</strong></summary>

| Task | Frequency | Last Completed | Next Due |
|------|-----------|----------------|----------|
| Penetration Testing | Quarterly | - | - |
| Tenant Isolation Validation | Monthly | - | - |
| TLS Configuration Audit | Monthly | - | - |
| Dependency Vulnerability Scan | Weekly | - | - |

**Configuration Verification Checklist:**
- [ ] TLS 1.3 enabled
- [ ] HSTS headers configured
- [ ] CSP (Content Security Policy) implemented
- [ ] Zero-Trust tenant isolation verified
- [ ] Certificate pinning (where applicable)

</details>

---

## 4. Financial / Monetization Operations

### 4.1 Stripe Product Tiers

| Product | Tier | Pricing Model | Status |
|---------|------|---------------|--------|
| Compliance Copilot | Gold | Tiered usage | ⬜ |
| Finance-OS v2 Rails | Platinum | Graduated tiered | ⬜ |
| Arbitrage Engine Premium | Enterprise | Per-unit | ⬜ |

<details>
<summary><strong>Product Configuration Details</strong></summary>

**Compliance Copilot (Gold):**
```json
{
  "product_id": "prod_compliance_gold",
  "pricing": {
    "model": "tiered",
    "tiers": [
      {"up_to": 1000, "unit_amount": 0.05},
      {"up_to": 10000, "unit_amount": 0.03},
      {"up_to": null, "unit_amount": 0.01}
    ]
  }
}
```

**Finance-OS v2 Rails (Platinum):**
```json
{
  "product_id": "prod_finance_os_platinum",
  "pricing": {
    "model": "graduated",
    "tiers": [
      {"up_to": 500, "flat_amount": 99},
      {"up_to": 2000, "flat_amount": 299},
      {"up_to": null, "flat_amount": 599}
    ]
  }
}
```

**Arbitrage Engine Premium (Enterprise):**
```json
{
  "product_id": "prod_arbitrage_enterprise",
  "pricing": {
    "model": "per_unit",
    "unit_amount": 250,
    "currency": "usd"
  }
}
```

</details>

### 4.2 Operational Steps

| # | Task | Verification Method | Status |
|---|------|---------------------|--------|
| 1 | Confirm Stripe product configuration | Stripe Dashboard | ⬜ |
| 2 | Integrate API usage tracking | Analytics Dashboard | ⬜ |
| 3 | Validate ledger consistency | Reconciliation Report | ⬜ |
| 4 | Test ACH adapter | Test Transaction | ⬜ |
| 5 | Test Wire adapter | Test Transaction | ⬜ |

<details>
<summary><strong>Ledger Reconciliation Procedure</strong></summary>

1. Export Stripe transactions for period
2. Export internal ledger entries for period
3. Run automated reconciliation script
4. Review discrepancies (tolerance: $0.01)
5. Investigate and resolve any drift
6. Document findings in audit trail
7. Sign off on reconciliation report

</details>

---

## 5. Corporate & Legal Instructions

### 5.1 Entity Compliance

| Field | Value |
|-------|-------|
| **Legal Name** | FUTUREWEALTHBOT, LLC |
| **Manager** | Amihud Pierce |
| **Jurisdiction** | California (LLC) |
| **EIN** | 39-3590857 |
| **Principal Address** | 5080 Camino Del Arroyo, San Diego, CA 92108 |

### 5.2 Required Filings

| Filing | Due Date | Frequency | Status |
|--------|----------|-----------|--------|
| CA Statement of Information | Within 90 days of formation | Every 2 years | ⬜ |
| Membership Listing Statement | Ongoing | As needed | ⬜ |
| IRS Form 8822-B | Upon address change | As needed | ⬜ |
| Annual Tax Return | April 15 | Annually | ⬜ |

<details>
<summary><strong>Filing Procedures</strong></summary>

**California Statement of Information:**
1. File via [bizfile.sos.ca.gov](https://bizfile.sos.ca.gov)
2. Required information: Entity name, file number, agent information, management structure
3. Filing fee: $20 (as of 2025)

**Membership Listing Statement:**
- Maintain current at registered agent office
- Update within 30 days of any membership changes

**IRS Form 8822-B:**
- File within 60 days of address change
- Submit to IRS address for your state

</details>

### 5.3 Banking / Access

> ⚠️ **SECURITY NOTICE**: Banking credentials require strict handling protocols.

| Item | Storage Location | Access Level |
|------|------------------|--------------|
| Mercury 2FA backup codes | Offline (physical) | Manager only |
| Account credentials | Password manager (offline vault) | Manager only |
| API keys | Secure vault (rotating) | System only |

**Critical Rules:**
- ❌ Never share 2FA codes
- ❌ Never store credentials in cloud drives
- ❌ Never transmit credentials via email or messaging
- ✅ Use hardware security keys where supported
- ✅ Rotate access credentials quarterly

---

## 6. References & Artifacts

| Document | Version | Location | SHA256 |
|----------|---------|----------|--------|
| QEC System Report | v11.11.25 | `QEC_System_Report_v11.11.25.pdf` | `pending` |
| API-Factory Audit | v2.8 | `api-factory-audit-v2.8.pdf` | `pending` |
| Security Brief | v1.0 | `APIF_Security_Executive_Brief_Branded.pdf` | `pending` |
| Compliance Binder | v1.0 | `FUTUREWEALTHBOT_Compliance_Binder.pdf` | `pending` |
| Stripe Products | latest | `stripe_products.json` | `pending` |

<details>
<summary><strong>Extended Reference List</strong></summary>

**Policy Documents:**
- `qec_policy_pack_finance_os_v2.txt`
- `qec_policy_pack_compliance_v1.txt`

**Technical Artifacts:**
- `finance-ledger-bundle.zip`
- `api-schema-openapi.yaml`
- `deployment-runbook.md`

**Legal Documents:**
- California LLC Articles of Organization
- Operating Agreement
- Registered Agent Designation

</details>

---

## Appendix A: Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0.0 | 2025-12-01 | FUTUREWEALTHBOT | Initial release |

<details>
<summary><strong>Changelog Details</strong></summary>

### v1.0.0 (2025-12-01)
- Initial documentation release
- Added QEP/QEC command usage guide
- Added API-Factory deployment SOP
- Added compliance and security instructions
- Added financial operations guide
- Added corporate and legal instructions
- Added artifact tracking tables

</details>

---

## Appendix B: Artifact Tracking

### Current Artifact Inventory

| Artifact Name | Type | Version | Status | Last Updated | Owner |
|---------------|------|---------|--------|--------------|-------|
| `finance-ledger-bundle.zip` | Bundle | v2.0 | Active | - | Finance Team |
| `qec_policy_pack_finance_os_v2.txt` | Policy | v2.0 | Active | - | Compliance |
| `qec_policy_pack_compliance_v1.txt` | Policy | v1.0 | Active | - | Compliance |
| `stripe_products.json` | Config | latest | Active | - | Billing Team |
| `api-schema-openapi.yaml` | Schema | v3.0 | Active | - | Engineering |

### Artifact Lifecycle States

| State | Description |
|-------|-------------|
| 🟢 **Active** | Currently in production use |
| 🟡 **Pending** | Awaiting deployment or approval |
| 🔴 **Deprecated** | Scheduled for removal |
| ⚫ **Archived** | No longer in use, retained for audit |

<details>
<summary><strong>Artifact Verification Commands</strong></summary>

```bash
# Verify artifact integrity
sha256sum finance-ledger-bundle.zip

# List all artifacts in sandbox
APIF QEC LIST --artifacts

# Check artifact status
APIF QEC STATUS --artifact finance-ledger-bundle.zip
```

</details>

---

<div align="center">

**FUTUREWEALTHBOT, LLC**  
*Confidential - Internal Use Only*

</div>
