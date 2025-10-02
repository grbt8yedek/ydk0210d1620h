#!/bin/bash

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 TÜM COMPONENT'LERİ TEST EDİYORUM..."
echo "=========================================="

# Test edilecek component'leri bul (zaten test edilmeyenler)
TESTED_COMPONENTS=(
    "SessionProviderWrapper"
    "TurkishFlag"
    "ProvidersDropdown"
    "AgencyBalanceBox"
    "TabSelector"
    "HeroSection"
    "ValidationPopup"
    "FlightSearchBox"
    "PassengerSelector"
    "TripTypeSelector"
    "CompactFlightCard"
    "FlightFilters"
    "ServiceButtons"
    "CampaignCard"
    "CampaignsSection"
    "AppBanner"
    "PassengerForm"
    "ContactForm"
    "PriceSummary"
)

# Tüm component dosyalarını bul
ALL_COMPONENTS=$(find src/components -name "*.tsx" -type f ! -name "*.backup" | sed 's/.*\///' | sed 's/\.tsx//')

# Test raporu
REPORT_FILE="COMPONENT_TEST_REPORT_$(date +%Y%m%d_%H%M%S).md"

echo "# 🧪 COMPONENT TEST RAPORU" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**Tarih:** $(date '+%Y-%m-%d %H:%M:%S')" >> $REPORT_FILE
echo "**Toplam Component:** $(echo "$ALL_COMPONENTS" | wc -l)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE

TOTAL=0
PASSED=0
FAILED=0

# Tüm test dosyalarını çalıştır
echo -e "${YELLOW}📝 Mevcut testleri çalıştırıyorum...${NC}"
echo "" >> $REPORT_FILE
echo "## ✅ TEST EDİLEN COMPONENT'LER" >> $REPORT_FILE
echo "" >> $REPORT_FILE

for component in "${TESTED_COMPONENTS[@]}"; do
    TEST_FILE=$(find __tests__/components -name "${component}.test.tsx" -o -name "${component}.test.ts" 2>/dev/null | head -1)
    
    if [ -n "$TEST_FILE" ]; then
        echo -e "Testing: ${YELLOW}$component${NC}"
        
        # Test çalıştır
        RESULT=$(npm test -- "$TEST_FILE" --passWithNoTests 2>&1)
        
        if echo "$RESULT" | grep -q "PASS"; then
            PASSED_TESTS=$(echo "$RESULT" | grep "Tests:" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
            echo -e "  ${GREEN}✅ BAŞARILI${NC} - $PASSED_TESTS test"
            echo "- ✅ **$component** - $PASSED_TESTS test başarılı" >> $REPORT_FILE
            ((PASSED++))
        else
            FAILED_TESTS=$(echo "$RESULT" | grep "Tests:" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "?")
            echo -e "  ${RED}❌ BAŞARISIZ${NC} - $FAILED_TESTS test"
            echo "- ❌ **$component** - $FAILED_TESTS test başarısız" >> $REPORT_FILE
            
            # Hataları yakala
            echo "  **Hatalar:**" >> $REPORT_FILE
            echo "$RESULT" | grep "●" | head -3 >> $REPORT_FILE
            echo "" >> $REPORT_FILE
            ((FAILED++))
        fi
        ((TOTAL++))
    fi
done

echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## 📊 ÖZET" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "| Metrik | Değer |" >> $REPORT_FILE
echo "|--------|-------|" >> $REPORT_FILE
echo "| **Toplam Test Edilen** | $TOTAL |" >> $REPORT_FILE
echo "| **Başarılı** | $PASSED ✅ |" >> $REPORT_FILE
echo "| **Başarısız** | $FAILED ❌ |" >> $REPORT_FILE
echo "| **Başarı Oranı** | $(echo "scale=1; $PASSED*100/$TOTAL" | bc)% |" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Test edilmeyen component'leri listele
echo "" >> $REPORT_FILE
echo "## ⏳ TEST EDİLMEYEN COMPONENT'LER" >> $REPORT_FILE
echo "" >> $REPORT_FILE

UNTESTED=0
while IFS= read -r component; do
    COMPONENT_NAME=$(basename "$component" .tsx)
    IS_TESTED=false
    
    for tested in "${TESTED_COMPONENTS[@]}"; do
        if [ "$tested" = "$COMPONENT_NAME" ]; then
            IS_TESTED=true
            break
        fi
    done
    
    if [ "$IS_TESTED" = false ]; then
        echo "- ⏳ **$COMPONENT_NAME** - Test yok" >> $REPORT_FILE
        ((UNTESTED++))
    fi
done <<< "$ALL_COMPONENTS"

echo "" >> $REPORT_FILE
echo "**Toplam Test Edilmeyen:** $UNTESTED component" >> $REPORT_FILE

# Sonuç
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Test Edilen: $PASSED${NC}"
echo -e "${RED}❌ Başarısız: $FAILED${NC}"
echo -e "${YELLOW}⏳ Test Yok: $UNTESTED${NC}"
echo ""
echo "📄 Detaylı rapor: $REPORT_FILE"
echo "=========================================="

# Raporu masaüstüne kopyala
cp $REPORT_FILE /Users/incesu/Desktop/$REPORT_FILE
echo "✅ Rapor masaüstüne kopyalandı!"

exit 0

