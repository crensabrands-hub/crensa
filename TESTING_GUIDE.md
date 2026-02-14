# Guest Free Watch - Testing Guide

## 🧪 Manual Testing Procedures

### Prerequisites

1. **Development Environment Running**
   ```bash
   npm run dev
   ```

2. **Browser DevTools Open**
   - Press F12
   - Navigate to: Application → Local Storage → localhost

3. **Test Accounts**
   - Have a test account ready for login testing
   - Or be ready to create a new account

---

## Test Suite 1: Basic Guest Flow

### Test 1.1: First Free Video

**Steps:**
1. Open site in incognito/private window
2. Navigate to landing page (/)
3. Scroll to "Trending Videos" section
4. Find a video with 🪙 0 coins (FREE)
5. Click the video

**Expected Result:**
- ✅ Video page loads immediately
- ✅ Video plays without login prompt
- ✅ localStorage shows: `crensa_guest_free_watch_count = "1"`

**Actual Result:** _______________

---

### Test 1.2: Second Free Video

**Steps:**
1. Continue from Test 1.1 (don't close browser)
2. Go back to landing page
3. Click a different free video

**Expected Result:**
- ✅ Video page loads immediately
- ✅ Video plays without login prompt
- ✅ localStorage shows: `crensa_guest_free_watch_count = "2"`

**Actual Result:** _______________

---

### Test 1.3: Third Video (Limit Reached)

**Steps:**
1. Continue from Test 1.2
2. Go back to landing page
3. Click another free video

**Expected Result:**
- ❌ Video does NOT play
- ✅ Login modal appears with:
  - Title: "Free Video Limit Reached"
  - Subtitle: "You've watched your 2 free videos"
  - Benefits list (4 items)
  - "Sign In" button
  - "Sign Up" button
  - Close button (X)
- ✅ localStorage still shows: `crensa_guest_free_watch_count = "2"`

**Actual Result:** _______________

---

### Test 1.4: Modal Interactions

**Steps:**
1. Continue from Test 1.3 (modal should be open)
2. Test close button (X)
3. Click video again to reopen modal
4. Test "Sign In" button
5. Go back, click video again
6. Test "Sign Up" button

**Expected Result:**
- ✅ Close button redirects to homepage
- ✅ "Sign In" button goes to /sign-in with redirect_url
- ✅ "Sign Up" button goes to /sign-up with redirect_url
- ✅ Modal backdrop click closes modal

**Actual Result:** _______________

---

## Test Suite 2: Authentication Flow

### Test 2.1: Login Resets Counter

**Steps:**
1. Continue from Test 1.4 (guest with count = 2)
2. Click "Sign In" from modal
3. Complete login process
4. Check localStorage after login

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to video page
- ✅ Video plays immediately
- ✅ localStorage: `crensa_guest_free_watch_count` is REMOVED
- ✅ No more restrictions on free videos

**Actual Result:** _______________

---

### Test 2.2: Signup Resets Counter

**Steps:**
1. Open new incognito window
2. Watch 2 free videos (count = 2)
3. Click "Sign Up" from modal
4. Complete signup process
5. Check localStorage after signup

**Expected Result:**
- ✅ Signup successful
- ✅ Redirected to video page
- ✅ Video plays immediately
- ✅ localStorage: `crensa_guest_free_watch_count` is REMOVED

**Actual Result:** _______________

---

### Test 2.3: Authenticated User Has No Limits

**Steps:**
1. Login to your account
2. Navigate to landing page
3. Click 5+ different free videos

**Expected Result:**
- ✅ All videos play immediately
- ✅ No login modal appears
- ✅ No counter in localStorage
- ✅ No restrictions whatsoever

**Actual Result:** _______________

---

## Test Suite 3: Persistence & Edge Cases

### Test 3.1: Page Refresh Persistence

**Steps:**
1. Open incognito window
2. Watch 1 free video (count = 1)
3. Press F5 to refresh page
4. Check localStorage
5. Try to watch another video

**Expected Result:**
- ✅ localStorage still shows: `crensa_guest_free_watch_count = "1"`
- ✅ Can watch 1 more video
- ✅ 3rd video shows modal

**Actual Result:** _______________

---

### Test 3.2: Browser Restart Persistence

**Steps:**
1. Open normal browser window
2. Watch 2 free videos (count = 2)
3. Close browser completely
4. Reopen browser
5. Navigate to landing page
6. Check localStorage
7. Try to watch a video

**Expected Result:**
- ✅ localStorage still shows: `crensa_guest_free_watch_count = "2"`
- ✅ Modal appears immediately on video click

**Actual Result:** _______________

---

### Test 3.3: Cross-Tab Synchronization

**Steps:**
1. Open Tab 1 in incognito
2. Watch 1 free video (count = 1)
3. Open Tab 2 (same incognito session)
4. Check localStorage in Tab 2
5. Watch 1 video in Tab 2
6. Check localStorage in Tab 1

**Expected Result:**
- ✅ Tab 2 starts with count = 1
- ✅ After watching in Tab 2, both tabs show count = 2
- ✅ Both tabs show modal on next video click

**Actual Result:** _______________

---

### Test 3.4: Incognito vs Normal Mode

**Steps:**
1. Normal window: Watch 2 videos (count = 2)
2. Open incognito window
3. Check localStorage in incognito
4. Try to watch a video in incognito

**Expected Result:**
- ✅ Incognito has count = 0 (fresh start)
- ✅ Can watch 2 videos in incognito
- ✅ Normal window still has count = 2

**Actual Result:** _______________

---

### Test 3.5: Paid Video Behavior

**Steps:**
1. Open incognito window (fresh guest)
2. Find a video with 🪙 > 0 (paid video)
3. Click the paid video

**Expected Result:**
- ✅ Redirects to login page immediately
- ✅ Does NOT increment guest counter
- ✅ localStorage remains at 0

**Actual Result:** _______________

---

## Test Suite 4: UI/UX Testing

### Test 4.1: Modal Appearance

**Steps:**
1. Trigger login modal (watch 2 videos, click 3rd)
2. Inspect modal visually

**Expected Result:**
- ✅ Modal has gradient header (pink/teal)
- ✅ User icon visible
- ✅ Title and subtitle clear
- ✅ 4 benefits with checkmarks
- ✅ 2 buttons (Sign In, Sign Up)
- ✅ Close button (X) in top-right
- ✅ Backdrop blur effect
- ✅ Smooth animation on open/close

**Actual Result:** _______________

---

### Test 4.2: Mobile Responsiveness

**Steps:**
1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone SE, iPad, Desktop
4. Trigger modal on each device

**Expected Result:**
- ✅ Modal fits screen on all devices
- ✅ Buttons are tappable (not too small)
- ✅ Text is readable
- ✅ No horizontal scroll
- ✅ Close button accessible

**Actual Result:** _______________

---

### Test 4.3: Accessibility

**Steps:**
1. Trigger modal
2. Press Tab key repeatedly
3. Press Enter on focused elements
4. Press Escape key

**Expected Result:**
- ✅ Tab cycles through: Close, Sign In, Sign Up
- ✅ Enter activates buttons
- ✅ Escape closes modal (optional)
- ✅ Focus visible on all elements
- ✅ Screen reader announces modal (test with NVDA/JAWS if available)

**Actual Result:** _______________

---

## Test Suite 5: Error Handling

### Test 5.1: localStorage Disabled

**Steps:**
1. Open browser settings
2. Disable cookies/localStorage
3. Try to watch videos

**Expected Result:**
- ✅ Feature degrades gracefully
- ✅ Either: allows unlimited watches OR shows login immediately
- ✅ No JavaScript errors in console

**Actual Result:** _______________

---

### Test 5.2: Network Errors

**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to watch a video

**Expected Result:**
- ✅ Counter still increments locally
- ✅ Video fails to load (expected)
- ✅ No crashes or errors related to guest logic

**Actual Result:** _______________

---

### Test 5.3: Rapid Clicks

**Steps:**
1. Open incognito window
2. Rapidly click same video 10 times

**Expected Result:**
- ✅ Counter increments only once
- ✅ No duplicate modals
- ✅ No race conditions

**Actual Result:** _______________

---

## Test Suite 6: Integration Testing

### Test 6.1: Landing Page Integration

**Steps:**
1. Navigate to landing page (/)
2. Scroll to "Trending Videos" section
3. Verify all video cards are clickable
4. Test guest flow on landing page

**Expected Result:**
- ✅ All free videos have guest gate
- ✅ Paid videos redirect to login
- ✅ Counter works correctly
- ✅ Modal appears after 2 videos

**Actual Result:** _______________

---

### Test 6.2: Homepage Integration (Optional)

**Steps:**
1. Navigate to /app (member homepage)
2. Check if guest gate is applied

**Expected Result:**
- ✅ If applied: same behavior as landing page
- ✅ If not applied: videos work normally (expected)

**Actual Result:** _______________

---

## Test Suite 7: Performance Testing

### Test 7.1: Page Load Performance

**Steps:**
1. Open DevTools → Performance tab
2. Record page load
3. Check for any slowdowns

**Expected Result:**
- ✅ No significant performance impact
- ✅ localStorage reads are fast (<1ms)
- ✅ No layout shifts

**Actual Result:** _______________

---

### Test 7.2: Memory Leaks

**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Watch 10 videos
4. Take another heap snapshot
5. Compare

**Expected Result:**
- ✅ No significant memory increase
- ✅ Event listeners cleaned up
- ✅ No detached DOM nodes

**Actual Result:** _______________

---

## Browser Compatibility Checklist

Test on the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] PWA on Android
- [ ] PWA on iOS

---

## Regression Testing Checklist

Ensure existing features still work:

- [ ] Authenticated users can watch videos
- [ ] Video purchase flow works
- [ ] Coin system works
- [ ] Creator dashboard works
- [ ] Member dashboard works
- [ ] Search works
- [ ] Discover page works
- [ ] Video player works

---

## Test Results Summary

| Test Suite | Pass | Fail | Notes |
|------------|------|------|-------|
| Basic Guest Flow | ☐ | ☐ | |
| Authentication Flow | ☐ | ☐ | |
| Persistence & Edge Cases | ☐ | ☐ | |
| UI/UX Testing | ☐ | ☐ | |
| Error Handling | ☐ | ☐ | |
| Integration Testing | ☐ | ☐ | |
| Performance Testing | ☐ | ☐ | |
| Browser Compatibility | ☐ | ☐ | |
| Regression Testing | ☐ | ☐ | |

---

## Bug Report Template

If you find a bug, use this template:

```
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Environment:**
- Browser: 
- OS: 
- Device: 
- User Type: Guest / Authenticated

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Copy from DevTools console]

**localStorage State:**
crensa_guest_free_watch_count = 
```

---

## Testing Tips

1. **Use Incognito Mode** for guest testing (fresh localStorage)
2. **Check DevTools Console** for errors after each action
3. **Inspect localStorage** after each video watch
4. **Test on Real Devices** not just DevTools emulation
5. **Clear Cache** between test runs if needed
6. **Document Everything** - screenshots help!

---

## Quick Debug Commands

Open browser console and run:

```javascript
// Check current count
localStorage.getItem('crensa_guest_free_watch_count')

// Manually set count
localStorage.setItem('crensa_guest_free_watch_count', '1')

// Reset count
localStorage.removeItem('crensa_guest_free_watch_count')

// Check all localStorage
console.table(localStorage)
```

---

## Sign-Off

**Tester Name:** _______________  
**Date:** _______________  
**Overall Result:** PASS / FAIL  
**Ready for Production:** YES / NO  

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
