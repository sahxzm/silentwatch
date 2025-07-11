// window_apps.cpp
// Enumerate all top-level windows including process information
#include <windows.h>
#include <psapi.h>
#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <sstream>

struct WindowInfo {
    DWORD pid;
    std::wstring title;
    std::wstring processName;
};

std::vector<WindowInfo> windows;
std::set<DWORD> processedPids;

std::wstring GetProcessName(DWORD processId) {
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processId);
    if (hProcess) {
        wchar_t filename[MAX_PATH] = {0};
        if (GetModuleFileNameExW(hProcess, NULL, filename, MAX_PATH)) {
            std::wstring fullPath(filename);
            size_t pos = fullPath.find_last_of(L"\\/");
            if (pos != std::wstring::npos) {
                CloseHandle(hProcess);
                return fullPath.substr(pos + 1);
            }
        }
        CloseHandle(hProcess);
    }
    return L"";
}

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam) {
    // Skip if window is not valid
    if (!IsWindow(hwnd) || !IsWindowEnabled(hwnd)) {
        return TRUE;
    }

    // Skip if window is a tool window or not visible
    if (GetWindowLongPtr(hwnd, GWL_EXSTYLE) & WS_EX_TOOLWINDOW) {
        return TRUE;
    }

    // Get window title
    wchar_t title[512] = {0};
    GetWindowTextW(hwnd, title, 512);
    
    // Skip windows with empty or system titles
    if (wcslen(title) == 0 || 
        wcscmp(title, L"Program Manager") == 0 ||
        wcscmp(title, L"Settings") == 0) {
        return TRUE;
    }

    // Get process ID
    DWORD pid = 0;
    GetWindowThreadProcessId(hwnd, &pid);
    if (pid == 0 || processedPids.find(pid) != processedPids.end()) {
        return TRUE; // Skip already processed PIDs
    }

    // Get process name
    std::wstring processName = GetProcessName(pid);
    if (processName.empty()) {
        return TRUE; // Skip if we can't get process name
    }

    // Add to processed PIDs
    processedPids.insert(pid);

    // Add window info
    windows.push_back({pid, title, processName});
    return TRUE;
}

int main() {
    // Enumerate all top-level windows
    EnumWindows(EnumWindowsProc, 0);

    // Output results as JSON
    for (size_t i = 0; i < windows.size(); ++i) {
        const auto& win = windows[i];
        std::wcout << L"{\"pid\":" << win.pid 
                  << L",\"processName\":\"" << win.processName 
                  << L"\",\"windowTitle\":\"";
        
        // Escape special characters in title
        for (wchar_t c : win.title) {
            switch (c) {
                case L'\\': std::wcout << L"\\\\"; break;
                case L'"': std::wcout << L"\\\""; break;
                case L'\b': std::wcout << L"\\b"; break;
                case L'\f': std::wcout << L"\\f"; break;
                case L'\n': std::wcout << L"\\n"; break;
                case L'\r': std::wcout << L"\\r"; break;
                case L'\t': std::wcout << L"\\t"; break;
                default:
                    if (c < L' ' || c > 126) {
                        std::wostringstream oss;
                        oss << std::hex << (int)c;
                        std::wcout << L"\\u" << std::wstring(4 - oss.str().length(), L'0') << oss.str();
                    } else {
                        std::wcout << c;
                    }
            }
        }
        
        std::wcout << L"\"}";
        if (i < windows.size() - 1) std::wcout << std::endl;
    }
    
    return 0;
}
