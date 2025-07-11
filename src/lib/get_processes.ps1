# Get processes with window handles and format as JSON
$processes = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle } |
    Select-Object Id, ProcessName, @{Name="MainWindowTitle"; Expression={$_.MainWindowTitle.Trim()}}

# Convert to JSON and output
$processes | ConvertTo-Json -Compress
