// window_apps.cpp
// Enumerate all top-level visible windows and print their process ID and window title
#include <windows.h>
#include <psapi.h>
#include <iostream>
#include <string>
#include <vector>

struct WindowInfo {
    DWORD pid;
    std::wstring title;
};

std::vector<WindowInfo> windows;

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam) {
    wchar_t title[512];
    GetWindowTextW(hwnd, title, 512);
    if (!IsWindowVisible(hwnd) || wcslen(title) == 0) return TRUE;
    DWORD pid;
    GetWindowThreadProcessId(hwnd, &pid);
    windows.push_back({pid, title});
    return TRUE;
}

int main() {
    EnumWindows(EnumWindowsProc, 0);
    for (const auto& win : windows) {
        std::wcout << L"{\"pid\":" << win.pid << L",\"windowTitle\":\"" << win.title << L"\"}" << std::endl;
    }
    return 0;
}
