# ============================================================
#  check-google-verification.ps1
#  Ellenőrzi, hogy a tm3.hu apex-en megjelent-e a Google-site-
#  verification TXT rekord a Google és Cloudflare authoritative
#  DNS szerverein. Akkor futtatandó, miután a Rackhost DNS-zónában
#  felvetted a TXT rekordot.
#
#  Futtatás:  powershell -ExecutionPolicy Bypass -File .\tools\check-google-verification.ps1
# ============================================================

$ErrorActionPreference = 'Stop'

$Domain = 'tm3.hu'
$Token  = 'N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4'

$Resolvers = @(
    @{ Name = 'Google Public DNS';  Server = '8.8.8.8'   }
    @{ Name = 'Cloudflare';         Server = '1.1.1.1'   }
    @{ Name = 'Quad9';              Server = '9.9.9.9'   }
)

Write-Host ""
Write-Host "Google Search Console TXT verifikáció — $Domain" -ForegroundColor Cyan
Write-Host "Keresett token: google-site-verification=$Token" -ForegroundColor Gray
Write-Host ""

$FoundAny = $false

foreach ($r in $Resolvers) {
    Write-Host "[$($r.Name) $($r.Server)]" -NoNewline
    try {
        $out = nslookup -type=TXT $Domain $r.Server 2>&1 | Out-String
        if ($out -match [regex]::Escape("google-site-verification=$Token")) {
            Write-Host "  ✅  MEGTALÁLVA" -ForegroundColor Green
            $FoundAny = $true
        } else {
            Write-Host "  ❌  még NINCS" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ⚠️  hiba: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
if ($FoundAny) {
    Write-Host "A TXT rekord legalább egy resolveren látható. " -ForegroundColor Green -NoNewline
    Write-Host "Várj 5–30 percet, majd a Google Search Console-ban kattints a 'Verify' gombra." -ForegroundColor Gray
} else {
    Write-Host "A TXT rekord egyelőre SEHOL sem jelent meg." -ForegroundColor Yellow
    Write-Host "  - Ha most vitted fel: várj 5–30 percet, és futtasd újra."
    Write-Host "  - Ha 1+ órája vetted fel: ellenőrizd, hogy a 'Név/Host' mező '@' (vagy üres), a 'Típus' TXT, és az érték szóköz nélkül stimmel."
}
Write-Host ""
