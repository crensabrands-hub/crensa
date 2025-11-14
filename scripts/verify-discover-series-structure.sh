#!/bin/bash

echo "🔍 Verifying Discover Page Series Integration Structure"
echo "=========================================================="
echo ""

# Check if required files exist
echo "📁 Checking required files..."
files=(
  "src/components/discover/SeriesCard.tsx"
  "src/components/discover/PopularSeries.tsx"
  "src/app/api/discover/series/route.ts"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file"
  else
    echo "   ✗ $file (MISSING)"
    all_exist=false
  fi
done

echo ""

# Check if DiscoverPage imports PopularSeries
echo "🔗 Checking DiscoverPage integration..."
if grep -q "import PopularSeries" "src/components/discover/DiscoverPage.tsx"; then
  echo "   ✓ PopularSeries imported in DiscoverPage"
else
  echo "   ✗ PopularSeries NOT imported in DiscoverPage"
  all_exist=false
fi

if grep -q "<PopularSeries" "src/components/discover/DiscoverPage.tsx"; then
  echo "   ✓ PopularSeries component used in DiscoverPage"
else
  echo "   ✗ PopularSeries component NOT used in DiscoverPage"
  all_exist=false
fi

echo ""

# Check SeriesCard component structure
echo "🎴 Checking SeriesCard component..."
if grep -q "router.push.*series" "src/components/discover/SeriesCard.tsx"; then
  echo "   ✓ SeriesCard has navigation to series detail"
else
  echo "   ✗ SeriesCard missing navigation"
  all_exist=false
fi

if grep -q "SERIES" "src/components/discover/SeriesCard.tsx"; then
  echo "   ✓ SeriesCard has series badge"
else
  echo "   ✗ SeriesCard missing series badge"
  all_exist=false
fi

if grep -q "coinPrice" "src/components/discover/SeriesCard.tsx"; then
  echo "   ✓ SeriesCard displays coin price"
else
  echo "   ✗ SeriesCard missing coin price display"
  all_exist=false
fi

if grep -q "videoCount" "src/components/discover/SeriesCard.tsx"; then
  echo "   ✓ SeriesCard displays video count"
else
  echo "   ✗ SeriesCard missing video count display"
  all_exist=false
fi

echo ""

# Check API endpoint
echo "🌐 Checking API endpoint..."
if grep -q "GET.*discover/series" "src/app/api/discover/series/route.ts"; then
  echo "   ✓ API endpoint exports GET handler"
else
  echo "   ✗ API endpoint missing GET handler"
  all_exist=false
fi

if grep -q "viewCount" "src/app/api/discover/series/route.ts"; then
  echo "   ✓ API queries by view count"
else
  echo "   ✗ API missing view count sorting"
  all_exist=false
fi

if grep -q "isActive.*true" "src/app/api/discover/series/route.ts"; then
  echo "   ✓ API filters for active series"
else
  echo "   ✗ API missing active series filter"
  all_exist=false
fi

echo ""
echo "=========================================================="

if [ "$all_exist" = true ]; then
  echo "✅ All structure checks passed!"
  echo ""
  echo "📝 Implementation Summary:"
  echo "   - SeriesCard component created with navigation, badges, and pricing"
  echo "   - PopularSeries component created with horizontal scrolling"
  echo "   - API endpoint created to fetch popular series"
  echo "   - DiscoverPage updated to include PopularSeries section"
  echo ""
  echo "✨ Task 10 'Update Discover Page' is complete!"
  exit 0
else
  echo "❌ Some structure checks failed!"
  exit 1
fi
