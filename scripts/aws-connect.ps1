# FitKart AWS EC2 Connection Helper for Windows
# Usage: .\scripts\aws-connect.ps1 -InstanceIP "54.123.45.67" -KeyFile "C:\path\to\fitkart-prod.pem"

param(
    [Parameter(Mandatory=$true)]
    [string]$InstanceIP,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyFile,
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ubuntu"
)

# Colors
function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

# Check if key file exists
if (!(Test-Path $KeyFile)) {
    Write-Error-Custom "❌ Key file not found: $KeyFile"
    exit 1
}

Write-Info "================================"
Write-Info "FitKart AWS EC2 Connection Setup"
Write-Info "================================"

# Step 1: Check SSH
Write-Info "`n[1/3] Checking SSH..."
$sshCheck = Get-Command ssh -ErrorAction SilentlyContinue
if ($sshCheck) {
    Write-Success "✓ SSH is installed"
} else {
    Write-Error-Custom "❌ SSH not found. Install OpenSSH-Client."
    exit 1
}

# Step 2: Set key permissions
Write-Info "`n[2/3] Setting key permissions..."
try {
    # Remove inherited permissions
    $acl = Get-Acl $KeyFile
    $acl.SetAccessRuleProtection($true, $false)
    Set-Acl -Path $KeyFile -AclObject $acl
    
    # Grant current user full control
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        [System.Security.Principal.WindowsIdentity]::GetCurrent().User,
        "FullControl",
        "Allow"
    )
    $acl.AddAccessRule($rule)
    Set-Acl -Path $KeyFile -AclObject $acl
    
    Write-Success "✓ Key permissions set correctly"
} catch {
    Write-Error-Custom "❌ Failed to set permissions: $_"
    exit 1
}

# Step 3: Connect via SSH
Write-Info "`n[3/3] Connecting to instance..."
Write-Info "Instance: $User@$InstanceIP"
Write-Info "Connecting..."

try {
    ssh -i $KeyFile "$User@$InstanceIP"
} catch {
    Write-Error-Custom "❌ Connection failed: $_"
    exit 1
}
