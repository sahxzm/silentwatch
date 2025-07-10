// window_apps.cpp
// Hybrid: Enumerate all processes, and for each, collect all top-level windows.
#include <windows.h>
#include <tlhelp32.h>
#include <psapi.h>
#include <iostream>
#include <string>
#include <vector>

struct ProcInfo {
    DWORD pid;
    std::wstring exeName;
    std::vector<std::wstring> windowTitles;
};

std::vector<ProcInfo> procs;

// Helper: Get process name by PID
std::wstring GetProcessName(DWORD pid) {
    wchar_t name[MAX_PATH] = L"";
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);
    if (hProcess) {
        if (GetModuleBaseNameW(hProcess, NULL, name, MAX_PATH)) {
            CloseHandle(hProcess);
            return name;
        }
        CloseHandle(hProcess);
    }
    return L"";
}

// For window enumeration
struct EnumWinData {
    DWORD pid;
    std::vector<std::wstring> titles;
};

BOOL CALLBACK EnumWindowsForProcess(HWND hwnd, LPARAM lParam) {
    EnumWinData* data = (EnumWinData*)lParam;
    DWORD winPid = 0;
    GetWindowThreadProcessId(hwnd, &winPid);
    if (winPid == data->pid && GetWindow(hwnd, GW_OWNER) == NULL) { // top-level
        wchar_t title[512];
        GetWindowTextW(hwnd, title, 512);
        if (wcslen(title) > 0 || IsWindowVisible(hwnd)) {
            data->titles.push_back(title);
        }
    }
    return TRUE;
}

int main() {
    // Enumerate all processes
    HANDLE snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snap == INVALID_HANDLE_VALUE) return 1;
    PROCESSENTRY32W pe = {0};
    pe.dwSize = sizeof(pe);
    if (Process32FirstW(snap, &pe)) {
        do {
            ProcInfo info;
            info.pid = pe.th32ProcessID;
            info.exeName = pe.szExeFile;
            // Enumerate all windows for this process
            EnumWinData winData;
            winData.pid = pe.th32ProcessID;
            EnumWindows(EnumWindowsForProcess, (LPARAM)&winData);
            info.windowTitles = winData.titles;
            // Only output if at least one window (like Task Manager)
            if (!info.windowTitles.empty()) {
                std::wcout << L"{\"pid\":" << info.pid
                    << L",\"processName\":\"" << info.exeName << L"\""
                    << L",\"windowTitles\":[";
                for (size_t i = 0; i < info.windowTitles.size(); ++i) {
                    if (i > 0) std::wcout << L",";
                    std::wstring t = info.windowTitles[i];
                    // Escape quotes
                    size_t pos = 0;
                    while ((pos = t.find(L'"', pos)) != std::wstring::npos) {
                        t.replace(pos, 1, L"\\\"");
                        pos += 2;
                    }
                    std::wcout << L"\"" << t << L"\"";
                }
                std::wcout << L"]}"
                    << std::endl;
            }
        } while (Process32NextW(snap, &pe));
    }
    CloseHandle(snap);
    return 0;
}
