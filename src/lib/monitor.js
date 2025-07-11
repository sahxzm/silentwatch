const { exec, execFile } = require('child_process');
const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// --- Real-Time Process Monitoring ---
async function monitorProcesses() {
  // Known safe system process names
  const systemProcesses = [
    'svchost.exe', 'wininit.exe', 'lsass.exe', 'csrss.exe', 'winlogon.exe',
    'services.exe', 'explorer.exe', 'smss.exe', 'System', 'conhost.exe',
    'dwm.exe', 'fontdrvhost.exe', 'audiodg.exe', 'spoolsv.exe', 'WUDFHost.exe',
  ];
  // Known trusted vendors (placeholder, real check needs signature API)
  const knownVendors = ['Microsoft', 'Intel', 'NVIDIA', 'AMD', 'Google', 'Mozilla'];
  // Known safe folders
  const safeFolders = [
    'C:\\Windows\\System32',
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\Windows',
  ];
  // Suspicious folders
  const suspiciousFolders = [
    'AppData', 'Temp', 'Downloads',
  ];
  // Known suspicious tool names (expand as needed)
  const suspiciousNames = ['cluely', 'cheatingdaddy', 'limitless', 'chegg', 'coursehero', 'brainly', 'studocu', 'quizlet', 'photomath', 'slader', 'mathway', 'wolframalpha', 'socscibot', 'examsoftcrack', 'proctoru-bypass', 'examhelper', 'hwbot', 'hwhelper', 'homeworkify', 'studygpt', 'gptzero-bypass', 'essaybot', 'paperhelp', 'edubirdie', 'gradesfixer', 'turnitin-bypass', 'scribbr', 'coursehack', 'testbank', 'proctorio-hack', 'hackthebox', 'studysoup', 'glass', 'pickle'];


  return new Promise((resolve, reject) => {
    exec('wmic process get ProcessId,Name,ExecutablePath', (error, stdout, stderr) => {
      if (error) return reject(error);
      const lines = stdout.split('\n').slice(1).filter(line => line.trim());
      const procMap = {};
      const processes = lines.map(line => {
        const [name, pid, exePath] = line.trim().split(/\s{2,}/);
        let score = 0;
        let lowerName = (name || '').toLowerCase();
        let lowerPath = (exePath || '').toLowerCase();

        // Unsigned binary (placeholder, +4)
        // TODO: Use sigcheck or Windows API for real check
        if (!exePath || exePath === '') score += 4;

        // Electron/Node-based (+3)
        if (lowerPath.includes('electron') || lowerPath.includes('node')) score += 3;

        // No main window (placeholder, +2)
        // TODO: Add window check via Win32 API

        // Runs from AppData or Temp (+3)
        if (suspiciousFolders.some(f => lowerPath.includes(f.toLowerCase()))) score += 3;

        // Multiple instances (+2)
        procMap[lowerName] = (procMap[lowerName] || 0) + 1;
        // We'll add +2 if > 1 after mapping

        // Known trusted vendor (-5) or system process (-5)
        if (systemProcesses.includes(lowerName)) score -= 5;
        // Located in System32 or Program Files (-3)
        if (safeFolders.some(f => lowerPath.startsWith(f.toLowerCase()))) score -= 3;

        // Known suspicious tool names (+4)
        if (suspiciousNames.some(s => lowerName.includes(s))) score += 4;

        return { pid, name, exePath, score };
      });
      // Now apply duplicate instance score
      processes.forEach(proc => {
        if (procMap[(proc.name || '').toLowerCase()] > 1) proc.score += 2;
      });
      // Assign risk
      processes.forEach(proc => {
        let risk = 'Low';
        if (proc.score > 5) risk = 'High';
        else if (proc.score >= 2) risk = 'Medium';
        proc.risk = risk;
      });
      resolve(processes);
    });
  });
}


// --- Hidden Overlay & Window Detection ---
async function scanOverlays() {
  return new Promise((resolve, reject) => {
    const exePath = path.join(__dirname, 'overlay_scanner.exe');
    execFile(exePath, [], { windowsHide: true }, (error, stdout, stderr) => {
      if (error) return reject(error);
      const overlays = [];
      stdout.split(/\r?\n/).forEach(line => {
        if (line.trim()) {
          try {
            overlays.push(JSON.parse(line));
          } catch {}
        }
      });
      resolve(overlays);
    });
  });
}

async function getRunningApps() {
  return new Promise((resolve, reject) => {
    const psScriptPath = path.join(__dirname, 'get_processes.ps1');
    const command = `powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`;
    
    exec(command, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing PowerShell script:', error);
        return reject(error);
      }
      
      try {
        // Parse the JSON output from PowerShell
        const processes = JSON.parse(stdout.trim() || '[]');
        
        // Transform to match expected format
        const apps = processes.map(proc => ({
          pid: proc.Id,
          processName: proc.ProcessName,
          windowTitle: proc.MainWindowTitle || ''
        }));
        
        resolve(apps);
      } catch (parseError) {
        console.error('Error parsing process data:', parseError);
        console.error('Raw output:', stdout);
        reject(parseError);
      }
    });
  });
}

module.exports = { monitorProcesses, scanOverlays, getRunningApps };
