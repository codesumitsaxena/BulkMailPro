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

