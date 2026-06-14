# Laundry Operations Academy — React Integration System

## OBJECTIVE

Build a complete enterprise training academy page inside the existing React Laundry Management System using the existing 9 generated training files located in:

`training-system/`

The academy must dynamically transform the training documents into an interactive internal learning platform for In & Out Laundry employees and supervisors.

The final result should feel like:

* Enterprise SaaS Academy
* Internal Corporate Training Platform
* Interactive Learning Dashboard
* Smart Laundry Operations University

---

# EXISTING TRAINING FILES

Use ALL existing files as the primary data source:

1. Full Training Manual
2. Course Outline
3. Presentation Slides Content
4. Employee Quick Guide
5. Supervisor Handbook
6. SOP Library
7. Daily Checklist Pack
8. Incident Templates Pack
9. KPI Tracking Guide

The system must parse and display content from these files dynamically.

---

# PAGE DETAILS

## ROUTE

`/training-academy`

---

# MAIN GOALS

Convert the markdown training files into:

* Interactive learning modules
* SOP viewers
* Training cards
* Quiz system
* Progress tracking
* Supervisor dashboard
* KPI learning center
* Printable training documents

---

# TECH STACK

Use:

* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Lucide React
* React Router
* Markdown renderer
* Dynamic JSON parsing

---

# PAGE STRUCTURE

## 1. HERO SECTION

Create premium academy hero section including:

* Academy title
* Employee welcome
* Overall training progress
* Completion percentage
* Total modules
* Certificates earned
* Continue learning button
* Daily task reminder

Visual style:

* Glassmorphism
* Gradient background
* Animated floating cards
* Enterprise dashboard feeling

---

## 2. SIDEBAR NAVIGATION

Create collapsible sidebar.

Sections:

* Training Modules
* SOP Library
* Quick Guides
* Supervisor Tools
* Daily Checklists
* KPI Center
* Incident Reports
* Certificates
* AI Assistant

Each item should use icons and status indicators.

---

# TRAINING MODULE SYSTEM

Generate modules automatically from:

* Full Training Manual
* Course Outline

Each module page must contain:

## MODULE HEADER

* Module title
* Difficulty level
* Estimated duration
* Completion status
* Assigned department
* Progress bar

## LEARNING CONTENT

Render:

* Objectives
* SOP steps
* Workflow diagrams
* Real examples
* Safety procedures
* Do & Don’t sections
* Common mistakes
* Quality standards

## VISUAL CONTENT

Include:

* Placeholder training videos
* Infographic placeholders
* Image placeholders
* Workflow timelines
* Interactive process cards

## INTERACTIVE FEATURES

Include:

* Expandable SOP accordions
* Quiz system
* Task completion checklist
* Supervisor notes
* Download PDF button
* Print SOP button

---

# SOP LIBRARY PAGE

Use:

* SOP Library
* Employee Quick Guide

Create searchable SOP database.

Features:

* Search bar
* Department filters
* SOP categories
* Priority levels
* Favorite SOPs
* Recently viewed SOPs

Display SOPs as:

* Expandable cards
* Printable documents
* Step-by-step workflows

---

# DAILY CHECKLIST SYSTEM

Use:

* Daily Checklist Pack

Create interactive checklist dashboard:

* Opening checklist
* Closing checklist
* Packaging checklist
* Machine inspection checklist
* Delivery checklist

Features:

* Checkbox tracking
* Completion percentage
* Supervisor approval
* Shift status

---

# INCIDENT REPORT CENTER

Use:

* Incident Templates Pack

Create:

* Incident report viewer
* Report templates
* Escalation workflows
* Severity badges
* Incident history cards

Include:

* Missing item reports
* Damaged item reports
* Machine issue reports
* Customer complaint reports

---

# KPI TRAINING CENTER

Use:

* KPI Tracking Guide

Create visual KPI dashboard including:

* Productivity charts
* Error rates
* Rewash metrics
* Delivery performance
* Employee ranking
* Team performance

Use:

* Progress cards
* Analytics widgets
* Leaderboards
* Performance heatmaps

---

# SUPERVISOR DASHBOARD

Use:

* Supervisor Handbook

Create management section:

* Team monitoring
* Shift handover
* Employee performance
* Quality inspection
* Attendance tracking
* Incident escalation

---

# PRESENTATION MODE

Use:

* Presentation Slides Content

Create:

* Slide preview system
* Fullscreen training mode
* Auto presentation mode
* Training carousel
* Visual learning viewer

Style:

* Clean presentation layouts
* Animated slide transitions
* Corporate training visuals

---

# AI TRAINING ASSISTANT

Create AI helper panel:

* Search SOPs
* Explain workflows
* Suggest training modules
* Recommend corrective actions
* Answer employee questions

UI:

* Floating assistant card
* Chat-style interface
* Smart recommendations

---

# DESIGN STYLE

Use:

* Apple Glass UI inspiration
* Soft shadows
* Rounded 2xl cards
* Blur backgrounds
* Purple/blue gradients
* Enterprise dashboard style
* Clean typography
* Smooth spacing
* Premium SaaS feeling

Brand colors:

* Primary: #A23EFB
* Secondary: #6771F5
* Background: #F8FAFC

---

# REQUIRED COMPONENTS

Create:

* TrainingAcademyPage.tsx
* TrainingSidebar.tsx
* TrainingHero.tsx
* ModuleViewer.tsx
* SOPViewer.tsx
* QuizSection.tsx
* ChecklistTracker.tsx
* ProgressDashboard.tsx
* IncidentCenter.tsx
* SupervisorDashboard.tsx
* PresentationViewer.tsx
* KPIAnalytics.tsx
* AITrainingAssistant.tsx

---

# DATA SYSTEM

Create dynamic parser system that:

* Reads markdown files
* Converts sections into structured data
* Generates UI automatically
* Supports future training modules

Use:

* JSON transformation layer
* Markdown rendering
* Dynamic routing

---

# ADVANCED FEATURES

Add:

* Employee achievements
* Certificate system
* Learning streaks
* Training reminders
* Notifications
* Module bookmarks
* Continue learning tracking
* Recently viewed sections
* Department-based access

# MULTI-LANGUAGE TRAINING SUPPORT

Add a language selection system for every employee or worker.

The employee must be able to choose their preferred training language from:

1. Arabic
2. English
3. Urdu
4. Hindi
5. Filipino / Tagalog

## REQUIREMENTS

Create a language selector in the Training Academy page.

Place it in:

* Top header
* Employee profile area
* First login onboarding screen

## LANGUAGE BEHAVIOR

When the employee selects a language:

* All training content should switch to the selected language
* Module titles should translate
* SOP steps should translate
* Checklists should translate
* Quiz questions should translate
* Safety warnings should translate
* Buttons and UI labels should translate
* Certificate text should translate

## TECHNICAL REQUIREMENTS

Use i18n structure.

Create language files:

* `en.json`
* `ar.json`
* `ur.json`
* `hi.json`
* `tl.json`

Suggested path:

`src/locales/`

## LANGUAGE CODES

Use:

* English: `en`
* Arabic: `ar`
* Urdu: `ur`
* Hindi: `hi`
* Filipino / Tagalog: `tl`

## RTL SUPPORT

Enable RTL layout automatically for:

* Arabic
* Urdu

LTR layout for:

* English
* Hindi
* Filipino / Tagalog

When RTL language is selected:

* Sidebar should move to the right
* Text alignment should become right
* Icons and arrows should flip direction
* Layout should remain clean and professional

## USER EXPERIENCE

Add:

* Language dropdown
* Country flag icons
* Language name in native script
* Save selected language in localStorage
* Remember user language on next login
* Allow language change anytime

## EXAMPLE LANGUAGE SELECTOR OPTIONS

English
العربية
اردو
हिन्दी
Filipino / Tagalog

## AI TRANSLATION SUPPORT

If the 9 training files are only available in English:

Create a translation layer that can:

* Load original English content
* Generate translated versions for each supported language
* Store translated content as JSON or markdown
* Allow future manual correction by admin

## ADMIN FEATURE

Add admin translation management page:

Route:
`/training-academy/translations`

Admin can:

* View original English text
* Edit Arabic translation
* Edit Urdu translation
* Edit Hindi translation
* Edit Filipino translation
* Save corrected translations
* Mark translation as reviewed

## FINAL RESULT

The Training Academy must become a multilingual employee learning platform suitable for a real UAE laundry company with workers from different nationalities.


---

# FINAL RESULT

The final platform must feel like:

* A premium enterprise training academy
* Internal operational university
* Modern SaaS learning system
* Interactive employee onboarding platform
* AI-powered laundry operations academy

The UI must look production-ready and visually impressive.
