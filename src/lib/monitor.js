const { exec, execFile } = require('child_process');
const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// --- Real-Time Process Monitoring ---
async function monitorProcesses() {
  // Known safe system process names
  const systemProcesses = [
    'system idle process', 'system', 'secure system', 'registry', 'lsaiso.exe', 'wudfhost.exe', 'intelcphdcpsvc.exe',
    'nvdisplay.container.exe', 'memory compression', 'adesv2svc.exe', 'aaadsvc.exe', 'acerservicewrapper.exe',
    'artaimmxservice.exe', 'acersystemcentralservice.exe', 'acerqaagent.exe', 'elanfpservice.exe', 'acerdiaagent.exe',
    'acerccagent.exe', 'intelaudioservice.exe', 'oneapp.igcc.winservice.exe', 'acerezservice.exe', 'acerpixyservice.exe',
    'officeclicktorun.exe', 'ipfsvc.exe', 'mpdefendercoreservice.exe', 'ipf_uf.exe', 'rstmwservice.exe',
    'rtkauduservice64.exe', 'pg_ctl.exe', 'msmpeng.exe', 'nvcontainer.exe', 'wmiregistrationservice.exe', 'wslservice.exe',
    'acersysmonitorservice.exe', 'acersyshardwareservice.exe', 'pgagent.exe', 'jhi_service.exe', 'ngciso.exe',
    'postgres.exe', 'acerservice.exe', 'wmiprvse.exe', 'wlanext.exe', 'aggregatorhost.exe', 'nvsphelper64.exe',
    'runtimebroker.exe', 'searchindexer.exe', 'unsecapp.exe', 'accuserps.exe', 'aquauserps.exe', 'nissrv.exe',
    'securityhealthservice.exe', 'cmd.exe', 'powershell.exe', 'conhost.exe', 'ctfmon.exe', 'spoolsv.exe',
    'svchost.exe', 'wininit.exe', 'lsass.exe', 'csrss.exe', 'winlogon.exe', 'services.exe', 'explorer.exe', 'smss.exe',
    'dwm.exe', 'fontdrvhost.exe', 'audiodg.exe', 'spoolsv.exe', 'wudfhost.exe',
    // Add more as needed
  ];
  // Known trusted vendors (placeholder, real check needs signature API)
  const knownVendors = ['Microsoft', 'Intel', 'NVIDIA', 'AMD', 'Google', 'Mozilla', 'Acer'];
  // Known safe folders
  const safeFolders = [
    'c:\\windows\\system32',
    'c:\\windows',
    'c:\\windowsapps',
    'c:\\windows\\systemapps',
    'c:/windows/system32',
    'c:/windows',
    'c:/windowsapps',
    'c:/windows/systemapps', // for system user apps, optionally
    // Add more as needed
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
    // Helper to resolve correct script path in dev and packaged environments
    function getScriptPath(scriptRelativePath) {
      if (process.mainModule && process.mainModule.filename.indexOf('app.asar') > -1) {
        // In production, use resourcesPath
        return path.join(process.resourcesPath, scriptRelativePath);
      }
      // In dev, use source path
      return path.join(__dirname, scriptRelativePath);
    }
    const psScriptPath = getScriptPath('get_processes.ps1');
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

// Returns a unique list of process names that are Medium or High risk
async function getNeedConsiderationProcesses() {
  const processes = await monitorProcesses();
  // Known safe system process names (must match those in monitorProcesses)
  const systemProcesses = [
    'system idle process', 'system', 'secure system', 'registry', 'lsaiso.exe', 'wudfhost.exe', 'intelcphdcpsvc.exe',
    'nvdisplay.container.exe', 'memory compression', 'adesv2svc.exe', 'aaadsvc.exe', 'acerservicewrapper.exe',
    'artaimmxservice.exe', 'acersystemcentralservice.exe', 'acerqaagent.exe', 'elanfpservice.exe', 'acerdiaagent.exe',
    'acerccagent.exe', 'intelaudioservice.exe', 'oneapp.igcc.winservice.exe', 'acerezservice.exe', 'acerpixyservice.exe',
    'officeclicktorun.exe', 'ipfsvc.exe', 'mpdefendercoreservice.exe', 'ipf_uf.exe', 'rstmwservice.exe',
    'rtkauduservice64.exe', 'pg_ctl.exe', 'msmpeng.exe', 'nvcontainer.exe', 'wmiregistrationservice.exe', 'wslservice.exe',
    'acersysmonitorservice.exe', 'acersyshardwareservice.exe', 'pgagent.exe', 'jhi_service.exe', 'ngciso.exe',
    'postgres.exe', 'acerservice.exe', 'wmiprvse.exe', 'wlanext.exe', 'aggregatorhost.exe', 'nvsphelper64.exe',
    'runtimebroker.exe', 'searchindexer.exe', 'unsecapp.exe', 'accuserps.exe', 'aquauserps.exe', 'nissrv.exe',
    'securityhealthservice.exe', 'cmd.exe', 'powershell.exe', 'conhost.exe', 'ctfmon.exe', 'spoolsv.exe',
    'svchost.exe', 'wininit.exe', 'lsass.exe', 'csrss.exe', 'winlogon.exe', 'services.exe', 'explorer.exe', 'smss.exe',
    'dwm.exe', 'fontdrvhost.exe', 'audiodg.exe', 'spoolsv.exe', 'wudfhost.exe',
    // Add more as needed
  ];
  const safeFolders = [
    'c:\\windows\\system32',
    'c:\\windows',
    'c:\\windowsapps',
    'c:\\windows\\systemapps',
    'c:/windows/system32',
    'c:/windows',
    'c:/windowsapps',
    'c:/windows/systemapps' // for system user apps, optionally
    // Add more as needed
  ];
  // Known trusted vendors (placeholder)
  const knownVendors = ['microsoft', 'intel', 'nvidia', 'amd', 'google', 'mozilla', 'acer'];

  const uniqueNames = Array.from(new Set(
    processes.filter(p => (p.risk === 'Medium' || p.risk === 'High') &&
      !systemProcesses.includes((p.name || '').toLowerCase()) &&
      !safeFolders.some(f => (p.exePath || '').toLowerCase().startsWith(f)) &&
      !knownVendors.some(v => (p.vendor || '').toLowerCase().includes(v))
    ).map(p => p.name)
  ));
  return uniqueNames;
}

module.exports = { monitorProcesses, scanOverlays, getRunningApps, getNeedConsiderationProcesses };
