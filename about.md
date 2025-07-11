# Silentwatch - Features Overview

## 1. Desktop App Structure
- Built with Electron framework
- Main window with dimensions: 1200x800
- Handles app lifecycle events (open, close, activate)
- IPC communication for process monitoring and overlay scanning

## 2. Real-Time Process Monitoring
### Core Features
- Real-time scanning of running processes
- Risk assessment based on multiple factors
- Process path verification
- Overlay/Hidden window detection
- Need Consideration list

### Risk Assessment Criteria
- Process name verification against known safe/suspicious lists
- Vendor verification
- Folder path validation (trusted vs suspicious)
- Process signature checks (placeholder)

## 3. User Interface
### Main Tabs
1. Process Monitor
   - Searchable process list
   - PID, Name, Path, Risk Level columns
    - Refresh functionality
2. Running Applications
   - List of all running apps
3. Overlay Scanner
   - Hidden window detection
4. Need Consideration
   - List of processes requiring attention

## 4. Modern React/TSX Version
- Component-based architecture
- Dynamic state management
- Error handling and fallbacks
- Log panel for system events

## 5. Styling & UX
- Clean, modern design
- Color-coded risk levels
- Responsive layout
- Loading indicators
- Empty states

## 6. Technical Architecture
### Backend (`monitor.js`)
- Modular process monitoring
- Overlay detection
- Risk assessment
- Need Consideration logic

### Frontend
- React components
- TypeScript integration
- UI components for each feature
- State management
- Error handling

## 7. Extensibility
- Modular codebase
- Easy feature addition
- Ready for signature checks
- Component-based UI
- Separate monitoring functions