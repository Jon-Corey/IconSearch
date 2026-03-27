# Downloads the latest Tabler Icons release, extracts SVG metadata, and writes icons.json.

$ErrorActionPreference = "Stop"

# Constants
$LatestReleaseUrl = 'https://api.github.com/repos/tabler/tabler-icons/releases/latest'
$LogBatchSize = 500
$OutputFile = [System.IO.Path]::GetFullPath("$PSScriptRoot/../Site/assets/data/icons.json")

function Write-Log {
    param(
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::Cyan
    )

    $timestamp = (Get-Date).ToString('HH:mm:ss')
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Remove-Frontmatter {
    param([string]$Content)

    $firstIndex = $Content.IndexOf("<!--")
    if ($firstIndex -lt 0) {
        return $Content
    }

    $secondIndex = $Content.IndexOf("-->", $firstIndex + 4)
    if ($secondIndex -lt 0) {
        return $Content
    }

    return $Content.Substring($secondIndex + 3).Trim()
}

function Get-MetadataMatch {
    param(
        [string]$Content,
        [string]$Pattern
    )

    return [regex]::Match($Content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
}

Write-Log "Selected Output File: $OutputFile" -Color ([ConsoleColor]::White)

# workDir is the directory where the repo will be downloaded to
# The directory will be created if it doesn't exist and deleted after the script is done
$WorkDir = [System.IO.Path]::GetFullPath("$PSScriptRoot/Temp")

Write-Log "Preparing temp directory..."
if (Test-Path $WorkDir) {
    Remove-Item -LiteralPath $WorkDir -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $WorkDir | Out-Null

try {
    # Download the latest version of Tabler Icons from GitHub
    Write-Log "Getting latest release..."

    # GitHub API requires a user-agent header
    $headers = @{ 'User-Agent' = 'automated-build-script' }

    $apiResponse = Invoke-RestMethod -Uri $LatestReleaseUrl -Headers $headers
    if (-not $apiResponse -or -not $apiResponse.zipball_url) {
        throw "Failed to parse API response."
    }

    $zipUrl = $apiResponse.zipball_url
    $version = $apiResponse.tag_name

    Write-Log "Latest version: $version"

    # Download the zip file
    Write-Log "Downloading zip file..."
    $zipPath = Join-Path $WorkDir 'tabler-icons.zip'
    Invoke-WebRequest -Uri $zipUrl -Headers $headers -OutFile $zipPath

    # Extract the zip file
    Write-Log "Extracting zip file..."
    Expand-Archive -Path $zipPath -DestinationPath $WorkDir -Force

    # Extract icon data from the extracted files
    Write-Log "Extracting icon data..."

    $extractedDir = Get-ChildItem -Path $WorkDir -Directory | Select-Object -First 1
    if (-not $extractedDir) {
        throw "Failed to find extracted directory."
    }

    $iconsDir = Join-Path $extractedDir.FullName 'icons'
    $styleDirs = Get-ChildItem -Path $iconsDir -Directory | Sort-Object -Property Name

    # Use a map keyed by icon name for fast merges across styles
    $iconsByName = @{}

    foreach ($styleDir in $styleDirs) {
        Write-Log "Processing '$($styleDir.Name)' icons..."

        $svgFiles = Get-ChildItem -Path $styleDir.FullName -Filter "*.svg" -File
        foreach ($svgFile in $svgFiles) {
            $iconName = [System.IO.Path]::GetFileNameWithoutExtension($svgFile.Name).ToLowerInvariant()
            $styleName = $styleDir.Name.ToLowerInvariant()

            if (-not $iconsByName.ContainsKey($iconName)) {
                $iconsByName[$iconName] = [ordered]@{
                    name = $iconName
                    category = ""
                    tags = @()
                    styles = [ordered]@{}
                }
            }

            $rawSvgContent = Get-Content -LiteralPath $svgFile.FullName -Raw

            # Get category
            $categoryMatch = Get-MetadataMatch -Content $rawSvgContent -Pattern '^category:\s(\S*)$'
            if ($categoryMatch.Success) {
                $iconsByName[$iconName].category = $categoryMatch.Groups[1].Value.ToLowerInvariant()
            }

            # Get tags
            $tagsMatch = Get-MetadataMatch -Content $rawSvgContent -Pattern '^tags:\s\[(.*)\]$'
            if ($tagsMatch.Success) {
                $tagsString = $tagsMatch.Groups[1].Value
                $iconsByName[$iconName].tags = $tagsString.Split(',') | ForEach-Object { $_.Trim().Trim('"').ToLowerInvariant() } | Where-Object { $_ -ne '' }
            }

            # Add style data
            $styleData = [ordered]@{
                version = ''
                unicode = ''
                svg = ''
            }

            # Get version
            $versionMatch = Get-MetadataMatch -Content $rawSvgContent -Pattern '^version:\s"(\S*)"$'
            if ($versionMatch.Success) {
                $styleData.version = $versionMatch.Groups[1].Value
            }

            # Get unicode
            $unicodeMatch = Get-MetadataMatch -Content $rawSvgContent -Pattern '^unicode:\s"(\S*)"$'
            if ($unicodeMatch.Success) {
                $styleData.unicode = $unicodeMatch.Groups[1].Value
            }

            # Get SVG content
            $styleData.svg = Remove-Frontmatter -Content $rawSvgContent

            $iconsByName[$iconName].styles[$styleName] = $styleData

            if (($iconsByName.Count % $LogBatchSize) -eq 0) {
                Write-Log "    Processed $($iconsByName.Count) icons..." -Color ([ConsoleColor]::White)
            }
        }
    }

    if (($iconsByName.Count % $LogBatchSize) -ne 0) {
        Write-Log "    Processed $($iconsByName.Count) icons..." -Color ([ConsoleColor]::White)
    }

    # Sort icons by name
    Write-Log "Sorting icons..."
    $icons = $iconsByName.GetEnumerator() | Sort-Object -Property Name | ForEach-Object { $_.Value }

    # Write the output JSON file
    Write-Log "Writing output JSON file..."
    $outputPayload = [ordered]@{
        license = "This data is derived from the Tabler Icons project (https://github.com/tabler/tabler-icons). The original icons are licensed under the MIT License and copyrighted by Paweł Kuna. For more details, see https://github.com/tabler/tabler-icons/blob/main/LICENSE."
        version = $version
        icons = $icons
    }

    $outputJson = $outputPayload | ConvertTo-Json -Depth 10 -Compress
    Set-Content -LiteralPath $OutputFile -Value $outputJson -Encoding UTF8

    Write-Log "Done" -Color ([ConsoleColor]::Green)
}
finally {
    # Clean up
    if (Test-Path $WorkDir) {
        Remove-Item -LiteralPath $WorkDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
