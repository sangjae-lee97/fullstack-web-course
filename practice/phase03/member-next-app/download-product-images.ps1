# Run from C:\dev\fullstack-web-course\practice\phase03\member-next-app
$ErrorActionPreference = 'Stop'
$targetDir = Join-Path (Get-Location).Path 'public\boardgames'
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
$items = @(
    @{ id=1; title='clocktower'; url='https://store.asmodee.com/cdn/shop/products/TPM01001.jpg?v=1691447415' },
    @{ id=2; title='avalon'; url='https://jaimantoys.com/cdn/shop/files/avalon-Photoroom-Photoroom.jpg?v=1773621460&width=1946' },
    @{ id=3; title='splendor'; url='https://img1a.coupangcdn.com/image/retail/images/58816723552707-c9cd1060-5833-413e-bd56-17ab1ae116ea.jpg' },
    @{ id=4; title='terraforming-mars'; url='https://item.elandrs.com/r/image/oa/2024-04-17/70473940-9232-4c61-934b-748ecf2252d5.jpg?h=&q=100&w=750' },
    @{ id=5; title='ticket-to-ride'; url='https://image.yes24.com/goods/122596944/XL' },
    @{ id=6; title='wingspan'; url='https://grtoys.com/cdn/shop/files/81KNLO6FWHL_AC_SL1500_64306e0592a88_r1.jpg?v=1759963928&width=1500' },
    @{ id=7; title='agricola'; url='https://img.boardlife.co.kr/wys2/swf_upload/2024/11/16/1731757762218628.jpg' },
    @{ id=8; title='barrage'; url='https://www.gameology.com.au/cdn/shop/files/Barrage_01.jpg?v=1754617159' },
    @{ id=9; title='brass-birmingham'; url='https://ecimg.cafe24img.com/pg426b93222053021/boardm/web/product/medium/20260310/cdc1c82e44d7f4b7b1d2139dda2a4d0c.jpg' },
    @{ id=10; title='age-of-innovation'; url='https://cdnfile.divedice.com/_data/product/202312/15/43c20ce414cc96e4ad83c3de17adcf30.jpg' }
)

$failed = @()
foreach ($item in $items) {
    $dest = Join-Path $targetDir ("{0}.jpg" -f $item.id)
    try {
        Invoke-WebRequest -Uri $item.url -OutFile $dest -UseBasicParsing -TimeoutSec 35 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
        if ((Get-Item -LiteralPath $dest).Length -lt 4000) { throw 'Downloaded content is too small to be an image' }
        Write-Host ("OK: {0}.jpg ({1})" -f $item.id, $item.title)
    } catch {
        Write-Host ("FAILED: {0} ({1}): {2}" -f $item.id, $item.title, $_.Exception.Message)
        $failed += $item.id
        if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force }
    }
}
$count = @(Get-ChildItem -Path $targetDir -Filter '*.jpg' -File).Count
Write-Host ("Images saved: {0}/10" -f $count)
if ($failed.Count -gt 0) { Write-Host ("Failed IDs: {0}" -f ($failed -join ', ')) }
