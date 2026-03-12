# Expense approval conversation

User (Slack): `start loop expense.approval`

OpenClaw:

```text
🔄 Loop started
Loop: expense.approval
Instance: expense-approval-1741737600000
State: SUBMITTED
Status: OPEN
```

User: `transition expense-approval-1741737600000 start_review`

OpenClaw:

```text
✅ Transition executed. start_review -> UNDER_REVIEW
```

OpenClaw:

```text
⚠️ Approval required: expense-approval-1741737600000
Approve this $1,450 expense reimbursement?
Category: Travel | Owner: j.smith
Reply: approve expense-approval-1741737600000 or reject expense-approval-1741737600000
```

User: `approve expense-approval-1741737600000`

OpenClaw:

```text
✅ Approved. Loop expense-approval-1741737600000 advanced to: APPROVED
```

## What the approval request looks like

Exact message emitted by `messenger.ts` for an expense approval loop in `PENDING_HUMAN_APPROVAL`:

> Approval required: Purchase Order $9,200 — Vendor: Acme Medical Devices  
> Requested by: procurement-agent · Loop ID: loop_exp_0017  
> Reply YES to approve or NO to reject.

Confirmation and rejection variants:

> ✓ Approved. PO submitted to vendor. Loop ID: loop_exp_0017 is now EXECUTED.  
> ✗ Rejected. PO cancelled. Loop ID: loop_exp_0017 is now REJECTED.
