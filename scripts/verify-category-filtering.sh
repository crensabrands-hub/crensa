#!/bin/bash

echo "🔍 Testing Category Filtering Fix"
echo "=================================="
echo ""

# Test all category
echo "Testing 'all' category..."
RESULT=$(curl -s "http://localhost:3000/api/landing/unified-content?category=all&limit=2" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✓ All category returned $RESULT items"
echo ""

# Test education category
echo "Testing 'education' category..."
RESULT=$(curl -s "http://localhost:3000/api/landing/unified-content?category=education&limit=2" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$RESULT" -gt 0 ]; then
  echo "✅ Education category returned $RESULT items"
else
  echo "❌ Education category returned 0 items"
fi
echo ""

# Test entertainment category
echo "Testing 'entertainment' category..."
RESULT=$(curl -s "http://localhost:3000/api/landing/unified-content?category=entertainment&limit=2" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$RESULT" -gt 0 ]; then
  echo "✅ Entertainment category returned $RESULT items"
else
  echo "❌ Entertainment category returned 0 items"
fi
echo ""

# Test comedy category
echo "Testing 'comedy' category..."
RESULT=$(curl -s "http://localhost:3000/api/landing/unified-content?category=comedy&limit=2" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$RESULT" -gt 0 ]; then
  echo "✅ Comedy category returned $RESULT items"
else
  echo "❌ Comedy category returned 0 items"
fi
echo ""

# Test sports category
echo "Testing 'sports' category..."
RESULT=$(curl -s "http://localhost:3000/api/landing/unified-content?category=sports&limit=2" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$RESULT" -gt 0 ]; then
  echo "✅ Sports category returned $RESULT items"
else
  echo "❌ Sports category returned 0 items"
fi
echo ""

# Test dance category
echo "Testing 'dance' category..."
RESULT=$(curl -s "http://localhost:3000/api/landing/unified-content?category=dance&limit=2" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$RESULT" -gt 0 ]; then
  echo "✅ Dance category returned $RESULT items"
else
  echo "❌ Dance category returned 0 items"
fi
echo ""

echo "=================================="
echo "✅ Category filtering test complete!"
