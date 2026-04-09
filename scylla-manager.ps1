#Requires -Version 5.1
<#
.SYNOPSIS
    Manages ScyllaDB container and keyspace for Project Management application.

.DESCRIPTION
    Automates ScyllaDB Docker container lifecycle via WSL including:
    - Container setup and configuration
    - Keyspace creation (project_management)
    - Connection testing and cqlsh access
    - Monitoring and log viewing

.PARAMETER Setup
    Pull image, create container, and initialize keyspace

.PARAMETER Status
    Check container status, health, and connection

.PARAMETER Connect
    Open interactive cqlsh session with project keyspace

.PARAMETER Stop
    Gracefully stop the ScyllaDB container

.PARAMETER Start
    Start an existing stopped container

.PARAMETER Restart
    Restart the ScyllaDB container

.PARAMETER Reset
    Drop and recreate project keyspace (ALL data in keyspace will be lost)

.PARAMETER Logs
    Display container logs

.PARAMETER Keyspaces
    List all available keyspaces

.PARAMETER Tables
    List tables in project keyspace

.PARAMETER Schema
    Load/reload schema from schema.cql file

.PARAMETER Execute
    Execute a CQL command against the database

.PARAMETER ShowDebug
    Show detailed output for troubleshooting

.EXAMPLE
    .\scylla-manager.ps1 -Setup
    .\scylla-manager.ps1 -Status
    .\scylla-manager.ps1 -Connect
    .\scylla-manager.ps1 -Execute "SELECT * FROM system.local;"
    .\scylla-manager.ps1 -Status -Debug

.NOTES
    Author: Project Management Team
    Requires: Docker installed and accessible via WSL
#>

[CmdletBinding(DefaultParameterSetName = 'Action')]
param(
    [Parameter(ParameterSetName = 'Action')][switch]$Setup,
    [Parameter(ParameterSetName = 'Action')][switch]$Status,
    [Parameter(ParameterSetName = 'Action')][switch]$Connect,
    [Parameter(ParameterSetName = 'Action')][switch]$Stop,
    [Parameter(ParameterSetName = 'Action')][switch]$Start,
    [Parameter(ParameterSetName = 'Action')][switch]$Restart,
    [Parameter(ParameterSetName = 'Action')][switch]$Reset,
    [Parameter(ParameterSetName = 'Action')][switch]$Logs,
    [Parameter(ParameterSetName = 'Action')][switch]$Keyspaces,
    [Parameter(ParameterSetName = 'Action')][switch]$Tables,
    [Parameter(ParameterSetName = 'Action')][switch]$Schema,
    [Parameter(ParameterSetName = 'Execute')][string]$Execute,
    [switch]$ShowDebug
)

# ============================================================================
# Configuration
# ============================================================================
$script:Config = @{
    ContainerName  = "scylladb"
    Image          = "scylladb/scylla:latest"
    Port           = 9042
    ApiPort        = 9180
    Keyspace       = "project_management"
    Replication    = "{'class': 'SimpleStrategy', 'replication_factor': 1}"
    MaxWaitSeconds = 60
    PollInterval   = 2
}

# ============================================================================
# Logging Functions
# ============================================================================
function Write-Log {
    param(
        [Parameter(Mandatory)][string]$Message,
        [ValidateSet('INFO', 'SUCCESS', 'ERROR', 'WARN', 'DEBUG')][string]$Level = 'INFO'
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        'INFO'    { 'Cyan' }
        'SUCCESS' { 'Green' }
        'ERROR'   { 'Red' }
        'WARN'    { 'Yellow' }
        'DEBUG'   { 'Magenta' }
    }
    
    Write-Host "[$timestamp]" -ForegroundColor DarkGray -NoNewline
    Write-Host "[$Level] " -ForegroundColor $color -NoNewline
    Write-Host $Message
}

function Write-Debug-Log($message) {
    if ($ShowDebug) {
        Write-Log $message -Level 'DEBUG'
    }
}

# ============================================================================
# Prerequisite Checks
# ============================================================================
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check WSL
    try {
        $wslCheck = wsl --status 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "WSL is not available"
        }
        Write-Log "WSL is available" -Level 'SUCCESS'
        Write-Debug-Log "WSL Status: $($wslCheck[0])"
    } catch {
        Write-Log "WSL check failed: $_" -Level 'ERROR'
        Write-Log "Please install WSL: wsl --install" -Level 'ERROR'
        exit 1
    }
    
    # Check Docker via WSL
    try {
        $dockerVersion = wsl docker version --format "{{.Server.Version}}" 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Docker is not running or not accessible"
        }
        Write-Log "Docker is running (version: $dockerVersion)" -Level 'SUCCESS'
    } catch {
        Write-Log "Docker check failed: $_" -Level 'ERROR'
        Write-Log "Please ensure Docker Desktop is running with WSL2 backend" -Level 'ERROR'
        exit 1
    }
}

# ============================================================================
# WSL Docker Command Helper
# ============================================================================
function Invoke-WslDocker {
    param(
        [Parameter(Mandatory)][string]$Command,
        [switch]$IgnoreError
    )
    
    Write-Debug-Log "Executing: wsl docker $Command"
    
    $output = wsl bash -c "docker $Command" 2>&1
    $exitCode = $LASTEXITCODE
    
    Write-Debug-Log "Exit code: $exitCode"
    if ($ShowDebug -and $output) {
        Write-Debug-Log "Output: $output"
    }
    
    if ($exitCode -ne 0 -and -not $IgnoreError) {
        Write-Log "Command failed: docker $Command" -Level 'ERROR'
        Write-Log "Error: $($output -join ' ')" -Level 'ERROR'
        return $null
    }
    
    return $output
}

function Invoke-CqlCommand {
    param(
        [Parameter(Mandatory)][string]$CQL,
        [switch]$IgnoreError,
        [switch]$NoKeyspace
    )

    Write-Debug-Log "Executing CQL: $CQL"

    # Write CQL to temp file and use -f flag for file execution
    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        $CQL | Out-File -FilePath $tempFile -Encoding ascii -NoNewline

        # Convert Windows path to WSL path
        $wslPath = $tempFile -replace '\\', '/'
        $wslPath = $wslPath -replace '^([A-Z]):', '/mnt/$1'
        $wslPath = $wslPath.ToLower()

        if ($NoKeyspace) {
            $command = "docker exec $($script:Config.ContainerName) cqlsh -f $wslPath"
        } else {
            $command = "docker exec $($script:Config.ContainerName) cqlsh -k $($script:Config.Keyspace) -f $wslPath"
        }

        $output = wsl bash -c $command 2>&1
        $exitCode = $LASTEXITCODE

        Write-Debug-Log "CQL exit code: $exitCode"
        Write-Debug-Log "CQL output: $($output -join ' ')"

        # Check for syntax errors in output
        $hasError = $output -match 'SyntaxException|ServerError|ConnectionException|no viable alternative'

        if ($exitCode -ne 0 -or $hasError) {
            if (-not $IgnoreError) {
                Write-Log "CQL command failed" -Level 'ERROR'
                Write-Log "CQL: $CQL" -Level 'ERROR'
                Write-Log "Error: $($output -join ' ')" -Level 'ERROR'
                return $null
            }
        }

        return $output
    } finally {
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
    }
}

# ============================================================================
# Health Check Functions
# ============================================================================
function Wait-ForScyllaDB {
    Write-Log "Waiting for ScyllaDB to be ready..."
    
    $elapsed = 0
    while ($elapsed -lt $script:Config.MaxWaitSeconds) {
        try {
            $result = Invoke-WslDocker "exec $($script:Config.ContainerName) nodetool status" -IgnoreError
            if ($result -and $LASTEXITCODE -eq 0) {
                Write-Log "ScyllaDB is ready and accepting connections" -Level 'SUCCESS'
                return $true
            }
        } catch {
            # Container not ready yet
        }
        
        Write-Debug-Log "Still waiting... ($elapsed/$($script:Config.MaxWaitSeconds)s)"
        Start-Sleep -Seconds $script:Config.PollInterval
        $elapsed += $script:Config.PollInterval
    }
    
    Write-Log "Timeout waiting for ScyllaDB (waited $($script:Config.MaxWaitSeconds)s)" -Level 'ERROR'
    return $false
}

function Test-PortConnection {
    Write-Log "Testing TCP connection to localhost:$($script:Config.Port)..."
    
    try {
        $tcp = Test-NetConnection -ComputerName localhost -Port $script:Config.Port -WarningAction SilentlyContinue
        if ($tcp.TcpTestSucceeded) {
            Write-Log "Port $($script:Config.Port) is open and accepting connections" -Level 'SUCCESS'
            return $true
        } else {
            Write-Log "Cannot connect to port $($script:Config.Port)" -Level 'ERROR'
            return $false
        }
    } catch {
        Write-Log "Port test failed: $_" -Level 'ERROR'
        return $false
    }
}

# ============================================================================
# Action Functions
# ============================================================================
function Invoke-Setup {
    Write-Log "Starting ScyllaDB setup..." -Level 'INFO'
    
    # Check if container exists
    $containerExists = Invoke-WslDocker "ps -a --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    
    if ($containerExists -contains $script:Config.ContainerName) {
        Write-Log "Container already exists, checking state..." -Level 'WARN'
        
        $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
        if ($isRunning -contains $script:Config.ContainerName) {
            Write-Log "Container is already running" -Level 'SUCCESS'
        } else {
            Write-Log "Starting existing container..." -Level 'INFO'
            Invoke-WslDocker "start $($script:Config.ContainerName)"
            if ($LASTEXITCODE -ne 0) {
                Write-Log "Failed to start container" -Level 'ERROR'
                exit 1
            }
        }
    } else {
        # Pull image
        Write-Log "Pulling ScyllaDB image (this may take a while)..." -Level 'INFO'
        Invoke-WslDocker "pull $($script:Config.Image)"
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to pull image" -Level 'ERROR'
            exit 1
        }
        
        # Create and run container
        Write-Log "Creating ScyllaDB container..." -Level 'INFO'
        $runCommand = "run -d --name $($script:Config.ContainerName) -p $($script:Config.Port):9042 -p $($script:Config.ApiPort):9180 --restart unless-stopped $($script:Config.Image) --smp 2 --memory 4G --overprovisioned 1"
        Invoke-WslDocker $runCommand
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to create container" -Level 'ERROR'
            exit 1
        }
    }
    
    # Wait for readiness
    if (-not (Wait-ForScyllaDB)) {
        Write-Log "Setup incomplete - container running but not ready" -Level 'WARN'
        exit 1
    }
    
    # Test port
    Test-PortConnection
    
    # Create keyspace
    Write-Log "Creating keyspace '$($script:Config.Keyspace)'..." -Level 'INFO'
    $createKeyspaceCQL = "CREATE KEYSPACE IF NOT EXISTS $($script:Config.Keyspace) WITH replication = $($script:Config.Replication);"
    $result = Invoke-CqlCommand -CQL $createKeyspaceCQL
    if ($result) {
        Write-Log "Keyspace '$($script:Config.Keyspace)' is ready" -Level 'SUCCESS'
        
        # Load schema if schema.cql exists
        Invoke-LoadSchema
    } else {
        Write-Log "Keyspace creation may have failed" -Level 'WARN'
    }

    Write-Log "Setup complete! Connection string: localhost:$($script:Config.Port)/$($script:Config.Keyspace)" -Level 'SUCCESS'
}

function Invoke-Status {
    Write-Log "Checking ScyllaDB status..." -Level 'INFO'
    
    # Check container
    $containerInfo = Invoke-WslDocker "ps -a --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}|{{.Status}}|{{.Ports}}`"" -IgnoreError
    
    if (-not $containerInfo) {
        Write-Log "Container '$($script:Config.ContainerName)' not found" -Level 'ERROR'
        Write-Log "Run: .\scylla-manager.ps1 -Setup" -Level 'WARN'
        exit 1
    }
    
    $parts = $containerInfo -split '\|'
    Write-Log "Container: $($parts[0])" -Level 'INFO'
    Write-Log "Status: $($parts[1])" -Level 'INFO'
    Write-Log "Ports: $($parts[2])" -Level 'INFO'
    
    # Check if running
    $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    if ($isRunning -contains $script:Config.ContainerName) {
        Write-Log "Container is running" -Level 'SUCCESS'
        Test-PortConnection
        
        # Show nodetool status
        Write-Log "ScyllaDB cluster status:" -Level 'INFO'
        $nodeStatus = Invoke-WslDocker "exec $($script:Config.ContainerName) nodetool status" -IgnoreError
        if ($nodeStatus) {
            Write-Host ($nodeStatus -join "`n")
        }
    } else {
        Write-Log "Container is stopped" -Level 'WARN'
        Write-Log "Run: .\scylla-manager.ps1 -Start" -Level 'WARN'
    }
}

function Invoke-Connect {
    # Verify container is running
    $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    if ($isRunning -notcontains $script:Config.ContainerName) {
        Write-Log "Container is not running. Start it first with -Setup or -Start" -Level 'ERROR'
        exit 1
    }
    
    Write-Log "Connecting to cqlsh (keyspace: $($script:Config.Keyspace))..." -Level 'INFO'
    Write-Log "Press Ctrl+D or type 'exit' to disconnect" -Level 'WARN'
    
    wsl docker exec -it $script:Config.ContainerName cqlsh -k $script:Config.Keyspace
}

function Invoke-Stop {
    $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    
    if ($isRunning -notcontains $script:Config.ContainerName) {
        Write-Log "Container is not running" -Level 'WARN'
        return
    }
    
    Write-Log "Stopping ScyllaDB container..." -Level 'INFO'
    Invoke-WslDocker "stop $($script:Config.ContainerName)"
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Container stopped successfully" -Level 'SUCCESS'
    } else {
        Write-Log "Failed to stop container" -Level 'ERROR'
        exit 1
    }
}

function Invoke-Start {
    $containerExists = Invoke-WslDocker "ps -a --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    
    if ($containerExists -notcontains $script:Config.ContainerName) {
        Write-Log "Container does not exist. Run -Setup first" -Level 'ERROR'
        exit 1
    }
    
    Write-Log "Starting ScyllaDB container..." -Level 'INFO'
    Invoke-WslDocker "start $($script:Config.ContainerName)"
    if ($LASTEXITCODE -eq 0) {
        Wait-ForScyllaDB
        Write-Log "Container started" -Level 'SUCCESS'
    } else {
        Write-Log "Failed to start container" -Level 'ERROR'
        exit 1
    }
}

function Invoke-Restart {
    Write-Log "Restarting ScyllaDB container..." -Level 'INFO'
    Invoke-WslDocker "restart $($script:Config.ContainerName)"
    if ($LASTEXITCODE -eq 0) {
        Wait-ForScyllaDB
        Write-Log "Container restarted" -Level 'SUCCESS'
    } else {
        Write-Log "Failed to restart container" -Level 'ERROR'
        exit 1
    }
}

function Invoke-Reset {
    Write-Log "=== RESET KEYSPACE ===" -Level 'WARN'
    Write-Log "This will drop keyspace '$($script:Config.Keyspace)' and ALL its tables/data" -Level 'WARN'
    Write-Log "Then recreate it fresh (container untouched)" -Level 'WARN'
    Write-Log " "
    Write-Log "Are you sure? (Y/N)" -Level 'WARN'
    $confirm = Read-Host
    
    if ($confirm -notmatch '^[Yy]$') {
        Write-Log "Reset cancelled" -Level 'INFO'
        return
    }
    
    # Verify container is running
    $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    if ($isRunning -notcontains $script:Config.ContainerName) {
        Write-Log "Container is not running" -Level 'ERROR'
        exit 1
    }
    
    # Step 1: Drop keyspace
    Write-Log "Dropping keyspace '$($script:Config.Keyspace)'..." -Level 'INFO'
    $dropCQL = "DROP KEYSPACE IF EXISTS $($script:Config.Keyspace);"
    Invoke-CqlCommand -CQL $dropCQL -IgnoreError -NoKeyspace

    # Check if keyspace actually dropped
    $keyspaces = Invoke-CqlCommand -CQL "DESCRIBE KEYSPACES;" -IgnoreError -NoKeyspace
    $stillExists = $keyspaces -match $script:Config.Keyspace

    if ($stillExists) {
        Write-Log "Failed to drop keyspace" -Level 'ERROR'
        exit 1
    }
    Write-Log "Keyspace dropped" -Level 'SUCCESS'

    # Step 2: Recreate keyspace
    Write-Log "Creating keyspace '$($script:Config.Keyspace)'..." -Level 'INFO'
    $createCQL = "CREATE KEYSPACE IF NOT EXISTS $($script:Config.Keyspace) WITH replication = $($script:Config.Replication);"
    Invoke-CqlCommand -CQL $createCQL -IgnoreError -NoKeyspace

    Write-Log "Keyspace '$($script:Config.Keyspace)' is ready" -Level 'SUCCESS'

    # Load schema
    Invoke-LoadSchema

    Write-Log "=== RESET COMPLETE ===" -Level 'SUCCESS'
    Write-Log "Keyspace '$($script:Config.Keyspace)' is fresh and ready" -Level 'SUCCESS'
}

function Invoke-LoadSchema {
    $schemaPath = Join-Path $PSScriptRoot "schema.cql"

    if (-not (Test-Path $schemaPath)) {
        Write-Log "Schema file not found at: $schemaPath" -Level 'WARN'
        Write-Log "Skipping schema load" -Level 'INFO'
        return
    }

    Write-Log "Loading schema from: schema.cql" -Level 'INFO'

    # Read entire file and strip comments
    $rawContent = Get-Content $schemaPath -Raw

    if ([string]::IsNullOrWhiteSpace($rawContent)) {
        Write-Log "Schema file is empty" -Level 'WARN'
        return
    }

    # Remove comments but preserve string literals containing --
    # Only match comments that are: at start of line, or preceded by whitespace/semicolon
    $cleanContent = $rawContent -replace '(?m)(^|\s+)--[^\n]*', '$1'
    $cleanContent = $cleanContent -replace '(?i)\s*USE\s+\w+\s*;', ''

    if ([string]::IsNullOrWhiteSpace($cleanContent)) {
        Write-Log "No valid CQL statements found in schema file" -Level 'WARN'
        return
    }

    # Count statements for reporting
    $statements = $cleanContent -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '\S' }

    # Write to Windows temp file and convert to WSL path
    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        $cleanContent | Out-File -FilePath $tempFile -Encoding ascii -NoNewline
        $wslPath = $tempFile -replace '\\', '/'
        $wslPath = $wslPath -replace '^([A-Z]):', '/mnt/$1'
        $wslPath = $wslPath.ToLower()

        # Execute entire schema file at once via stdin pipe
        $command = "docker exec -i $($script:Config.ContainerName) cqlsh -k $($script:Config.Keyspace) < $wslPath"
        $output = wsl bash -c $command 2>&1
        $exitCode = $LASTEXITCODE

        if ($exitCode -ne 0 -or ($output -match 'SyntaxException|ServerError|ConnectionException')) {
            Write-Log "Schema load failed!" -Level 'ERROR'
            Write-Log "Error: $($output -join ' ')" -Level 'ERROR'
        } else {
            Write-Log "Schema loaded successfully! ($($statements.Count) tables/indexes created)" -Level 'SUCCESS'
        }
    } finally {
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
    }
}

function Invoke-Logs {
    $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    
    if ($isRunning -notcontains $script:Config.ContainerName) {
        Write-Log "Container is not running" -Level 'ERROR'
        exit 1
    }
    
    Write-Log "Showing logs (Ctrl+C to exit)..." -Level 'INFO'
    wsl docker logs -f --tail 100 $script:Config.ContainerName
}

function Invoke-ListKeyspaces {
    $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    
    if ($isRunning -notcontains $script:Config.ContainerName) {
        Write-Log "Container is not running" -Level 'ERROR'
        exit 1
    }
    
    Write-Log "Available keyspaces:" -Level 'INFO'
    $result = Invoke-CqlCommand -CQL "DESCRIBE KEYSPACES;"
    if ($result) {
        Write-Host ($result -join "`n")
    }
}

function Invoke-ListTables {
    $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    
    if ($isRunning -notcontains $script:Config.ContainerName) {
        Write-Log "Container is not running" -Level 'ERROR'
        exit 1
    }
    
    Write-Log "Tables in '$($script:Config.Keyspace)' keyspace:" -Level 'INFO'
    $result = Invoke-CqlCommand -CQL "USE $($script:Config.Keyspace); DESCRIBE TABLES;"
    if ($result) {
        Write-Host ($result -join "`n")
    }
}

function Invoke-Execute {
    param([string]$CQL)
    
    $isRunning = Invoke-WslDocker "ps --filter `"name=$($script:Config.ContainerName)`" --format `"{{.Names}}`"" -IgnoreError
    
    if ($isRunning -notcontains $script:Config.ContainerName) {
        Write-Log "Container is not running" -Level 'ERROR'
        exit 1
    }
    
    Write-Log "Executing: $CQL" -Level 'INFO'
    $result = Invoke-CqlCommand -CQL $CQL
    if ($result) {
        Write-Host ($result -join "`n")
    }
}

function Show-Help {
    Write-Host @"

ScyllaDB Manager - Project Management Database
Keyspace: $($script:Config.Keyspace) | Port: $($script:Config.Port)

Usage: .\scylla-manager.ps1 [OPTION]

Container Management:
  -Setup       Initialize container and create keyspace
  -Start       Start existing container
  -Stop        Stop running container
  -Restart     Restart container
  -Reset       Drop and recreate project keyspace (data loss!)

Information:
  -Status      Show container status and health check
  -Logs        Follow container logs
  -Keyspaces   List all keyspaces
  -Tables      List tables in project keyspace
  -Schema      Load/reload schema from file

Interactive:
  -Connect     Open cqlsh session with project keyspace
  -Execute     Run CQL command and exit

Options:
  -ShowDebug   Show detailed debug output
  -Help        Show this help message

Examples:
  .\scylla-manager.ps1 -Setup                    # Initial setup
  .\scylla-manager.ps1 -Status                   # Check health
  .\scylla-manager.ps1 -Connect                  # Interactive shell
  .\scylla-manager.ps1 -Execute "DESCRIBE TABLES;"  # Run query
  .\scylla-manager.ps1 -Status -ShowDebug        # Detailed status

"@ -ForegroundColor Cyan
}

# ============================================================================
# Main Execution
# ============================================================================

# Show help if no parameters
$hasAction = $Setup -or $Status -or $Connect -or $Stop -or $Start -or $Restart -or $Reset -or $Schema -or $Logs -or $Keyspaces -or $Tables -or $Execute

if (-not $hasAction) {
    Show-Help
    exit 0
}

# Check prerequisites (except for help)
Test-Prerequisites

# Execute requested action
if ($Setup)    { Invoke-Setup }
if ($Status)   { Invoke-Status }
if ($Connect)  { Invoke-Connect }
if ($Stop)     { Invoke-Stop }
if ($Start)    { Invoke-Start }
if ($Restart)  { Invoke-Restart }
if ($Reset)    { Invoke-Reset }
if ($Logs)     { Invoke-Logs }
if ($Keyspaces){ Invoke-ListKeyspaces }
if ($Tables)   { Invoke-ListTables }
if ($Schema)   { Invoke-LoadSchema }
if ($Execute)  { Invoke-Execute -CQL $Execute }

exit 0
