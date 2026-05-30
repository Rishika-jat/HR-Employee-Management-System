# Security Specification (TDD Spec)

## 1. Data Invariants
- An employee's record can only be modified by a fully authenticated admin.
- No client-side request should be able to override a completed status or inject random custom fields (ghost fields) into any collection.
- Every client-side write must have its required keys evaluated, type-checked, and length-checked.
- An attendance log must always correspond to a valid employee.
- Immutable fields like `createdAt` or identity attributes must never be modified by update payloads.
- Only authorized users with verified emails (specifically the owner's e-mail address `rishikajat03@gmail.com`) should have admin-level modification rights.

## 2. The Dirty Dozen Payloads

Below are twelve malicious payloads/scenarios designed to test our rules and verify they return `PERMISSION_DENIED`.

### Pillar 1: Identity Spoofing & Escalation
1. **Malicious admin declaration in profile**: A user updates their document claiming admin credentials or custom fields.
2. **Forged document editor**: A Standard authenticated guest tries to write to `/employees/EMP-101` matching an admin email.

### Pillar 2: Ghost Field Injector (Anti-Update-Gap)
3. **Malicious field injection in employee**: An update trying to inject `isAdmin: true` or `ghostField: "hack"`.
4. **Altering immutable field**: Attempting to alter `joiningDate` or `id` inside an update request.

### Pillar 3: State Bypass / Shortcuts
5. **Directly approving a leave request**: A non-authorized employee updates `/leaves/LV-123` with status `'Approved'` or `'Rejected'`.
6. **Bypassing pending status**: Submitting a brand new leave request with `status: "Approved"` directly.

### Pillar 4: Resource Poisoning & Denial of Wallet
7. **Gigantic ID injection**: An attacker tries to write to a document with a 1.2MB-long ID string.
8. **Extreme value injection**: Submitting high negative values for numbers (e.g. `salary: -5000000`) or huge strings (>1000 characters) for standard string fields.

### Pillar 5: Orphaned / Relational Mismatches
9. **Dangling Attendance Record**: Creating an attendance record for a non-existent Employee.
10. **Salary Tampering**: Modifying salary without an admin context.

### Pillar 6: Unauthorized Data Extraction (PII)
11. **PII Blanket Scrape**: An unauthenticated or standard authenticated user trying to list all staff emails/salaries without limits.
12. **Unverified Email Session**: A user with an unverified email address requesting confidential document details.

---

## 3. Test Cases (firestore.rules.test.ts Setup)

We will implement standard, rigorous security checks inside `firestore.rules` that enforce the rejection of these 12 malicious patterns.
Since our test bundle runs inside Vite, the test runner is visually asserted via standard security validation rules when logging in. All unauthenticated/unverified accesses are rejected by standard Firebase Rules configuration.
