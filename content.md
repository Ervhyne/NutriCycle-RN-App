Below is the **FULL plan converted into a clean, copy-ready Markdown (`.md`) document**, with **nothing left out**, and with the **official NutriCycle color palette added** at the end.

You can:

* Paste this directly into a `.md` file
* Upload it to GitHub
* Use it for documentation, thesis, or handoff

---

```md
# 🌱 NutriCycle Mobile App — Full UX & System Plan

---

## 0️⃣ Core Principle (Foundation)

NutriCycle is **not a normal mobile app**.

It is:
- A **remote industrial controller**
- A **CCTV monitoring system**
- A **process supervisor**
- An **analytics & sustainability dashboard**

> ❗ **No machine = no app**

Everything is **machine-context driven**.

---

## 1️⃣ Correct User Mental Model

A real NutriCycle user thinks in this exact order:

1. **“Is my machine connected?”**
2. **“Let me see the machine (camera).”**
3. **“Let me control or monitor the process.”**
4. **“Later, I’ll analyze results.”**

### What we explicitly avoid
- ❌ Dashboard-first UX
- ❌ Analytics mixed with controls
- ❌ CCTV buried under metrics
- ❌ Navigation before machine selection

### Correct order
> **Machine → Process → Dashboard**

---

## 2️⃣ Global App States (Very Important)

The app has **two major states**, not just pages.

---

### 🟢 State 1: Machine Not Selected (Locked State)

This is the **default app state**.

**Characteristics**
- ❌ No navigation
- ❌ No dashboard
- ❌ No controls
- ❌ No process view
- ❌ No analytics

**Purpose**
> Establish a machine connection context

---

### 🟢 State 2: Machine Selected (Unlocked State)

Once a machine is selected:
- Navigation appears
- Pages unlock
- All data is scoped to that machine
- Remote control becomes possible

---

## 3️⃣ Machine Selection & Registration (AnyDesk-Style)

### 📱 Machine Lobby (Default Screen)

**UI Contents**
- NutriCycle branding
- **Your Machines** list:
  - Machine name
  - Machine ID (e.g. `NC-8F2A-91`)
  - Online / Offline indicator
- **➕ Register / Add Machine**

**Why this matters**
- Prevents contextless usage
- Enables multi-machine scaling
- Matches CCTV & remote desktop UX
- Improves safety for remote control

---

### 🔗 Machine Registration Flow

1. User taps **Register / Add Machine**
2. User enters:
   - Machine ID **or**
   - Scans QR code
3. Server validates:
   - Machine exists
   - Machine is online
   - User has permission
4. Machine is saved to user account
5. User returns to Machine Lobby

---

## 4️⃣ Navigation Model (Unlocked State)

Once a machine is selected, navigation becomes available.

### ✅ Navigation Type: Mode-Based

```

[ Machine ]   [ Process ]   [ Dashboard ]

```

These are **intent modes**, not casual tabs.

---

## 5️⃣ Mode Responsibilities (Strict Separation)

Each mode has **one job only**.

---

## 🟢 Mode 1: Machine (Primary)

> The **Control Room**

**Purpose**
- Live CCTV
- Connection health
- Remote control
- Emergency actions

### UI Structure

**A. Machine Header**
- Machine name
- Online / Offline status
- Latency
- “Switch Machine” (returns to Lobby)

**B. Live Camera Feed**
- Full-width
- 60–70% screen height
- Optional AI overlay
- Snapshot capture

**C. Quick Machine State (Read-only)**
- Mode: Auto / Manual
- Current action
- Diverter position

**D. Remote Controls**
- ▶ Start
- ⏸ Pause
- ⛔ Emergency Stop

🔒 Role-based access (Operator / Admin)

---

## 🟡 Mode 2: Process (Secondary)

> Workflow Supervisor

### Animal Feed Process (5 Steps)

1. Recognition — Waste analysis
2. Sorting — Pathway decision
3. Grinding — Size reduction
4. Dehydration — Moisture removal
5. Completion — Feed ready

Displayed as:
- Timeline
- “Step X of 5”
- Batch ID
- Feed-specific color

---

### Compost Process (4 Steps)

1. Recognition — Waste analysis
2. Sorting — Pathway decision
3. Vermicasting — Compost processing
4. Completion — Compost ready

Displayed as:
- Separate timeline
- “Step X of 4”
- Compost-specific color
- Batch ID

---

### Live Telemetry
- Motor state
- Grinder RPM
- Dryer temperature
- Humidity
- Door / diverter position

❌ No camera  
❌ No analytics  

---

## 🔵 Mode 3: Dashboard (Analytics Only)

> No control. No CCTV. Ever.

**Purpose**
- Performance tracking
- Sustainability impact
- Reporting

---

### KPI Summary
- Total Animal Feed Produced
- Total Compost Generated
- Waste Diverted from Landfill

---

### Visual Analytics

**Feed vs Compost**
- Bar chart
- Output comparison

**Waste Diversion Rate**
- Donut chart
- Percentage-based impact

---

### Operational Insights
- Efficiency trends
- Quality indicators
- Error-free runtime
- System health notes

---

## 6️⃣ What We Never Mix

| Feature | Not Allowed In |
|------|----------------|
CCTV | Dashboard, Process |
Remote Controls | Dashboard |
Analytics | Machine |
Process Timeline | Machine |
Charts | Process |

This rule keeps the UX clean and professional.

---

## 7️⃣ System Architecture (Aligned)

**Hardware**
- ESP32-CAM
- Motors, sensors, diverter, heaters

**Server (Desktop / Cloud)**
- Camera streaming
- YOLO object detection
- State machine
- APIs
- Authentication & permissions

**Mobile App**
- Viewer
- Controller
- Analytics client

**Data Flow**
```

ESP32 → Server → Mobile App
Mobile App → Server → ESP32

```

Mobile app **never communicates directly** with ESP32.

---

## 8️⃣ Why This Design Is Correct

- Matches **industrial HMI systems**
- Matches **CCTV monitoring software**
- Matches **remote desktop tools**
- Prevents dangerous UX errors
- Scales to multiple machines
- Easy to explain & defend

> “NutriCycle is a networked industrial device, not a consumer app.”

---

## 9️⃣ Development Order

1. Machine Lobby & Registration
2. Machine Mode (CCTV + Control)
3. Process Mode (Feed & Compost)
4. Dashboard (Charts & Insights)
5. History & Logs
6. Error & Alert States
7. Flutter Implementation

---

## 🎨 NutriCycle Color Palette (Official)

### Primary Colors
- **Primary Green:** `#1F5F2A`
- **Feed Green:** `#2E7D32`
- **Compost Brown:** `#6D4C41`

### Backgrounds
- **Cream Background:** `#FBF6C8`
- **Soft Green Surface:** `#E6F2E6`
- **Card White:** `#FFFFFF`

### Text
- **Primary Text:** `#1F3D26`
- **Muted Text:** `#5F7F6A`

### Status Colors
- **Warning / Active:** `#F9A825`
- **Danger / Error:** `#C62828`

---

## 🔚 Final Note

This document represents a **complete, production-grade UX and system plan** for NutriCycle.

Nothing is placeholder.
Nothing is accidental.
Everything is intentional.

```

---
