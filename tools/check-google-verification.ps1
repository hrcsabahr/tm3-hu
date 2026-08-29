# ============================================================
#  check-google-verification.ps1
#  Ellenorzi, hogy a tm3.hu apex-en megjelent-e a Google-site-
#  verification TXT rekord a Google es Cloudflare authoritative
#  DNS szerverein. Akkor futtatando, miutan a Rackhost DNS-zonaban
#  felvetted a TXT rekordot.
#
#  Futtatas (PowerShell 5.1 / 7):
#     powershell -ExecutionPolicy Bypass -File .\tools\check-google-verification.ps1
# ============================================================

$ErrorActionPreference = 'Stop'

$Domain = 'tm3.hu'
$Token  = 'N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4'

$Resolvers = @(
    @{ Name = 'Google Public DNS';  Server = '8.8.8.8'   }
    @{ Name = 'Cloudflare';         Server = '1.1.1.1'   }
    @{ Name = 'Quad9';              Server = '9.9.9.9'   }
)

Write-Host ''
Write-Host "Google Search Console TXT verifikacio - $Domain" -ForegroundColor Cyan
Write-Host "Keresett token: google-site-verification=$Token" -ForegroundColor Gray
Write-Host ''

$FoundAny = $false

foreach ($r in $Resolvers) {
    Write-Host "[$($r.Name) $($r.Server)]" -NoNewline
    try {
        $out = nslookup -type=TXT $Domain $r.Server 2>&1 | Out-String
        if ($out -match [regex]::Escape("google-site-verification=$Token")) {
            Write-Host "  MEGTALALVA" -ForegroundColor Green
            $FoundAny = $true
        } else {
            Write-Host "  meg NINCS" -ForegroundColor Red
        }
    } catch {
        Write-Host "  hiba: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ''
if ($FoundAny) {
    Write-Host "A TXT rekord legalabb egy resolveren lathato." -ForegroundColor Green
    Write-Host "Varj 5-30 percet, majd a Google Search Console-ban kattints a Verify gombra." -ForegroundColor Gray
} else {
    Write-Host "A TXT rekord egyelore SEHOL sem jelent meg." -ForegroundColor Yellow
    Write-Host "  - Ha most vetted fel: varj 5-30 percet, es futtasd ujra."
    Write-Host "  - Ha 1+ oraja vetted fel: ellenorizd, hogy a Nev/Host mezo '@' (vagy ures),"
    Write-Host "    a Tipus TXT, es az ertek szokoz nelkul stimmel."
}
Write-Host ''
