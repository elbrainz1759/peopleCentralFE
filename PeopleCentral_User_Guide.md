# PeopleCentral — Complete User Guide
### Mercy Corps Nigeria HR Management System

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Leave Management](#3-leave-management)
   - 3.1 [My Leaves (Leave History)](#31-my-leaves-leave-history)
   - 3.2 [Apply for Leave](#32-apply-for-leave)
   - 3.3 [My Leave Balance](#33-my-leave-balance)
   - 3.4 [Leave Approvals](#34-leave-approvals)
   - 3.5 [Leave Balances](#35-leave-balances)
   - 3.6 [Leave Types](#36-leave-types)
   - 3.7 [Leave Type Configurations](#37-leave-type-configurations)
4. [Exit Management](#4-exit-management)
   - 4.1 [Submit Exit Request](#41-submit-exit-request)
   - 4.2 [My Exit Requests](#42-my-exit-requests)
   - 4.3 [Exit Approvals](#43-exit-approvals)
   - 4.4 [Exit Checklist Management](#44-exit-checklist-management)
   - 4.5 [End of Service](#45-end-of-service)
5. [HR Administration](#5-hr-administration)
   - 5.1 [Employee Database](#51-employee-database)
   - 5.2 [Pending Approvals](#52-pending-approvals)
   - 5.3 [User Management](#53-user-management)
   - 5.4 [Departments](#54-departments)
   - 5.5 [Roles](#55-roles)
   - 5.6 [Programs](#56-programs)
   - 5.7 [Locations](#57-locations)
   - 5.8 [Countries](#58-countries)
6. [Reports](#6-reports)
7. [Contract Renewal Tracker](#7-contract-renewal-tracker)
8. [Role Permissions Summary](#8-role-permissions-summary)
9. [Key Workflows](#9-key-workflows)

---

## 1. Getting Started

### Logging In

1. Open your browser and navigate to the PeopleCentral URL
2. Enter your **email address** and **password**
3. Click **Sign In**
4. You will be taken to the Dashboard automatically

> **Note:** Your menu options depend on your assigned role. Employees see a basic menu. HR, Finance, and Operations staff see the admin menu. Superadmin sees everything.

### Signing Out

Click the **Sign out** button at the bottom of the left sidebar at any time.

---

## 2. Dashboard

**Who can access:** Everyone

The Dashboard is the first screen you see after logging in. It gives you a quick overview of the system.

**Superadmin / Admin Dashboard shows:**

| Component | Description |
|---|---|
| HR Metrics | Key numbers — total employees, active staff, pending requests |
| Leave Trends Chart | A visual graph showing leave patterns over time |
| Recent Leave Requests | A list of the latest leave submissions across all staff |
| Exit Interview Overview | A summary of ongoing and completed exit clearances |

**Regular Employee Dashboard shows:**

- A personalised view of your own leave and exit request summaries

---

## 3. Leave Management

### 3.1 My Leaves (Leave History)

**Who can access:** All users  
**Where:** Sidebar → My Leaves

This page shows every leave request you have ever submitted.

**What you can see:**

- Leave type, start date, end date, number of days
- Status of each request: **Pending**, **Approved**, or **Rejected**

**Buttons on this page:**

| Button | Action |
|---|---|
| My Leave Balance | Takes you to your current balance breakdown |
| Apply for Leave | Opens the leave application form |

---

### 3.2 Apply for Leave

**Who can access:** All users  
**Where:** Sidebar → My Leaves → Apply for Leave button

This is a multi-step form to submit a new leave request.

**Form fields:**

| Field | Description |
|---|---|
| Leave Type | Select from available leave types (e.g., Annual Leave, Sick Leave) |
| Start Date | The first day of your leave |
| End Date | The last day of your leave |
| Reason | A short explanation for your request |
| Supporting Document | Attach a file if the selected leave type requires documentation |

After submitting, the request goes to your HR Approver's queue and appears in your Leave History with a **Pending** status.

---

### 3.3 My Leave Balance

**Who can access:** All users  
**Where:** Leave History page → "My Leave Balance" button

Shows a breakdown of your leave entitlement by type.

**Summary cards at the top:**

| Card | Colour | Description |
|---|---|---|
| Total Allocated | Blue | Total hours assigned to you |
| Used | Orange | Hours you have already taken |
| Remaining | Green | Hours still available |

**Breakdown section (per leave type):**

- Leave type name and remaining hours (green)
- A progress bar showing how much you have used
- Bar colour coding:
  - **Green** — less than 60% used
  - **Orange** — 60–79% used
  - **Red** — 80% or more used
- Text showing "X hours used of Y hours total"

---

### 3.4 Leave Approvals

**Who can access:** HR, Finance, Operations, Admin, Superadmin  
**Where:** Sidebar → Leave Management → Approvals

This page shows all pending leave requests waiting for your approval.

**Table columns:**

| Column | Description |
|---|---|
| Employee Name | Name of the staff member |
| Leave Type | Type of leave requested |
| Start Date / End Date | Duration of the leave |
| Number of Days | Total days requested |
| Status | Always Pending on this page |
| Actions | Approve or Reject buttons |

Click **Approve** to grant the leave or **Reject** to decline it. The employee will be notified and their Leave History will update automatically.

---

### 3.5 Leave Balances

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → Leave Management → Leave Balances

This page allows HR to view and manage leave hour allocations for all staff.

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Staff ID | Employee identifier |
| Leave Type | The type of leave |
| Total Hours | Full entitlement |
| Used Hours | Hours taken so far |
| Remaining Hours | Remaining entitlement (red if under 20 hours) |
| Status | Good / Medium / Low badge |
| Actions | View, Edit, Delete |

**Status badge logic:**

| Badge | Colour | Condition |
|---|---|---|
| Good | Green | Less than 60% of hours used |
| Medium | Orange | 60–79% of hours used |
| Low | Red | 80% or more of hours used |

**Bulk Upload:**

1. Click the **Bulk Upload** button
2. Upload a CSV or Excel file
3. File should contain: Staff ID, Leave Type, Total Hours
4. The system auto-calculates remaining hours

**To edit a balance:**

1. Click the Actions dropdown → **Edit**
2. Adjust Total Hours or Used Hours
3. Remaining Hours calculates automatically
4. Click **Save**

---

### 3.6 Leave Types

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → Leave Management → Leave Types

This is where you define what types of leave exist in the organisation (e.g., Annual Leave, Sick Leave, Maternity Leave).

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Name | Leave type name |
| Description | Brief description |
| Country | Which country this leave type applies to |
| Trigger | Number of days (shows "Not Applicable" if 0) |
| Required Document | Yes or No |
| Created By | Who created the record |
| Date Added | Creation date |
| Status | Always Active |
| Actions | Edit or Remove |

**To add a new leave type:**

1. Click **Add Leave Type**
2. Fill in the form:

| Field | Required | Description |
|---|---|---|
| Leave Type Name | Yes | e.g., "Paternity Leave" |
| Description | Yes | e.g., "Leave granted to fathers upon birth of a child" |
| Country | Yes | Select from dropdown |
| Required Document | Yes | Yes or No |
| Trigger | No | Number of days (enter 0 if not applicable) |

3. Click **Create Leave Type**

**To edit a leave type:**

- Click the three-dot menu (⋯) → **Edit Details** → update fields → click **Update Leave Type**

**To delete a leave type:**

- Click the three-dot menu (⋯) → **Remove Record** → confirm deletion in the popup

> Use the **search bar** to filter leave types by name or country.

---

### 3.7 Leave Type Configurations

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → Leave Management → Leave Type Configs

This page links a leave type to a country and sets the number of hours an employee is entitled to.

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Leave Type | The associated leave type |
| Country | The country this config applies to |
| Annual Hours | Total annual entitlement in hours |
| Monthly Accrual Hours | Hours accrued per month (auto-calculated) |
| Actions | Edit or Remove |

**To add a configuration:**

1. Click **Add Configuration**
2. Fill in the form:

| Field | Required | Description |
|---|---|---|
| Leave Type | Yes | Select from existing leave types |
| Country | Yes | Select the applicable country |
| Hours | Yes | Enter the number of hours |
| Period | Yes | Select **Annually** or **Monthly** |
| Monthly Accrual Hours | Auto | Fills in automatically — cannot be edited |

**Period calculation logic:**

| Period Selected | Annual Hours | Monthly Accrual |
|---|---|---|
| Annually | Your input value | Input ÷ 12 (auto-calculated) |
| Monthly | Input × 12 (auto-calculated) | Your input value |

3. Click **Create Configuration**

**To edit:** Click ⋯ → **Edit Details**, adjust and save  
**To delete:** Click ⋯ → **Remove Record**, confirm in the popup

---

## 4. Exit Management

### 4.1 Submit Exit Request

**Who can access:** All users  
**Where:** Sidebar → My Exits → Exit Request

This form is used when an employee wants to formally resign and initiate the clearance process.

**Form fields:**

| Field | Description |
|---|---|
| Resignation Date | Your intended last working day |
| Reason for Leaving | Select from a dropdown of categories |
| Additional Details | As prompted by the multi-step form |

After submission, your request enters the exit clearance workflow and will be reviewed by each department in order.

---

### 4.2 My Exit Requests

**Who can access:** All users  
**Where:** Sidebar → My Exits → My Exit Requests

Shows all exit requests you have submitted and their current progress through the clearance stages.

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Resignation Date | Your stated last working day |
| Reason for Leaving | Text summary (truncated) |
| Stage | Current department reviewing your request |
| Status | Overall status of the exit |
| Submitted On | Date you submitted the request |
| Download | PDF download buttons (visible when Approved or Completed) |

**Stage badge colours:**

| Stage | Colour |
|---|---|
| Employee, Supervisor, Operations, Finance, HR | Orange (in progress) |
| HR Final, HR Director, Completed | Green (nearing or at completion) |

**Status badge colours:**

| Status | Colour |
|---|---|
| Pending | Orange |
| Approved / Completed | Green |
| Rejected | Red |

**Downloading your documents (when Completed):**

| Button | Colour | Document |
|---|---|---|
| Exit Interview PDF | Blue | Full record of your exit interview responses |
| Exit Clearance PDF | Green | Official clearance with approval trail and checklist |

---

### 4.3 Exit Approvals

**Who can access:** HR, Finance, Operations, Admin, Superadmin  
**Where:** Sidebar → Exit Management → Approvals

This is where department staff review and approve exit requests at their stage of the workflow.

**Queue filtering by role:**

| Role | Queue Visible |
|---|---|
| HR staff | HR queue only |
| Operations staff | Operations queue only |
| Finance staff | Finance queue only |
| Admin / Superadmin | All queues (can switch between All, HR, Operations, Finance) |

**Table columns:**

| Column | Description |
|---|---|
| Employee Name | The resigning employee |
| Staff ID | Employee identifier |
| Department | Employee's department |
| Resignation Date | Their stated last working day |
| Reason for Leaving | Brief summary |
| Current Stage | Where in the workflow this request sits |
| Status | Pending / Approved / Rejected / Completed |
| Actions | View, Approve, Reject, Download |

**Viewing an exit request:**

Click on a row to open the **detail drawer** on the right side. The drawer shows:

- Employee information (name, staff ID, department, location, program)
- Exit interview answers (reason for leaving, workload, supervisor feedback, ratings, benefits assessment)
- Checklist items assigned to the department
- Approval trail showing completed and pending stages

**Actions available in the drawer:**

| Action | Description |
|---|---|
| Approve | Moves the exit to the next stage |
| Reject | Stops the exit at this stage |
| Download Exit Interview PDF | Saves a PDF of the interview responses |
| Download Exit Clearance PDF | Saves the clearance and approval trail document |

**Exit workflow stage order:**

```
Employee → Supervisor → Operations → Finance → HR → HR Final → HR Director → Completed
```

---

### 4.4 Exit Checklist Management

**Who can access:** HR, Admin, Superadmin only  
**Where:** Sidebar → Exit Management → Checklist

This page lets HR define the checklist items that each department must sign off on during an exit clearance.

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Item Name | The checklist item |
| Department | Which department this item belongs to |
| Actions | Edit or Delete |

**To add a checklist item:**

1. Click **Add Checklist Item**
2. Select the **Department** this item belongs to (e.g., IT, Finance, Operations)
3. Enter the **Item Name** (e.g., "Return Laptop", "Clear Outstanding Invoices", "Hand Over Access Keys")
4. Click **Save Item**

**To edit an item:** Click ⋯ → **Edit** → update and save  
**To delete an item:** Click ⋯ → **Delete** → confirm in the popup

> These items appear in the Exit Clearance PDF once an exit is completed.

---

### 4.5 End of Service

**Who can access:** All users  
**Where:** Sidebar → Exit Management → End of Service

This page provides a final checklist that an employee works through before their last day. All items must be completed and signed off as part of the departure process.

---

## 5. HR Administration

### 5.1 Employee Database

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → HR Administration → Employee Database

A full list of all employees in the organisation.

**Table columns:**

| Column | Description |
|---|---|
| Staff ID | Unique employee identifier |
| Full Name | Employee's full name |
| Email | Work email address |
| Department | Assigned department |
| Location | Office location |
| Designation / Role | Job title |
| Status | Active, On-boarding, Pending, or Inactive |
| Contract Type | Type of employment contract |
| Start Date | Date joined the organisation |
| Actions | View, Edit, Delete |

**Search and filter:**

- Search by name, email, or staff ID
- Filter by department, location, or status

**Actions per employee:**

| Action | Description |
|---|---|
| View | See full employee profile |
| Edit | Update employee details |
| Delete | Remove the record (confirmation required) |

---

### 5.2 Pending Approvals

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → HR Administration → Pending Approvals

Shows newly registered employee accounts waiting for HR verification before they can use the system.

**Table columns:**

| Column | Description |
|---|---|
| Employee | Name, initials avatar, and designation |
| Email | Work email address |
| Department | Assigned department |
| Location | Office location |
| Status | On-boarding / Pending (orange badge) |
| Registered | Date they registered |
| Action | Approve button |

**To approve an employee:**

1. Click the **Approve** button on the employee's row
2. A drawer opens with the approval form
3. Review the details and confirm
4. The employee's status changes and they gain full system access
5. The pending count badge at the top of the page updates automatically

> When all employees are approved, the page shows: *"All caught up — no pending approvals."*

---

### 5.3 User Management

**Who can access:** Admin, Superadmin  
**Where:** Sidebar → HR Administration → User Management

Manage all system accounts — create new admin and staff users and assign their system roles.

**Table columns:**

| Column | Description |
|---|---|
| Name | User's full name |
| Email | Login email address |
| Role | System role (Superadmin, Admin, HR, Finance, Operations, etc.) |
| Status | Active or Inactive |
| Last Login | Most recent login date |
| Created Date | Account creation date |
| Actions | Edit or Delete |

**To add a new user:**

1. Click **Add New User**
2. Fill in the form:

| Field | Description |
|---|---|
| First Name | User's first name |
| Last Name | User's last name |
| Email | Login email address |
| Password | Initial password |
| Role | Determines menu access and permissions |
| Department | Assigned department |
| Status | Active or Inactive |

3. Click **Save**

> The role you assign here controls which sidebar menus the user sees and which actions they can perform across the entire system.

**To edit a user:** Find the user → click **Edit** from the actions menu  
**To delete a user:** Click **Delete** from the actions menu → confirm

---

### 5.4 Departments

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → HR Administration → Departments

Manage the list of departments in your organisation. Departments are used when assigning employees, creating checklist items, and filtering reports.

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Department Name | Name of the department |
| Created By | Who created the record |
| Date Added | Creation date |
| Status | Always Active |
| Actions | Edit or Remove |

**To add a department:**

1. Click **Add Department**
2. Enter the **Department Name** (e.g., "Finance", "Information Technology")
3. Click **Save**

**To edit:** Click ⋯ → **Edit Details**  
**To delete:** Click ⋯ → **Remove Record** → confirm

---

### 5.5 Roles

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → HR Administration → Roles

Manage job roles and designations used in the organisation. These are the titles assigned to employees (not system permission roles).

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Role Name | Title of the role |
| Description | Brief description of responsibilities |
| Created By | Who created the record |
| Date Added | Creation date |
| Actions | Edit or Remove |

**To add a role:**

1. Click **Add Role**
2. Fill in:

| Field | Required | Description |
|---|---|---|
| Role Name | Yes | e.g., "Senior Programme Officer" |
| Description | No | Brief explanation of responsibilities |

3. Click **Save**

**To edit:** Click ⋯ → **Edit Details**  
**To delete:** Click ⋯ → **Remove Record** → confirm

> Use the **search bar** to find roles by name or description.

---

### 5.6 Programs

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → HR Administration → Programs

Manage the list of active humanitarian and development programs. Programs are linked to employees and used in leave and exit reporting.

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Program Name | Name of the program |
| Fund Code | Unique integer identifier |
| Start Date | Program start date |
| End Date | Program end date |
| Country | Country of operation |
| Status | Always Active (blue badge) |
| Actions | Edit or Delete |

**To add a program:**

1. Click **Add Program**
2. Fill in:

| Field | Required | Description |
|---|---|---|
| Program Name | Yes | e.g., "Resilience Program" |
| Fund Code | Yes | Unique integer (e.g., 5001) |
| Start Date | Yes | Program start date |
| End Date | Yes | Must be after the start date |
| Country | Yes | Select from dropdown |

3. Click **Save**

**Validation rules:**
- Start date and end date cannot be the same
- End date must be after start date

**To edit:** Click ⋯ → **Edit Program**  
**To delete:** Click ⋯ → **Delete Program** → confirm

---

### 5.7 Locations

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → HR Administration → Locations

Manage the list of office locations. Locations are assigned to employees and used in leave and exit filtering and reports.

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Location Name | Name of the office/location |
| Country | Country the location is in |
| Created By | Who created the record |
| Date Added | Creation date |
| Status | Always Active |
| Actions | Edit or Remove |

**To add a location:**

1. Click **Add Location**
2. Fill in:

| Field | Required | Description |
|---|---|---|
| Location Name | Yes | e.g., "Abuja Office", "Maiduguri Field Office" |
| Country | Yes | Select from dropdown |

3. Click **Save**

**To edit:** Click ⋯ → **Edit Location**  
**To delete:** Click ⋯ → **Remove Location** → confirm

---

### 5.8 Countries

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → HR Administration → Countries

Manage the countries where the organisation operates. Countries are used as reference data across leave types, programs, locations, and leave configurations.

**Table columns:**

| Column | Description |
|---|---|
| S/N | Row number |
| Country Name | Name of the country |
| Created By | Who created the record |
| Date Added | Registration date |
| Status | Always Active |
| Actions | Edit or Remove |

**To add a country:**

1. Click **Add Country**
2. Fill in:

| Field | Required | Description |
|---|---|---|
| Country Name | Yes | e.g., "Nigeria" |
| ISO Code | Yes | 2-letter international code e.g., "NG". Auto-converts to uppercase, max 2 characters. |

3. Click **Save**

**To edit:** Click ⋯ → **Edit Country**  
**To delete:** Click ⋯ → **Remove Country** → confirm

---

## 6. Reports

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → Reports

Generate and download leave and exit reports filtered by various criteria.

**Filter options:**

| Filter | Description |
|---|---|
| Program | Filter by program |
| Office / Location | Filter by office location |
| Department | Filter by department |
| Employee | Search by employee name |
| Start Date | Report from date |
| End Date | Report to date |

**Report types:**

**Leave Reports include:**
- Employee name, Leave type, Days taken, Approval status, Dates

**Exit Reports include:**
- Employee name, Resignation date, Stage, Status, Reason

**Export formats:**
- CSV
- Excel
- PDF

Select your filters, choose your report type, and click the **Generate / Export** button to download the file.

---

## 7. Contract Renewal Tracker

**Who can access:** HR, Admin, Superadmin  
**Where:** Sidebar → Notification Tracker

Monitor employee contract end dates and take action before contracts expire.

**Table columns:**

| Column | Description |
|---|---|
| Employee Name | Staff member |
| Contract End Date | When the contract expires |
| Days Until Expiration | Countdown |
| Status | Active / Expiring Soon / Expired |
| Action | Renew Contract or View Details |

**Status indicators:**

| Status | Colour | Condition |
|---|---|---|
| Active | Green | More than 30 days remaining |
| Expiring Soon | Orange | 7 to 30 days remaining |
| Expired | Red | Past the end date or fewer than 7 days remaining |

**Actions:**

| Button | Description |
|---|---|
| Renew Contract | Opens a form to extend the contract duration |
| View Details | See the full contract information |

---

## 8. Role Permissions Summary

| Feature | Employee | HR / Finance / Operations | Admin | Superadmin |
|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| My Leaves | ✓ | ✓ | ✓ | ✓ |
| Apply for Leave | ✓ | ✓ | ✓ | ✓ |
| My Leave Balance | ✓ | ✓ | ✓ | ✓ |
| My Exit Requests | ✓ | ✓ | ✓ | ✓ |
| Submit Exit Request | ✓ | ✓ | ✓ | ✓ |
| Leave Approvals | — | ✓ | ✓ | ✓ |
| Leave Balances | — | ✓ | ✓ | ✓ |
| Leave Types | — | ✓ | ✓ | ✓ |
| Leave Type Configs | — | ✓ | ✓ | ✓ |
| Exit Approvals | — | ✓ | ✓ | ✓ |
| Exit Checklist Management | — | ✓ (HR only) | ✓ | ✓ |
| End of Service | ✓ | ✓ | ✓ | ✓ |
| Employee Database | — | ✓ | ✓ | ✓ |
| Pending Approvals | — | ✓ | ✓ | ✓ |
| User Management | — | — | ✓ | ✓ |
| Departments | — | — | ✓ | ✓ |
| Roles | — | — | ✓ | ✓ |
| Programs | — | — | ✓ | ✓ |
| Locations | — | — | ✓ | ✓ |
| Countries | — | — | ✓ | ✓ |
| Reports | — | ✓ | ✓ | ✓ |
| Contract Renewal Tracker | — | ✓ | ✓ | ✓ |

---

## 9. Key Workflows

### Leave Request Workflow

```
1. Employee submits a leave request via Apply for Leave
2. Request appears in HR Leave Approvals queue as Pending
3. HR reviews and clicks Approve or Reject
4. Employee sees the updated status in My Leaves
5. If approved, hours are deducted from the employee's Leave Balance
```

### Exit Clearance Workflow

```
1. Employee submits an exit request via Exit Request
2. Request enters the workflow:
   Employee → Supervisor → Operations → Finance → HR → HR Final → HR Director → Completed
3. Each department logs in, reviews in Exit Approvals, and approves their stage
4. When status reaches Completed, the employee can download:
   - Exit Interview PDF (record of all interview answers)
   - Exit Clearance PDF (official clearance with full approval trail and checklist)
5. Employee completes final items on the End of Service page
```

### New Employee Onboarding Workflow

```
1. New employee registers on the system
2. Their account appears in Pending Approvals with status On-boarding
3. HR clicks Approve, reviews their details, and confirms
4. Employee gains access to the system with their assigned role and menu
```

### Leave Balance Setup Workflow

```
1. Superadmin/Admin sets up Countries in HR Administration
2. Creates Leave Types linked to those countries
3. Configures Leave Type Configurations (hours per type per country and period)
4. Uploads or enters Leave Balances per employee
5. Employees can now view their balance under My Leave Balance
```

---

*Document prepared for Mercy Corps Nigeria — PeopleCentral HR Management System*
