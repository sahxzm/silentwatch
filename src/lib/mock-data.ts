import type { Process, WindowInfo, LogEntry } from './types';

// This is a list of processes to be analyzed by the AI.
export const mockProcesses: Omit<Process, 'risk' | 'details'>[] = [
  { pid: 101, name: 'chrome.exe', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
  { pid: 202, name: 'winword.exe', path: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE' },
  { pid: 303, name: 'Glass.exe', path: 'C:\\Users\\TestUser\\AppData\\Local\\Programs\\Glass\\Glass.exe' },
  { pid: 404, name: 'svchost.exe', path: 'C:\\Windows\\System32\\svchost.exe' },
  { pid: 505, name: 'Code.exe', path: 'C:\\Users\\TestUser\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe' },
  { pid: 606, name: 'msedge.exe', path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
  { pid: 777, name: 'aimassist.exe', path: 'C:\\Users\\TestUser\\Downloads\\aimassist_v3\\aimassist.exe' },
  { pid: 909, name: 'updater.exe', path: 'C:\\Users\\TestUser\\AppData\\Roaming\\somesoft\\updater.exe' },
  { pid: 1010, name: 'background_task.exe', path: 'C:\\ProgramData\\hidden_app\\task.exe' },
  { pid: 1111, name: 'GameClient.exe', path: 'C:\\Games\\AwesomeGame\\GameClient.exe' },
  { pid: 1212, name: 'lsass.exe', path: 'C:\\Windows\\System32\\lsass.exe' },
  { pid: 1313, name: 'RuntimeBroker.exe', path: 'C:\\Windows\\System32\\RuntimeBroker.exe'},
  { pid: 1414, name: 'steam.exe', path: 'C:\\Program Files (x86)\\Steam\\steam.exe' },
  { pid: 2020, name: 'host_process.exe', path: 'C:\\Users\\TestUser\\AppData\\Local\\Temp\\ai_engine\\host_process.exe' },
];

// This is a list of windows to be analyzed by the AI.
export const mockWindows: Omit<WindowInfo, 'status' | 'isSuspicious'>[] = [
  { id: 1, name: 'Google Chrome', class: 'Chrome_WidgetWin_1', properties: ['WS_VISIBLE'] },
  { id: 2, name: 'Microsoft Word', class: 'OpusApp', properties: ['WS_VISIBLE'] },
  { id: 3, name: 'Cheat Overlay', class: 'Electron.Overlay', properties: ['WS_EX_LAYERED', 'WS_EX_TRANSPARENT'] },
  { id: 4, name: 'Hidden Helper', class: 'WorkerW', properties: ['WS_EX_TOOLWINDOW'] },
  { id: 5, name: 'Notes.txt - Notepad', class: 'Notepad', properties: ['WS_VISIBLE'] },
  { id: 6, name: 'Suspicious.exe', class: 'SomeApp.Window', properties: [] },
  { id: 7, name: 'AI Assistant Service', class: 'WorkerW', properties: ['WS_EX_TOOLWINDOW'] },
  { id: 8, name: 'Glass', class: 'Chrome_WidgetWin_1', properties: ['WS_VISIBLE'] },
  { id: 9, name: 'ProtectedRender', class: 'D3DRenderWindowClass', properties: ['WS_EX_LAYERED', 'WS_EX_TRANSPARENT', 'WDA_CONTENTPROTECTION'] },
];

export const initialLogs: LogEntry[] = [
    { id: 1, timestamp: new Date().toLocaleTimeString(), type: 'Info', message: 'Overwatch system initialized. Ready to scan.' },
]
