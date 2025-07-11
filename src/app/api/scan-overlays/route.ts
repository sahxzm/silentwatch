import { NextResponse } from 'next/server';
import path from 'path';

// Import the scanOverlays function from your backend Node code
const monitor = require(path.join(process.cwd(), 'src', 'lib', 'monitor.js'));

// Map overlay_scanner.exe output to WindowInfo type
function mapOverlayToWindowInfo(overlay: any, id: number) {
  // Map risk to status and isSuspicious
  let status: 'Visible' | 'Hidden' | 'Off-Screen' | 'Transparent' = 'Visible';
  if (overlay.risk === 'High') status = 'Transparent';
  else if (overlay.risk === 'Low') status = 'Visible';
  // You can enhance this mapping as needed

  return {
    id,
    name: overlay.windowTitle || overlay.processName || '(no title)',
    class: overlay.processName || '',
    properties: [overlay.reason || '', overlay.risk || ''],
    status,
    isSuspicious: overlay.risk === 'High',
  };
}

export async function GET() {
  try {
    const overlays = await monitor.scanOverlays();
    const windows = overlays.map((overlay: any, idx: number) => mapOverlayToWindowInfo(overlay, idx + 1));
    return NextResponse.json(windows);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to scan overlays', details: String(err) }, { status: 500 });
  }
}
