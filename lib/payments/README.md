# Private work and payment ledger

Route: /payments. API: /payments/api. No client financial data is bundled or committed.

Two invitation-only roles: admin and royal. Hashed email and one-time invitation
configuration is server-only. Generate invitations with
`node scripts/create-payment-invites.mjs ADMIN_EMAIL WORKER_EMAIL`.
The ignored `.payment-invitations.txt` contains private setup links. Send each
person only their own link. Activation requires matching email, token, and a new
12+ character password. Invitations expire after 14 days. Passwords use scrypt;
sessions are random, hashed server-side, HttpOnly, Secure, SameSite Strict, seven
days. Password changes revoke other sessions. No outbound email is configured.

Storage: `$LEDGER_DATA_DIR`, or `$HOME/.bloombrain-private/payments`. This must be
private, writable, and persistent across deployments, never under public_html,
public/, .next/, or a versioned build directory. Single Hostinger instance with
shared filesystem required; not for distributed/ephemeral replicas. Never move
or clear the data directory during deployment. Permissions: directory 0700,
files 0600. Each mutation saves an atomic replacement and retains the latest
100 prior snapshots in backups/. Download backup in the UI for off-host copies.
Filesystem lock serializes simultaneous users; crashed-owner locks recover after
30 seconds if the PID no longer exists. Corrupt data fails closed rather than
resetting balances. Hostinger backups should also cover this private directory.

Money is integer paisa; work is integer minutes at BDT250/hour, rounded once per
entry. Opening balance is signed (positive due, negative advance), set once by
admin. It is carried forward separately, never counted as new paid/earned.
Worker entries immediately affect totals. Workers edit their own entries; admin
edits all and can void entries. Voided entries and before/after audit events are
retained. Version checks prevent lost edits; stable entry UUIDs prevent double
submits. All reads require a session. Mutations require same-origin JSON.
No Upwork connection or payment transfer: this records work and payments only.

Imported spreadsheet has inconsistent historical rates and final totals. No
historical values are auto-imported. Admin must confirm opening balance and date;
then add only subsequent activity. Avoid double counting carried-forward rows.

Local verification: use an isolated LEDGER_DATA_DIR. Test script provisions test
accounts using ignored invitations; NEVER run against production. Override
LEDGER_ORIGIN for browser tests on localhost. Defaults to production domain when
NODE_ENV=production. `node scripts/test-payments.mjs` validates authorization,
calculation, advances, conflict handling, voids and concurrent payments.

If a password is lost, the operator must verify the account owner, back up the
ledger, remove ONLY that role's password record and sessions under the same
filesystem lock, and generate a fresh invite. Rotating invitations alone cannot
take over an activated account. Do not publish a public password-reset endpoint.

An owner-confirmed opening may be provisioned through private host variables
LEDGER_OPENING_PAISA (signed integer paisa) and LEDGER_OPENING_DATE (ISO date).
These are used only when creating a new ledger; they never overwrite existing data.

Multi-worker upgrade: sessions still identify a principal ID (`admin`, `royal`,
or `worker-UUID`). Existing unscoped entries/audit events and the legacy opening
balance belong only to Royal. A lazy, backed-up migration initializes Royal's
profile without rewriting existing entries, credentials or sessions. New worker
profiles contain hashed email/invitation tokens and their separate opening.
Only admin can create workers and receive their one-time 14-day setup link.
Worker-scoped reads, exports, audit, entry mutations and balances are enforced
server-side. Workers cannot select another profile; admin can select any worker.
All worker rates currently remain BDT250/hour.
