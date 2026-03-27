# Student Scheduler: Technical Overview

This project is a hybrid C++ and Web application designed for student task management. It utilizes a C++ core for scheduling algorithms and data persistence, bridged to a modern React frontend via a Node.js/Express API.

## Architecture

### 1. C++ Core (The Engine)
- **Files:** `main.cpp`, `scheduler.cpp`, `storage.cpp`, `types.h`
- **Responsibility:** Data structures, sorting (by urgency/weight), persistence, and time calculations.
- **Communication:** Supports command-line flags (e.g., `--list-assignments`) and outputs data in JSON format for the backend bridge.
- **Persistence:** Flat-file storage in `scheduler_data.txt`.

### 2. Node.js/Express (The Bridge)
- **Directory:** `server/`
- **Responsibility:** Provides a RESTful API to the frontend by executing the C++ binary as a child process.
- **Key Endpoint Logic:** Maps HTTP requests to specific CLI arguments for the `./scheduler` binary.

### 3. React Frontend (The Dashboard)
- **Directory:** `client/`
- **Tech:** Vite, TypeScript, Lucide React, Vanilla CSS.
- **Features:** Visual progress bars, dynamic topic checklists, urgency badges, and readiness scores.

## Build System (`Makefile`)

The project uses a unified Makefile to manage all components:
- `make`: Compiles only the C++ binary.
- `make setup`: Builds the C++ core and installs all Node.js dependencies (`npm install`).
- `make run-server`: Starts the Express bridge server.
- `make run-client`: Starts the Vite development server for the UI.
- `make run`: Simultaneously launches both the server and client.

## Core Data Structures (`types.h`)
- `Assignment`: ID, Name, Deadline (`time_t`), Completion (%).
- `Exam`: ID, Subject, Date (`time_t`), Vector of Topics.
- `Topic`: Name, Weightage (1-10), Done (bool).

## Technical Conventions
- **C++:** Uses C++17 features and `<ctime>` for Unix timestamps.
- **JSON Bridge:** The C++ binary provides structured output to the bridge only when specific flags are passed.
- **Styling:** Prefers modern Vanilla CSS (CSS variables, Grid, Flexbox) over external CSS frameworks.
- **Icons:** Uses Lucide React for consistent and lightweight iconography.
