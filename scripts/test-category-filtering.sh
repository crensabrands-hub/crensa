#!/bin/bash

echo "Testing category filtering..."
echo ""

# Test categories API
echo "1. Testing /api/categories endpoint:"
curl -s http://localhost:3000/api/categories | jq '.categories[] | {name: .name, slug: .slug}' | head -20
echo ""

# Test discover videos with different categories
echo "2. Testing /api/discover/videos with education category:"
echo "   (This requires authentication, so run this in the browser console or with auth token)"
echo ""

echo "To test manually:"
echo "1. Start the dev server: npm run dev"
echo "2. Sign in to the app"
echo "3. Go to /discover page"
echo "4. Click on different categories (Education, Entertainment, etc.)"
echo "5. Verify that videos are filtered correctly"
echo ""
echo "Check browser console for logs showing:"
echo "  - 'Filtering by category: education -> Education'"
echo "  - Video count for each category"
