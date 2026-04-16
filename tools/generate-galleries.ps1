param(
    [string]$RootPath = ".",
    [string]$PixPath = "pix",
    [string]$OutputPath = "assets/data/galleries.fr.json",
    [string]$ConfigPath = "tools/gallery-config.fr.json",
    [int]$MaxImagesPerGallery = 30
)

$root = (Resolve-Path $RootPath).Path
$pixAbsolute = Join-Path $root $PixPath
$outputAbsolute = Join-Path $root $OutputPath
$configAbsolute = Join-Path $root $ConfigPath

if (-not (Test-Path $pixAbsolute)) {
    throw "Le dossier pix est introuvable: $pixAbsolute"
}

if (-not (Test-Path $configAbsolute)) {
    throw "Le fichier de configuration est introuvable: $configAbsolute"
}

$imageExtensions = @("*.jpg", "*.jpeg", "*.png", "*.webp", "*.gif")
$config = Get-Content -Path $configAbsolute -Raw -Encoding UTF8 | ConvertFrom-Json

if (-not $config.filters -or -not $config.folders) {
    throw "La configuration doit contenir les sections filters et folders."
}

function Get-RelativeWebPath {
    param([string]$AbsolutePath, [string]$BasePath)

    $relative = $AbsolutePath.Replace($BasePath, "").TrimStart('\\')
    return ($relative -replace '\\', '/')
}

function Get-Slug {
    param([string]$Name)

    $slug = $Name.ToLowerInvariant()
    $slug = $slug -replace '[^a-z0-9]+', '-'
    $slug = $slug.Trim('-')

    if ([string]::IsNullOrWhiteSpace($slug)) {
        return "item"
    }

    return $slug
}

function Get-FilterClass {
    param([string]$FilterKey)

    return "cat-$(Get-Slug -Name $FilterKey)"
}

$folders = Get-ChildItem -Path $pixAbsolute -Directory | Sort-Object Name

$filters = @(
    [ordered]@{
        key = "all"
        label = "Tous"
        selector = "*"
    }
)

$configuredFilters = @{}

foreach ($filter in $config.filters) {
    if ([string]::IsNullOrWhiteSpace($filter.key) -or [string]::IsNullOrWhiteSpace($filter.label)) {
        throw "Chaque filtre de configuration doit definir key et label."
    }

    $filterClass = Get-FilterClass -FilterKey $filter.key

    $configuredFilters[$filter.key] = [ordered]@{
        key = $filter.key
        label = $filter.label
        selector = ".${filterClass}"
    }

    $filters += $configuredFilters[$filter.key]
}

$items = @()
$skippedFolders = @()

foreach ($folder in $folders) {
    $folderImages = Get-ChildItem -Path $folder.FullName -File -Recurse -Include $imageExtensions -ErrorAction SilentlyContinue |
        Sort-Object FullName

    if (-not $folderImages -or $folderImages.Count -eq 0) {
        continue
    }

    $folderName = $folder.Name
    $folderConfig = $config.folders.PSObject.Properties[$folderName]

    if (-not $folderConfig) {
        $skippedFolders += $folderName
        continue
    }

    $folderConfigValue = $folderConfig.Value

    if (-not $folderConfigValue.filters -or $folderConfigValue.filters.Count -eq 0) {
        throw "Le dossier $folderName doit definir au moins un filtre dans la configuration."
    }

    $selectedImages = $folderImages | Select-Object -First $MaxImagesPerGallery
    $imagePaths = @($selectedImages | ForEach-Object { Get-RelativeWebPath -AbsolutePath $_.FullName -BasePath $root })
    $thumbPath = if (-not [string]::IsNullOrWhiteSpace($folderConfigValue.thumb)) { $folderConfigValue.thumb } else { $imagePaths[0] }
    $folderClasses = @()

    foreach ($filterKey in $folderConfigValue.filters) {
        if (-not $configuredFilters.ContainsKey($filterKey)) {
            throw "Le dossier $folderName reference un filtre inconnu: $filterKey"
        }

        $folderClasses += (Get-FilterClass -FilterKey $filterKey)
    }

    $title = if (-not [string]::IsNullOrWhiteSpace($folderConfigValue.title)) { $folderConfigValue.title } else { $folderName }
    $subtitle = if (-not [string]::IsNullOrWhiteSpace($folderConfigValue.subtitle)) { $folderConfigValue.subtitle } else { "Dossier $folderName" }
    $description = if (-not [string]::IsNullOrWhiteSpace($folderConfigValue.description)) { $folderConfigValue.description } else { "Galerie generee automatiquement depuis pix/$folderName." }

    $items += [ordered]@{
        id = Get-Slug -Name $folderName
        sourceFolder = $folderName
        title = $title
        subtitle = $subtitle
        classes = $folderClasses
        thumb = $thumbPath
        images = $imagePaths
        description = $description
        totalImagesInFolder = $folderImages.Count
        visibleImages = $selectedImages.Count
    }
}

$data = [ordered]@{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    source = $PixPath
    config = $ConfigPath
    maxImagesPerGallery = $MaxImagesPerGallery
    filters = $filters
    items = $items
}

$outputDir = Split-Path -Path $outputAbsolute -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
}

$data | ConvertTo-Json -Depth 8 | Set-Content -Path $outputAbsolute -Encoding UTF8

Write-Host "JSON genere: $outputAbsolute ($($items.Count) galeries)"

if ($skippedFolders.Count -gt 0) {
    Write-Warning ("Dossiers ignores car absents de la configuration: " + ($skippedFolders -join ', '))
}
