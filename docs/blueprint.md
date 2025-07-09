# **App Name**: Overwatch

## Core Features:

- Real-Time Process Monitoring: List all running processes (PID, name, path) in real-time.
- Suspicious Process Detection: Flag suspicious processes: Electron-based apps, unsigned programs, background apps with no window. Assign a risk level (Low/Medium/High).
- Hidden Overlay & Window Detection: Enumerate all top-level and child windows, detect transparent overlays (WS_EX_LAYERED, WS_EX_TRANSPARENT), off-screen or hidden windows.
- Overlay Evaluation Tool: Flag any suspicious overlay or hidden window, assess likelihood that it's part of a cheating tool. Incorporate rules or pattern recognition to evaluate the danger these tools present
- User Interface (Electron GUI): Display real-time logs with alerts and a refresh button; includes tabs for Process Monitor and Overlay Scanner.
- Report Generation: User-friendly reports about current state, security analysis results and risks detected.

## Style Guidelines:

- Primary color: Dark slate blue (#374785), conveying seriousness and technological focus.
- Background color: Very light gray (#F0F4F8), for comfortable readability in a desktop environment.
- Accent color: Soft green (#76D7C4), for highlights and alert indications, offset from the primary.
- Body and headline font: 'Inter', a grotesque-style sans-serif known for its neutral, objective appearance, well-suited to dense data displays.
- Use simple, clear icons to represent different processes, risk levels, and alert types. Icons should be monochrome, following the accent color, when in their 'alert' state.
- The layout should be clean and organized, with clear separation of the process list, overlay scanner, and log panel. Use tabs for easy navigation.
- Subtle animations for highlighting suspicious processes or overlays, drawing attention without being intrusive. Color-changing animations on the 'alert' green should be gentle, for comfortable readability.