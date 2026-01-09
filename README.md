# BulkMailPro 🚀  
A scalable bulk email automation system built with **Frontend + Backend APIs + n8n**, supporting sheet-based client uploads and multi-SMTP email delivery.

---

## 📌 Overview

**BulkMailPro** allows users to upload a client list via a sheet (CSV/Excel) and configure campaign details from the frontend.  
The backend processes the data and triggers **n8n automation**, which sends emails using **multiple SMTP accounts** with tracking for sent and failed emails.

---

## ✨ Key Features

- 📄 Upload client sheet (Name + Email)
- 🧾 Campaign creation via frontend form
- 🔁 One campaign → multiple clients
- ✉️ Email sending via **5 SMTP accounts**
- ⏰ Scheduled email delivery (start date / end date)
- 📊 Email status tracking (Sent / Failed)
- 🔐 Secure (no credentials exposed on frontend)
- ⚙️ Fully automated using **n8n**

---

## 🏗️ System Architecture

Frontend (React)
│
├─ Campaign Form (dates, subject, template, etc.)
├─ Client Sheet Upload (name, email)
│
↓
Backend API / n8n Webhook
│
├─ Generate Campaign ID
├─ Merge Sheet Data + Form Data
├─ Store Records
└─ Trigger Email Automation
│
↓
n8n Workflow
│
├─ Loop through clients
├─ Select SMTP (round-robin)
├─ Send Email
└─ Update Status (sent / failed)

yaml
Copy code

---

## 📄 Client Sheet Format

The uploaded sheet must contain **only these 2 columns**:

| client_name | client_email |
|------------|--------------|
| Ravi Kumar | ravi@gmail.com |
| Neha Singh | neha@gmail.com |

> No extra fields are required in the sheet.

---

## 📝 Campaign Fields (Frontend / Backend)

These fields are **not in the sheet** and are provided via frontend form or backend logic:

| Field Name | Source |
|----------|--------|
| campaign_id | Auto-generated (Backend) |
| campaign_name | Frontend |
| start_date | Frontend |
| end_date | Frontend |
| email_subject | Frontend |
| email_body | Frontend |
| email_send_time | Frontend |
| email_status | Backend (sent / failed) |

---

<<<<<<< HEAD
=======
## 🔄 Data Flow Example

### Incoming API Payload (Webhook)

```json
{
  "campaign": {
    "campaign_name": "New Year Offer",
    "start_date": "2026-01-10",
    "end_date": "2026-01-20",
    "email_subject": "Special Offer for You",
    "email_body": "Hello {{client_name}}, welcome!",
    "email_send_time": "10:00"
  },
  "clients": [
    { "client_name": "Ravi", "client_email": "ravi@gmail.com" },
    { "client_name": "Neha", "client_email": "neha@gmail.com" }
  ]
}
🔁 Campaign Logic
One Campaign ID is generated per submission

Multiple clients are linked to the same campaign

Each client receives:

Same subject

Same template

Individual email delivery

Status is tracked per client

✉️ Email Automation (n8n)
SMTP Handling
5 SMTP accounts configured

Emails are sent using round-robin strategy

Prevents rate limiting and SMTP overload

Workflow Steps
Receive webhook data

Split clients into items

Assign SMTP dynamically

Send email

Capture response

Update status:

✅ Sent

❌ Failed

📊 Email Status Tracking
Each email record stores:

campaign_id

client_name

client_email

smtp_used

sent_time

status (sent / failed)

error_message (if failed)

🔐 Security Best Practices
❌ No Google Sheet or SMTP credentials in frontend

✅ All secrets stored in backend / n8n

✅ API-based communication only

✅ Environment variables used (.env ignored in git)

🧪 Scalability
Supports 3000+ clients per campaign

Batch processing via n8n

Easy to extend to:

Database (MySQL / PostgreSQL)

CRM systems

Analytics dashboard

🚀 Tech Stack
Frontend: React

Backend: Node.js / n8n Webhooks

Automation: n8n

Email: SMTP (multiple providers)

Data Upload: CSV / Excel

🛠️ Setup (High Level)
Clone repository

Install dependencies

Configure environment variables

Setup n8n SMTP credentials

Start frontend & backend

Deploy n8n workflow

📌 Use Cases
Bulk email campaigns

Marketing automation

Client outreach

Event notifications

CRM email flows

📄 License
This project is intended for internal / commercial use.
Modify and scale as per business needs.

👨‍💻 Author
Built with ❤️ for scalable email automation using n8n.

>>>>>>> d915d45 (update-ui)
