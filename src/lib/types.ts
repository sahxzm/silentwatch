export type Process = {
  pid: number;
  name: string;
  path: string;
  risk: 'Low' | 'Medium' | 'High';
  details: string;
};

export type WindowInfo = {
  id: number;
  name:string;
  class: string;
  properties: string[];
  status: 'Visible' | 'Hidden' | 'Off-Screen' | 'Transparent';
  isSuspicious: boolean;
};

export type LogEntry = {
  id: number;
  timestamp: string;
  type: 'Info' | 'Warning' | 'Alert';
  message: string;
};
