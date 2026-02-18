Refined Prompt

Objective: Design and implement an RBAC system for a two-tier architecture consisting of an ATC Platform (Admin Control Panel) and a multi-tenant HMS (Hotel Management System). The ATC Platform is not a tenant—it exists outside the tenant structure as the control plane.

Database Seed:

* The system begins with one protected Super Admin Role and one Super Admin User (email + password). This is the only seed required.


Roles:

* Every user must belong to exactly one role.
* Super Admin (ATC) and General Manager (per hotel) roles are protected and cannot be deleted.
* Super Admin and GM roles hold exactly one user each—no more, no less.
* Custom roles can be created, updated, or deleted freely.
* When a role is deleted, users under it are not deleted but become orphaned and locked out until reassigned.


Users:

* Users cannot exist without a role.
* Orphaned users (no role) can log in but see a "No Access" message and cannot use the system until reassigned a new role.
* Self-edit: Users can update their own name, phone, and password—not email.
* Admin-edit: Super Admin (SA) or GM can update any user's name, phone, email, and role assignment.


Plans & Hotels:

* At least one Plan (pricing tier) must exist before a hotel can be onboarded.
* Hotel onboarding collects manager details and auto-generates the GM Role and GM User for that tenant.


Permissions:

* A user's permissions are derived entirely from their assigned role.
* No role = no permissions = no system access.