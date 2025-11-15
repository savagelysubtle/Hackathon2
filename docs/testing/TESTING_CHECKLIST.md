# ✅ Testing Checklist

Copy this checklist and check off each item as you test!

---

## 🚀 Pre-Flight Setup

- [ ] WalletConnect Project ID obtained from https://cloud.walletconnect.com/
- [ ] `dashboard/.env.local` created with `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- [ ] `bun install` completed in dashboard directory
- [ ] Dev server started (`bun run dev`)
- [ ] Browser opened to http://localhost:3000
- [ ] Console checked for errors (F12 → Console tab)

---

## 🔐 Wallet Connection Tests

### Basic Connection
- [ ] "Connect Wallet" button visible in header
- [ ] Click button → Modal opens with wallet options
- [ ] MetaMask option present
- [ ] WalletConnect option present
- [ ] Connect with MetaMask
- [ ] Wallet prompts for approval
- [ ] Approve connection
- [ ] Address displays in header (0x1234...5678)
- [ ] Avatar/icon shows next to address

### Wallet Switching
- [ ] Disconnect wallet (click address → Disconnect)
- [ ] Address disappears from header
- [ ] "Connect Wallet" button reappears
- [ ] Connect with different wallet
- [ ] New address shows correctly

### Network Handling
- [ ] Connect on Mainnet → Works
- [ ] Switch to Sepolia → Still connected
- [ ] Switch back to Mainnet → Works

---

## 💰 Portfolio Page Tests

### Not Connected State
- [ ] Navigate to Portfolio page
- [ ] See "Connect Your Wallet" prompt
- [ ] Connect button present on prompt
- [ ] Click connect → Works
- [ ] After connection → Portfolio loads

### Connected State
- [ ] Navigate to Portfolio page (while connected)
- [ ] Loading spinner shows briefly
- [ ] Real ETH balance displays
- [ ] Token balances display (if you have them)
- [ ] Total portfolio value calculated correctly
- [ ] Pie chart renders
- [ ] Allocation percentages correct
- [ ] Asset breakdown table shows
- [ ] Price data displays ($X,XXX.XX format)

### Data Accuracy
- [ ] ETH balance matches wallet
- [ ] Token balances match wallet (if you have USDC/USDT/DAI)
- [ ] Total value seems reasonable
- [ ] Charts/graphs display correctly
- [ ] No console errors

---

## ⚡ Warden Spaces Tests

### Page Access
- [ ] "Spaces" link visible in sidebar
- [ ] Click Spaces → Page loads
- [ ] "What is a Warden Space?" section displays
- [ ] Feature cards show (Auto-Execution, Secure, Multi-Sig, History)
- [ ] Comparison section shows (Wallet Connect vs Warden Space)

### Space Creation (Not Connected)
- [ ] See "Connect wallet to create a Space" prompt
- [ ] Connect button present
- [ ] Click → Wallet connects
- [ ] Page updates to show creation button

### Space Creation (Connected)
- [ ] "Create Agent Space" button visible
- [ ] Click button → Loading state
- [ ] Space created successfully
- [ ] Success card displays with green border
- [ ] Space ID shows
- [ ] Deposit address shows
- [ ] Copy button next to address
- [ ] Click copy → "Address copied!" toast
- [ ] Next steps instructions display

---

## 🔄 Multi-User Isolation Tests

### Test with Wallet A
- [ ] Connect Wallet A (address: 0xAAA...)
- [ ] Note balance shown
- [ ] Create Space (if desired)
- [ ] Note Space ID/address

### Test with Wallet B
- [ ] Disconnect Wallet A
- [ ] Connect Wallet B (address: 0xBBB...)
- [ ] Balance different from Wallet A ✅
- [ ] Create Space
- [ ] Space ID different from Wallet A ✅
- [ ] No data leakage between wallets ✅

---

## 🎨 UI/UX Tests

### Visual Consistency
- [ ] Dark theme consistent throughout
- [ ] Blue accent color (#3B82F6) matches
- [ ] Typography consistent (Inter font)
- [ ] Border radius consistent (8px)
- [ ] Spacing feels uniform
- [ ] Icons render correctly

### Responsive Design
- [ ] Desktop (1920px) → Looks great
- [ ] Tablet (768px) → Adapts well
- [ ] Mobile (< 640px) → Usable (test sidebar)

### Animations
- [ ] Wallet modal fades in smoothly
- [ ] Buttons have hover effects
- [ ] Loading spinners rotate
- [ ] Toasts slide in from top-right
- [ ] Page transitions smooth

---

## 🧪 Edge Cases

### Error Handling
- [ ] Invalid Project ID → Clear error message
- [ ] Wallet rejection → Handled gracefully
- [ ] Network error → Toast notification
- [ ] Page reload while connected → Reconnects automatically
- [ ] Slow balance fetch → Shows loading state

### Performance
- [ ] Initial page load < 3s
- [ ] Wallet connection < 3s
- [ ] Balance fetch < 2s
- [ ] Page navigation < 200ms
- [ ] No memory leaks (check DevTools)

---

## 📱 Cross-Browser Tests

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Brave Browser

---

## 🔗 Integration Tests

### API Endpoints
- [ ] `/api/prices` responds (POST)
- [ ] `/api/spaces/create` works (POST)
- [ ] `/api/spaces/balance` works (GET)
- [ ] `/api/spaces/execute` works (POST)
- [ ] `/api/portfolio/rebalance` works (POST)

### Hooks
- [ ] `usePrices()` fetches data
- [ ] `useWalletBalances()` reads balances
- [ ] `useAccount()` tracks connection
- [ ] Re-fetches on wallet change

---

## 🚀 Production Readiness

### Documentation
- [ ] `WALLET_CONNECTION_COMPLETE.md` read
- [ ] `IMPLEMENTATION_SUMMARY.md` reviewed
- [ ] `QUICKSTART_WALLET.md` followed
- [ ] `VISUAL_FEATURE_OVERVIEW.md` understood

### Code Quality
- [ ] No linting errors
- [ ] No console warnings
- [ ] No console errors
- [ ] Type safety maintained
- [ ] Comments where needed

### Security
- [ ] Private keys NOT in code
- [ ] Environment variables used correctly
- [ ] No hardcoded secrets
- [ ] User data isolated

---

## 🎉 Final Validation

- [ ] All core features working
- [ ] UI looks professional
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Ready for demo
- [ ] Ready for judging

---

## 📊 Test Results Summary

**Total Tests**: 100+

**Passed**: _____ / _____

**Failed**: _____ (List below)

**Blockers**: _____ (List below)

**Notes**:
```
[Add any observations, issues, or improvements needed]





```

---

## 🎯 Demo Readiness Score

Rate each category 1-5:

- **Functionality**: _____ / 5
- **UI/UX**: _____ / 5
- **Performance**: _____ / 5
- **Stability**: _____ / 5
- **Innovation**: _____ / 5

**Total Score**: _____ / 25

**Ready for Demo?**: YES / NO

**Ready for Judges?**: YES / NO

---

## 🚀 Next Actions

Priority fixes needed:
1. _____________________
2. _____________________
3. _____________________

Nice-to-have improvements:
1. _____________________
2. _____________________
3. _____________________

---

**Tested By**: _____________________

**Date**: _____________________

**Build Version**: _____________________

---

## 🎉 Congratulations!

If you've checked off most items, your implementation is **SOLID** and ready to showcase!

**Go crush that hackathon!** 🚀🌟

