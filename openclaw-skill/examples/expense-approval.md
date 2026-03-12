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
