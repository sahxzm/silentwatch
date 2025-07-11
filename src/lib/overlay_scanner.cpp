// overlay_scanner.cpp
// Windows console app to enumerate visible windows with WS_EX_LAYERED or WS_EX_TRANSPARENT
#include <windows.h>
#include <psapi.h>
#include <iostream>
#include <string>

std::wstring GetProcessName(DWORD processId) {
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processId);
    if (hProcess) {
        wchar_t filename[MAX_PATH] = {0};
        if (GetModuleFileNameExW(hProcess, NULL, filename, MAX_PATH)) {
            std::wstring fullPath(filename);
            size_t pos = fullPath.find_last_of(L"\\/");
            CloseHandle(hProcess);
            if (pos != std::wstring::npos) {
                return fullPath.substr(pos + 1);
            }
            return fullPath;
        }
        CloseHandle(hProcess);
    }
    return L"";
}

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam) {
    wchar_t title[512];
    GetWindowTextW(hwnd, title, 512);
    LONG exStyle = GetWindowLongW(hwnd, GWL_EXSTYLE);
    bool isVisible = IsWindowVisible(hwnd);
    bool isLayered = (exStyle & WS_EX_LAYERED) != 0;
    bool isTransparent = (exStyle & WS_EX_TRANSPARENT) != 0;

    if (isVisible && (isLayered || isTransparent)) {
        DWORD processId = 0;
        GetWindowThreadProcessId(hwnd, &processId);
        std::wstring processName = GetProcessName(processId);
        std::wstring titleStr = title;
        bool isNoTitle = titleStr.empty();
        if (isNoTitle) titleStr = L"(no title)";

        // Whitelist of known safe overlays (skip only if not empty)
        std::wstring safeOverlays[] = {
            L"NVIDIA GeForce Overlay", L"Xbox Game Bar", L"Discord", L"Steam", L"AMD", L"Intel", L"Microsoft", L"Overwolf", L"Logitech", L"GeForce", L"Radeon", L"OBS", L"MSI Afterburner", L"RivaTuner"
        };
        for (const auto& safe : safeOverlays) {
            if (!isNoTitle && titleStr.find(safe) != std::wstring::npos) {
                return TRUE; // skip whitelisted overlay
            }
        }

        if (isNoTitle) {
            std::wcout << L"{\"windowTitle\":\"(no title)\",\"processName\":\"" << processName << L"\",\"risk\":\"Low\",\"reason\":\"Need a check-up\"}" << std::endl;
        } else {
            std::wcout << L"{\"windowTitle\":\"" << titleStr << L"\",\"processName\":\"" << processName << L"\",\"risk\":\"High\",\"reason\":\"";
            if (isLayered) std::wcout << L"Layered ";
            if (isTransparent) std::wcout << L"Transparent";
            std::wcout << L"\"}" << std::endl;
        }
    }
    return TRUE;
}

int main() {
    EnumWindows(EnumWindowsProc, 0);
    return 0;
}
