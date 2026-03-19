---
pdf_options:
  format: A4
  margin: 25mm
  headerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:right;margin-right:25mm;">tap2buy.lk — Business Plan v3.0</div>'
  footerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  displayHeaderFooter: true
stylesheet: null
body_class: null
css: |-
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #1a1a1a;
  }
  h1 {
    color: #1a5276;
    font-size: 24pt;
    border-bottom: 3px solid #1a5276;
    padding-bottom: 8px;
    margin-top: 35px;
    page-break-before: always;
  }
  h1:first-of-type { page-break-before: avoid; }
  h2 {
    color: #2980b9;
    font-size: 15pt;
    margin-top: 25px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 4px;
  }
  h3 { color: #2c3e50; font-size: 12pt; margin-top: 18px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 9.5pt; }
  th { background-color: #1a5276; color: white; padding: 7px 9px; text-align: left; font-weight: 600; }
  td { padding: 5px 9px; border: 1px solid #ddd; }
  tr:nth-child(even) { background-color: #f8f9fa; }
  code { background: #f4f4f4; padding: 1px 5px; border-radius: 3px; font-size: 9.5pt; }
  pre { background: #f4f4f4; padding: 12px; border-radius: 4px; border-left: 4px solid #2980b9; font-size: 9pt; }
  strong { color: #1a5276; }
  hr { border: none; border-top: 2px solid #1a5276; margin: 25px 0; }
  blockquote { border-left: 4px solid #2980b9; margin: 12px 0; padding: 8px 18px; background: #f0f7fd; }
---

<div style="text-align:center; padding-top:180px; page-break-after:always;">
<h1 style="font-size:36pt; border:none; color:#1a5276; page-break-before:avoid;">tap2buy.lk</h1>
<hr style="width:60%; margin:auto; border-top:3px solid #1a5276;">
<h2 style="color:#2980b9; border:none; font-size:18pt;">Startup Strategy & Business Plan</h2>
<p style="font-size:13pt; color:#555;">Social Media-to-Store Platform for Sri Lankan Micro-Sellers</p>
<br><br>
<p style="color:#777;">Prepared for: Shahid</p>
<p style="color:#777;">Date: March 2026 — Version 3.0</p>
<p style="color:#2980b9; font-weight:bold;">Bootstrap Edition — Built to be profitable from Day 1</p>
</div>

---

## WHAT'S NEW IN V3

This version addresses six critical gaps from v2:

1. **COD (Cash on Delivery) Strategy** — Added to MVP with fraud-safe architecture (Section 6.5)
2. **WhatsApp Commerce Integration** — Buyer-side WhatsApp ordering flow (Section 6.6)
3. **Facebook Seller Expansion** — Repositioned from "Instagram-only" to "Social Media-to-Store" (Section 2.4)
4. **Seller Churn Modeling** — Realistic net-growth projections with churn factored in (Section 5.4)
5. **Trust, Fraud & Seller Verification** — NIC verification, payout holds, dispute resolution (Section 11)
6. **Legal, Tax & Regulatory Compliance** — Business registration, CBSL regulations, VAT (Section 12)

Additionally, financial projections have been revised with conservative assumptions.

---

## 1. Executive Summary

tap2buy.lk is a mobile-first platform that lets Sri Lankan social media micro-sellers (home bakers, thrift stores, handmade jewelry makers) create a professional online store in 60 seconds and start accepting payments immediately. Sellers share their store link (tap2buy.lk/storename) in their Instagram bio, Facebook page, or WhatsApp status, and buyers can browse, pay (online or Cash on Delivery), and order without any DM back-and-forth.

The platform charges a flat 6% fee per online transaction (which includes PayHere's 3.3% payment processing) and 8% on COD orders. Sellers pay nothing upfront, nothing monthly on the free tier. Pro (LKR 1,990/month) and Business (LKR 3,990/month) tiers reduce fees and add premium features.

The total investment to launch is approximately LKR 49,000 (~US$150). Monthly operating costs are LKR 2,258 (~US$7). The platform is projected to be profitable from the first month of operation with just 15 active sellers.

**Key changes from v2:** COD support in MVP, WhatsApp buyer flow, Facebook seller acquisition, conservative financial projections with churn, regulatory compliance plan, and seller verification system.

---

## 2. Market Opportunity

### 2.1 The Sri Lankan Digital Landscape

- **10.4 million Facebook users** in Sri Lanka (2025, NapoleonCat) — the dominant social platform
- **1.95 million Instagram users** (early 2025), growing rapidly
- **~11 million WhatsApp users** (2024) — the primary messaging app
- 12.4 million internet users with 53.6% online penetration
- E-commerce market generated **US$3,347M in 2024**, growing at 20-25% YoY (CBSL Payment Bulletin Q3)
- Social commerce is mainstream — 60% of social media-based businesses operate in the informal sector (IPS Sri Lanka)
- **48% of online shoppers prefer Cash on Delivery** (2024 peer-reviewed study, Nature HASS Communications), down from the historical 95% but still the single largest payment preference
- Prior to digitization, 100% of social media MSMEs used bank transfers and 80% used COD (IPS Sri Lanka)

### 2.2 The Problem: DM Chaos

Thousands of Sri Lankan micro-sellers currently run their entire business through Instagram DMs, Facebook Messenger, and WhatsApp. Their workflow looks like this:

1. Customer sees product on Instagram/Facebook, sends a DM asking "How much?"
2. Seller replies with price and bank details (manually, every time)
3. Customer makes a bank transfer and screenshots the deposit slip
4. Customer sends screenshot via WhatsApp
5. Seller checks bank account (often manually, next day)
6. Seller confirms order, arranges delivery by calling courier
7. Seller sends tracking info via WhatsApp (if they remember)

This process takes 30-60 minutes per order. At 15+ orders/day, sellers spend more time managing DMs than making products. Orders fall through the cracks. Buyers abandon purchases because the process is too slow. There is no order history, no analytics, and no way to scale.

### 2.3 The Gap Nobody Has Filled

No platform in Sri Lanka currently combines: (a) instant storefront from social media bio link, (b) native PayHere payment integration, (c) COD order management, (d) mobile-first order management, and (e) pricing that works for a home baker making LKR 30,000/month. ShopOnCloud charges LKR 2,500/month before a seller makes a single sale. Shopify costs ~LKR 9,500+/month. dm2buy and Dukaan are India-only with UPI-based payments that don't work in Sri Lanka.

### 2.4 Beyond Instagram: The Facebook & WhatsApp Opportunity (NEW in v3)

**V2 was positioned as "Instagram-to-Store." This was too narrow.**

| Platform | SL Users | Seller Activity | tap2buy Opportunity |
|---|---|---|---|
| Facebook | 10.4M | Buy & Sell groups, FB Marketplace, business pages | Largest seller base; many don't use Instagram at all |
| Instagram | 1.95M | Bio-link sellers, story-based selling | Core use case, but smaller total market |
| WhatsApp | ~11M | Broadcast lists, catalog shares, order coordination | Repeat order channel; buyers prefer staying here |

**Repositioning:** tap2buy.lk is a **"Social Media-to-Store"** platform. The product is identical — but the messaging, onboarding, and marketing now target all three platforms. A seller's tap2buy.lk link works in an Instagram bio, a Facebook post, or a WhatsApp message.

**Why this matters for TAM:** Instagram has ~2M users in SL. Facebook has 10.4M. By targeting Facebook sellers (who dominate groups like "Buy & Sell Colombo," "Online Sellers SL," "Women Entrepreneurs SL"), tap2buy's addressable seller base expands 3-5x.

---

## 3. Competitor Analysis

| Platform | Type | SL Payments | Monthly Fee | Txn Fee | Social-Specific |
|---|---|---|---|---|---|
| **tap2buy.lk** | Social store builder | PayHere native + COD | LKR 0 (free tier) | 6% online / 8% COD | Yes — built for it |
| ShopOnCloud | Generic ecommerce | PayHere/bank | LKR 2,500 | 0% | No |
| Shopify | Global ecommerce | Via plugin | ~LKR 9,500+ | 2.9% + $0.30 | No |
| dm2buy | IG store (India) | Cashfree/UPI | INR 999 Pro | 0% | Yes (India only) |
| Dukaan | Mobile store | India only | INR 433+ | 0-3% | No |
| Daraz.lk | Marketplace | Built-in | LKR 0 | 5-25% + 3% + VAT | No |

**Key insight:** dm2buy (3.1/5, 91 reviews) and Dukaan (3.7/5, 77,760 reviews) both suffer from broken customer support, OTP failures, glitchy product uploads, and payment delays. The bar for a reliable, responsive platform is low. Stable tech and WhatsApp-based support would immediately differentiate tap2buy.

**V3 addition:** No competitor in Sri Lanka offers COD order management integrated with online payments. Daraz handles COD but takes 5-25% + fees. tap2buy at 8% COD is dramatically cheaper.

---

## 4. Revenue Model

### 4.1 The Transaction Fee Model (Updated)

| Payment Method | Total Fee | PayHere's Cut | tap2buy's Cut |
|---|---|---|---|
| Online (card/wallet/bank) | 6% | 3.3% | 2.7% |
| COD (Cash on Delivery) | 8% | 0% (no payment processing) | 8% |

**COD fee rationale:** COD orders don't use PayHere, so there's no 3.3% processing cost. The 8% fee covers tap2buy's higher operational risk (trust, fraud, collection effort) and incentivizes sellers to encourage online payments. At 8%, tap2buy is still dramatically cheaper than Daraz (30%+).

**Example (Online):** Buyer purchases cake for LKR 2,500. PayHere processes payment. LKR 150 (6%) deducted. Seller receives LKR 2,350. Of LKR 150, PayHere keeps LKR 82.50 (3.3%) and tap2buy keeps LKR 67.50 (2.7%).

**Example (COD):** Buyer orders LKR 2,500 cake with COD. Pays LKR 250 booking fee online (PayHere takes 3.3% = LKR 8.25). Pays LKR 2,250 cash on delivery. Seller marks "payment collected." Platform fee of LKR 200 (8% of LKR 2,500) is debited from seller's tap2buy wallet. Seller's net: LKR 2,300.

### 4.2 Pricing Tiers

| Feature | Free | Pro (LKR 1,990/mo) | Business (LKR 3,990/mo) |
|---|---|---|---|
| Online Txn Fee | 6% | 5% | 4% |
| COD Txn Fee | 8% | 7% | 6% |
| Products | Unlimited | Unlimited | Unlimited |
| Orders | Unlimited | Unlimited | Unlimited |
| COD Access | After 10 online orders | Immediate | Immediate |
| Store URL | tap2buy.lk/name | Custom domain | Custom domain |
| Branding | tap2buy badge | Remove branding | Remove branding |
| Analytics | Basic | Full dashboard | Full + export |
| Discount Codes | No | Yes | Yes |
| WhatsApp Notifications | No | Order updates to buyers | Full automation |
| FB/IG Pixel | No | Yes | Yes |
| Staff Accounts | 1 | 3 | 10 |
| Priority Support | Community | WhatsApp | Dedicated |
| Bulk Product Upload | No | No | Yes |

**Upgrade Incentive Math:**
A Pro seller doing LKR 100,000/month saves LKR 1,000/month (1% reduction on 100K). They pay LKR 1,990 for the subscription but also get custom domain, analytics, discount codes, and WhatsApp notifications. Net cost: just LKR 990 for premium features.

A Business seller doing LKR 250,000/month saves LKR 5,000/month (2% reduction on 250K). They pay LKR 3,990 — they're actually saving LKR 1,010/month. The subscription pays for itself.

### 4.3 Revenue Streams Summary

- **Stream 1 — Transaction fees (2.7% online / 8% COD):** Revenue from every sale. Starts from transaction #1.
- **Stream 2 — Pro/Business subscriptions:** Recurring monthly revenue from successful sellers.
- **Stream 3 — Featured placement (Phase 2, Month 9+):** Once 200+ stores exist, sellers can pay LKR 499-999/week for homepage and category page visibility.

---

## 5. Financial Projections (Revised — Conservative)

### 5.1 Startup Costs

| Item | Cost (LKR) | When |
|---|---|---|
| Domain (tap2buy.lk) | 3,700 | Now |
| Google Play Console ($25 one-time) | 8,000 | Month 3-4 |
| Apple Developer Account ($99/year) | 32,000 | Month 6+ (defer) |
| Business Registration (Sole Prop) | 5,000 | Now |
| Miscellaneous | 5,000 | Ongoing |
| **TOTAL** | **53,700 (~US$165)** | **Phased** |

Phase 1 launch cost (web-only MVP): **LKR 13,700 only.** Domain + business registration + misc.

### 5.2 Monthly Operating Costs

| Item | Monthly (LKR) | Notes |
|---|---|---|
| Hosting (DigitalOcean $6/mo droplet) | 1,950 | 1 vCPU, 1GB RAM |
| Domain renewal (monthly equivalent) | 308 | LKR 3,700/year |
| SMS / Notifications | 0 | FCM (free) + WhatsApp |
| PayHere merchant account | 0 | Lite plan, no monthly fee |
| Cloudflare CDN + SSL | 0 | Free tier |
| Email (Zoho/Gmail) | 0 | Free tier |
| **TOTAL MONTHLY COST** | **2,258 (~US$7)** | |

### 5.3 Revenue Projections — Conservative Model (18 Months)

**V3 Changes from V2:**
- Average orders reduced from 15/seller/month to **8/seller/month** (realistic for micro-sellers)
- Monthly seller growth reduced from 25% to **15% growth with 10% monthly churn** (net ~5% organic growth + acquisition bursts)
- Free-to-Pro conversion reduced from 12% to **7%**
- Pro-to-Business conversion reduced from 5% to **2%**
- **COD orders added:** Estimated 40% of orders are COD (based on 48% SL preference, discounted for online-first platform bias)
- Average order value: LKR 2,500

**Revenue per order breakdown:**
- Online order (60%): tap2buy earns LKR 67.50 (2.7% of LKR 2,500)
- COD order (40%): tap2buy earns LKR 200 (8% of LKR 2,500)
- **Blended revenue per order: LKR 120.50**

| Month | Gross Sellers | Active Sellers | Churn | Pro | Biz | Txn Rev | Sub Rev | Total Rev | Costs | Net |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | 15 | 15 | 0 | 0 | 0 | 14,460 | 0 | 14,460 | 2,258 | +12,202 |
| 6 | 28 | 25 | 3 | 1 | 0 | 24,100 | 1,990 | 26,090 | 2,258 | +23,832 |
| 8 | 50 | 42 | 8 | 3 | 0 | 40,488 | 5,970 | 46,458 | 2,500 | +43,958 |
| 10 | 80 | 65 | 15 | 4 | 1 | 62,660 | 11,950 | 74,610 | 2,800 | +71,810 |
| 12 | 120 | 95 | 25 | 6 | 1 | 91,580 | 15,930 | 107,510 | 3,500 | +104,010 |
| 18 | 250 | 190 | 60 | 13 | 3 | 183,160 | 37,840 | 221,000 | 5,000 | +216,000 |

**Key differences from v2:**
- Month 18 revenue: LKR 221,000 (v3) vs LKR 343,870 (v2) — **36% lower** but still highly profitable
- Month 18 active sellers: 190 (v3) vs 500 (v2) — **62% lower** accounting for churn
- **Still profitable from Month 5 (launch month)** — the core thesis holds even with conservative numbers

### 5.4 Churn Model (NEW in v3)

| Churn Type | Rate | Description |
|---|---|---|
| Early abandonment | 30% | Sellers who sign up but never complete their first order (within 30 days) |
| Monthly active churn | 10% | Sellers who go inactive (0 orders in 30 days) |
| Seasonal fluctuation | +20% / -15% | Spike during Avurudu (April), Christmas; dip in off-season |
| Win-back rate | 15% | Churned sellers who return within 90 days |

**"Active seller" definition:** A seller with at least 1 completed order in the last 30 days. This is the metric that matters — not total registered sellers.

**Churn mitigation strategies:**
1. **Day 1-7 onboarding sequence:** WhatsApp messages guiding sellers through first product upload, first share, first order
2. **"Dormant seller" alerts:** If no orders for 14 days, send tips and success stories
3. **Seasonal campaigns:** Pre-built templates for Avurudu, Vesak, Christmas promotions
4. **Re-activation offers:** "Come back and get Pro free for 2 weeks" for churned sellers

---

## 6. Technical Architecture (MVP)

### 6.1 Stack

| Layer | Technology | Why |
|---|---|---|
| Buyer Storefront | Next.js (React SSR) | Fast loading, SEO-friendly, path-based routing |
| Backend API | Node.js + Express | Existing expertise; rich PayHere SDK ecosystem |
| Database | PostgreSQL (on same droplet) | Free, multi-tenant with row-level isolation |
| Payments | PayHere Checkout API | Central Bank approved, cards + wallets + bank transfer |
| File Storage | Cloudflare R2 (or S3) | Product images; R2 has generous free tier |
| Notifications | FCM (push) + WhatsApp Business | Both free; no SMS costs |
| Hosting | DigitalOcean $6/mo droplet | 1 vCPU, 1GB RAM — sufficient for MVP |
| CDN + SSL | Cloudflare (free tier) | Global CDN, free SSL, DDoS protection |
| Courier Integration | Koombiyo Node SDK | API available on GitHub, COD collection support |

### 6.2 URL Structure

Path-based routing: `tap2buy.lk/storename`. Simpler than subdomains, easier to share verbally, consolidated SEO. Custom domains are a Pro tier feature in Phase 2.

### 6.3 MVP Feature Scope

**Phase 1 (Web Only — Weeks 1-14):**
- 60-second store creation (name, logo, first 3 products)
- Product listing with images, variants, pricing
- Shareable store URL (tap2buy.lk/storename)
- PayHere checkout with 6% fee auto-calculated
- **COD order flow with booking fee (NEW)**
- **Seller wallet system for COD fee collection (NEW)**
- Seller dashboard: orders, revenue, products (mobile browser optimized)
- Push notifications for new orders (FCM)
- Buyer WhatsApp chat button on store page
- **WhatsApp product link sharing (NEW)**
- **Seller NIC verification on signup (NEW)**
- **Buyer delivery confirmation via WhatsApp (NEW)**

**Phase 2 (Month 4-8):**
- Android app for sellers (Google Play)
- Pro tier: custom domain, analytics, discount codes, FB/IG pixel
- Business tier: bulk upload, multiple staff, API access
- Featured seller placement on homepage
- **Koombiyo courier API integration for automated shipping**
- **DirectPay as backup payment gateway**

**Phase 3 (Month 9+):**
- iOS app for sellers (App Store)
- Full courier integration (Domex, Pronto, Koombiyo) with automated tracking
- WhatsApp order notification automation
- Seller discovery marketplace / category pages

### 6.4 Payment Flow — Online Orders

1. Buyer clicks "Buy Now" on seller's store page
2. Redirected to PayHere hosted checkout (6% fee included in price)
3. PayHere processes card/wallet/bank payment
4. PayHere sends success webhook to tap2buy backend
5. Backend creates order, credits seller's tap2buy wallet (sale - 6%)
6. Sends push notification to seller
7. Seller fulfills order, marks as shipped
8. Seller can withdraw wallet balance to bank account (daily auto-payout or manual)

### 6.5 Payment Flow — COD Orders (NEW in v3)

This is the fraud-safe COD architecture that was missing from v2.

**The Core Problem:** With COD, the seller collects cash directly. The incentive to under-report or mark orders as "cancelled" to avoid fees is obvious. Pure trust doesn't scale.

**The Solution: Prepaid Booking Fee + Wallet Deduction**

```
COD Order Flow:
1. Buyer selects "Cash on Delivery" at checkout
2. Buyer pays booking fee online (LKR 200 or 10% of order, whichever is lower)
   → This proves the order is real and eliminates prank/fake orders
   → PayHere processes this small payment (3.3% fee on booking amount)
3. Seller receives order notification with "COD" badge
4. Seller delivers product and collects remaining cash from buyer
5. Seller taps "Payment Collected" in dashboard
6. Platform fee (8% of full order value) is debited from seller's tap2buy wallet
7. If wallet balance drops below -LKR 2,000 → COD is auto-disabled for that seller
```

**Fraud Prevention Layers:**

| Layer | Mechanism | What It Prevents |
|---|---|---|
| Booking fee | Buyer pays LKR 200 upfront online | Fake/prank COD orders (massive problem in SL) |
| Wallet deduction | 8% fee auto-debited from wallet | Seller can't dodge platform fees |
| Negative balance kill-switch | COD disabled at -LKR 2,000 | Seller can't accumulate unpaid fees |
| Graduated access | COD unlocks after 10 successful online orders | New/unproven sellers must build trust first |
| Buyer confirmation | WhatsApp message to buyer: "Did you receive your order?" | Catches sellers marking delivered orders as "cancelled" |

**COD Fee Collection via Wallet:**
- Online payment earnings automatically fund the wallet (tap2buy deducts fees and credits the rest)
- COD fees are debited from the same wallet
- A seller doing 60% online / 40% COD will always have enough wallet balance — their online earnings cover COD fees automatically
- A seller going 100% COD with zero online orders? Can't happen — COD is unlocked only after 10 online orders, and the wallet must stay above -LKR 2,000

**COD Access Tiers:**

| Seller Level | COD Access | Monthly COD Cap |
|---|---|---|
| New (0-30 days) | Locked — online only | LKR 0 |
| Verified (10+ online orders) | Unlocked | LKR 25,000 |
| Established (30+ orders) | Unlocked | LKR 100,000 |
| Pro/Business tier | Unlocked | Unlimited |

### 6.6 WhatsApp Commerce Integration (NEW in v3)

**Why this matters:** Sri Lankan buyers don't want to leave WhatsApp. The seller's existing WhatsApp broadcast list is the real competitor — not ShopOnCloud. Instead of fighting WhatsApp, make tap2buy work *through* WhatsApp.

**MVP WhatsApp Features (no API cost):**

1. **Product share links:** Every product has a "Share on WhatsApp" button that generates a pre-formatted message:
   ```
   Check out my [Product Name] - LKR 2,500
   Order here: tap2buy.lk/bakeshop/chocolate-cake
   ```
   Sellers can send this directly in WhatsApp conversations or broadcast lists.

2. **Order confirmation deeplinks:** After a buyer places an order, redirect them to WhatsApp with a pre-filled message to the seller:
   ```
   Hi! I just placed order #1234 on your tap2buy store for [Product Name]. 🎉
   ```
   This bridges the gap — buyers still get the WhatsApp conversation they want, but the order/payment is handled by tap2buy.

3. **WhatsApp chat button on store:** Every store page has a "Chat with seller" WhatsApp button using `wa.me/94XXXXXXXXX?text=...` deep links. Zero API cost.

4. **Buyer delivery confirmation:** After seller marks order as shipped, system sends buyer a WhatsApp deeplink: "Confirm delivery by clicking here" → opens a tap2buy.lk/confirm/[token] page.

**Phase 2 WhatsApp Features (Business API — Pro/Business tier):**

- Automated order notifications to buyers (order confirmed, shipped, delivered)
- WhatsApp catalog sync (seller's tap2buy products appear in WhatsApp Business catalog)
- Cost: ~$0.025/message (utility category) via Twilio or Wati as BSP
- Estimated cost per seller: LKR 50-150/month (covered by Pro subscription margin)

---

## 7. Growth Strategy: First 100 Sellers (Updated)

### 7.1 White-Glove Onboarding (Sellers 1-20)

Personally DM 30-50 sellers across **Instagram AND Facebook** in Colombo. Target:
- **Instagram:** Accounts with 500-5,000 followers in home baking (#colombobaker, #homebakingSL), thrift fashion (#thriftSL, #prelovedsrilanka), handmade goods (#handmadeSL)
- **Facebook:** Active sellers in "Buy & Sell Colombo," "Online Sellers SL," "Women Entrepreneurs SL" groups
- **WhatsApp:** Ask early sellers to share their store link in existing WhatsApp broadcast lists

Offer to set up their store for them. Ask for feedback. Cost: LKR 0.

### 7.2 Content Marketing (Sellers 20-50)

Create an "Instagram Seller DM Audit" — a carousel post or Reel showing how many sales sellers lose to DM drop-offs. Hook: "You're losing 60% of your DM orders. Here's why." CTA: "We built a free tool that fixes this."

**Facebook-specific content (NEW):** Post in SL seller Facebook groups with comparison posts — "Are you still screenshotting bank slips? Here's what automated looks like." Facebook groups are where the volume is.

### 7.3 Referral Program (Sellers 50-100)

Invite 3 seller friends → get 1 month Pro free (LKR 1,990 value). Both referrer and referred get the reward. Cost per acquisition: ~LKR 663/seller.

### 7.4 Milestone Targets

| Week | Sellers | Method | Cost |
|---|---|---|---|
| 1-2 | 10-15 | White-glove DM outreach (IG + FB) | LKR 0 (your time) |
| 3-4 | 25-40 | FB groups + content marketing | LKR 0-5,000 |
| 5-6 | 50-70 | DM Audit content + referral loop | LKR 10,000-15,000 |
| 7-8 | 80-110 | Workshop + organic growth | LKR 10,000-20,000 |

**Total cost to reach 100 sellers: LKR 25,000-40,000 (~US$80-130).**

---

## 8. Development Timeline (Updated)

| Phase | Scope | Duration | Milestone |
|---|---|---|---|
| 1 | Backend API: Auth, multi-tenant DB, product/order CRUD, PayHere integration, 6% fee logic, **seller wallet system, COD order flow** | 4-5 weeks | API functional |
| 2 | Buyer storefront: Next.js, product pages, checkout with fee display, **COD checkout with booking fee**, path-based routing, **WhatsApp share links** | 3-4 weeks | Stores live on web |
| 3 | Seller dashboard: Mobile-optimized web app for product mgmt, orders, revenue tracking, **wallet management, COD order management, NIC upload** | 3-4 weeks | MVP complete |
| 4 | Testing, PayHere sandbox, 10-20 beta sellers, **COD flow testing** | 2-3 weeks | Beta launch |
| 5 | Public launch + white-glove onboarding | 1-2 weeks | LIVE |

**Total time to MVP launch: 14-18 weeks (3.5-4.5 months).**

Added ~2 weeks vs v2 for COD flow, wallet system, and seller verification. Worth it — COD could represent 40% of all orders.

---

## 9. Key Risks & Mitigations (Updated)

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Low adoption | Sellers stick with free DMs | Medium | White-glove onboarding; 6% is less than any alternative; no upfront cost |
| 6% feels high | Sellers compare to 0% cost of DMs | Medium | Frame as "payment processing fee" not commission; compare to Daraz's 30%+ |
| COD fraud | Sellers under-report cash collections | High | Booking fee + wallet deduction + graduated access + buyer confirmation (Section 6.5) |
| PayHere downtime | Orders can't be processed | Low | Add DirectPay as backup in Phase 2 |
| PayHere volume limit | Lite plan caps at LKR 200K/month | Medium | Upgrade to Plus (LKR 3,990/mo) when GMV exceeds LKR 200K; factor into costs |
| Competitor copies | ShopOnCloud adds social features | Low | Speed to market + community relationships are the moat |
| Seller churn | Sellers go inactive after initial excitement | High | Onboarding sequence, dormancy alerts, seasonal campaigns, win-back offers |
| Regulatory issues | CBSL flags payment pooling model | Medium | Use PayHere as licensed aggregator; don't hold funds; consult fintech lawyer (Section 12) |
| Fake stores / scams | Fraudulent sellers damage platform trust | Medium | NIC verification, payout holds, dispute resolution (Section 11) |

---

## 10. Immediate Next Steps

1. **Register tap2buy.lk domain** this week (LKR 3,700 via register.lk)
2. **Register business** as sole proprietorship at Divisional Secretariat (~LKR 5,000)
3. **Secure @tap2buy.lk** Instagram handle, Facebook page, and WhatsApp Business number
4. **Apply for PayHere Lite merchant account** (free, takes 3-7 days for approval)
5. **Consult a fintech lawyer** about payment facilitation model — 1-hour consultation (~LKR 10,000-15,000) to confirm you're not operating as an unlicensed payment intermediary
6. **DM 20 sellers** on Instagram AND Facebook — don't pitch, just ask about their DM workflow pain points
7. **Set up DigitalOcean droplet** ($6/mo) and begin backend API development
8. **Build PayHere checkout integration** with 6% fee calculation as the first feature
9. **Build seller wallet system** and COD order flow as the second feature
10. **Get first beta store live within 5 weeks**

---

## 11. Trust, Fraud & Seller Verification (NEW in v3)

This section was entirely missing from v2. For a platform handling money, this is not optional.

### 11.1 Seller Verification (Onboarding)

| Verification Level | Required For | What's Collected | How It's Verified |
|---|---|---|---|
| Basic | Free tier signup | Phone number + email | OTP verification |
| Identity | First payout | NIC number + NIC photo (front) | NIC format validation (open-source parser available: github.com/slwdc/NICParser) + manual review for first 200 sellers |
| Bank | First payout | Bank account name + number + branch | Must match NIC name; first micro-deposit verification (LKR 1) |

**Why NIC verification matters:** 60% of social media businesses in Sri Lanka are unregistered (IPS data). You're not trying to force registration — but you need to know who is receiving money through your platform. This protects you legally and protects buyers from scams.

**Implementation for MVP:** NIC validation can be done programmatically using open-source libraries. For the first 200 sellers, manually review NIC photos (takes 2 minutes each). At scale, consider IDMERIT or the Department of Registration of Persons' official verification web service.

### 11.2 Payout Controls

| Control | Rule |
|---|---|
| First payout hold | 3 business days after first order (allows time for disputes) |
| Subsequent payouts | Next business day (standard) or same-day (Pro/Business) |
| Payout minimum | LKR 500 (prevents micro-withdrawal abuse) |
| Dispute hold | If buyer disputes, payout for that order is frozen pending resolution |
| Negative wallet | If wallet balance goes below -LKR 2,000, all payouts frozen until balance cleared |

### 11.3 Buyer Protection

| Scenario | What Happens |
|---|---|
| Buyer pays online, seller doesn't deliver | Buyer contacts tap2buy via WhatsApp. 7-day resolution window. If seller can't prove shipment, full refund from seller's wallet. |
| Buyer pays COD booking fee, seller doesn't deliver | Booking fee refunded automatically after 7 days if seller doesn't mark as shipped. |
| Buyer receives wrong/damaged item | Seller and buyer negotiate via WhatsApp. tap2buy mediates if needed. No automatic refund (too easy to abuse). |

### 11.4 Store Takedown Criteria

- 3+ unresolved buyer complaints within 30 days → store suspended pending review
- NIC verification failure → store disabled immediately
- Wallet balance below -LKR 5,000 for 14+ days → store suspended
- Fraudulent product listings (reported by community) → 24-hour review, takedown if confirmed

---

## 12. Legal, Tax & Regulatory Compliance (NEW in v3)

### 12.1 Business Registration

**Recommended: Sole Proprietorship (for now)**

| Structure | Cost | Timeline | Liability | Payment Processing |
|---|---|---|---|---|
| Sole Proprietorship | ~LKR 5,000 | 1-2 weeks | Unlimited personal liability | PayHere accepts sole prop merchants |
| Private Limited (Pvt Ltd) | LKR 25,000-40,000 + legal fees | 2-4 weeks | Limited to shareholding | Better for scaling, required for CBSL licensing |

**Start as sole proprietorship** to keep costs minimal. Convert to Pvt Ltd when monthly GMV exceeds LKR 1M or when seeking external funding. PayHere's Lite plan accepts sole proprietorship merchants.

### 12.2 CBSL Payment Regulations — Critical Analysis

**The Risk (from v2 assessment):** If tap2buy collects buyer payments into a pooled account and then disburses to sellers, this could be classified as a Money or Value Transfer Service (MVTS). As of June 2024, all MVTS providers must be registered with CBSL, with minimum capital of LKR 20 million.

**The Solution — You Are NOT an MVTS:**

tap2buy does **not** hold or transfer funds between parties. Here's the compliant architecture:

```
COMPLIANT MODEL (tap2buy as a PayHere merchant):
1. Buyer pays via PayHere → PayHere (licensed aggregator) holds funds
2. PayHere settles to tap2buy's merchant bank account (next business day)
3. tap2buy credits seller's wallet balance (internal ledger entry only)
4. Seller requests withdrawal → tap2buy initiates bank transfer to seller
```

**Key distinction:** PayHere is the licensed payment aggregator (CBSL-approved since 2018). tap2buy is simply a PayHere merchant that subsequently shares revenue with sellers. This is the same model used by thousands of affiliate programs and marketplace platforms.

**However, there are gray areas:**
- If tap2buy holds funds for more than T+1 (next business day), it could be viewed as "holding customer funds"
- If tap2buy's daily payout volume becomes large, CBSL may take interest

**Recommended actions:**
1. **Consult a fintech lawyer** before launch (budget LKR 10,000-15,000 for a 1-hour consultation)
2. **Process payouts within T+1** — don't hold seller funds longer than necessary
3. **Keep records** of all PayHere settlements and seller payouts for audit trail
4. **Plan for Pvt Ltd conversion** and potential CBSL registration when GMV exceeds LKR 5M/month

**PayHere Plan Implications:**

| PayHere Plan | Monthly Fee | Processing Fee | Transaction Limit | Monthly Volume Limit |
|---|---|---|---|---|
| Lite (MVP) | Free | 3.30% | LKR 50,000/txn | LKR 200,000/month |
| Plus (Scale) | LKR 3,990/mo | 2.99% | LKR 250,000/txn | LKR 3,000,000/month |
| Premium | LKR 9,990/mo | 2.69% | LKR 1,000,000/txn | Unlimited |

**Important:** PayHere Lite caps at LKR 200,000/month total volume. With 15 sellers averaging 8 orders of LKR 2,500, that's LKR 300,000/month in GMV — you'll hit the Lite cap by Month 5-6. **Budget for upgrading to Plus (LKR 3,990/mo) by Month 6.** Update operating costs accordingly.

### 12.3 Tax Obligations

| Tax | Threshold | Rate | When to Act |
|---|---|---|---|
| Income Tax | All income | Progressive (6-36%) | File annually from Year 1; keep records of all revenue and expenses |
| VAT | LKR 80M quarterly turnover | 18% | Unlikely in Year 1-2; register when approaching threshold |
| Withholding Tax | Payments to sellers | 5% WHT on commissions if >LKR 50,000/month to one payee | Monitor per-seller payouts; unlikely to trigger early |
| APIT | If you hire employees | Per salary slab | Only relevant when you have staff |

**Practical advice:** Get a basic accountant (LKR 5,000-10,000/month) once monthly revenue exceeds LKR 50,000. Until then, maintain a simple spreadsheet of PayHere settlements, seller payouts, and expenses.

---

## 13. Courier Integration Strategy (NEW in v3)

### 13.1 Sri Lankan Courier Landscape

| Courier | Coverage | COD Support | API | COD Settlement | Best For |
|---|---|---|---|---|---|
| Koombiyo | Island-wide (100+ locations) | Yes | Yes (Node.js SDK on GitHub) | 7-15 days | E-commerce specialists; lowest rates |
| Pronto | Island-wide (34+ years) | Yes | Contact for details | 15 days | Reliability; established network |
| Domex | Island-wide | Yes | Basic tracking | Every 15 days | Corporate/document courier |
| PickMe | Colombo metro area | No (on-demand only) | Yes | N/A | Same-day delivery in Colombo |

### 13.2 Phased Courier Integration

**MVP (Phase 1):** No courier integration. Sellers handle delivery themselves (personal delivery, calling courier directly). This is how they operate today — tap2buy doesn't make it worse. Store checkout collects buyer's delivery address. Seller sees it in their dashboard.

**Phase 2 (Month 4-8):** Koombiyo API integration.
- Seller clicks "Create Shipment" in dashboard → auto-fills Koombiyo order via API
- Tracking number auto-populated; buyer gets WhatsApp notification with tracking link
- For COD orders: Koombiyo collects cash from buyer and settles to tap2buy (7-15 day cycle)
- This eliminates the COD trust problem entirely — the courier collects, not the seller

**Phase 3 (Month 9+):** Multi-courier support (Pronto, Domex). Seller chooses preferred courier. Rate comparison in dashboard.

### 13.3 Why Koombiyo First

- Only SL courier with a published, open-source Node.js SDK
- Specializes in e-commerce (not just documents)
- Lowest rates in Sri Lanka (self-reported)
- COD collection and settlement built into their service
- When Koombiyo handles COD collection in Phase 2, it eliminates the seller-side trust problem — cash goes from buyer → Koombiyo → tap2buy → seller wallet

---

## 14. Key Metrics to Track

| Metric | Definition | Target (Month 6) | Target (Month 12) |
|---|---|---|---|
| Active Sellers | Sellers with 1+ order in last 30 days | 25 | 95 |
| GMV | Total value of all orders | LKR 500,000 | LKR 1,900,000 |
| Take Rate | Platform revenue / GMV | 4.8% (blended) | 5.0% (blended) |
| Orders per Seller | Average monthly orders per active seller | 8 | 10 |
| COD % | COD orders / total orders | 40% | 35% (declining as trust in online grows) |
| Free → Pro Conversion | % of free sellers upgrading | 4% | 7% |
| Monthly Churn | % of active sellers going inactive | 15% | 10% |
| NPS | Net Promoter Score (survey via WhatsApp) | 40+ | 50+ |
| Support Response Time | Average WhatsApp reply time | < 2 hours | < 1 hour |
| Dispute Rate | Buyer disputes / total orders | < 3% | < 2% |

---

## Summary: V2 vs V3 Comparison

| Dimension | V2 | V3 |
|---|---|---|
| Positioning | Instagram-to-Store | Social Media-to-Store (IG + FB + WhatsApp) |
| COD Support | Phase 3 (Month 9+) | **MVP — with fraud-safe architecture** |
| Revenue per order | LKR 67.50 (online only) | LKR 120.50 (blended online + COD) |
| Seller target (Month 18) | 500 sellers | 190 active sellers (realistic with churn) |
| Revenue target (Month 18) | LKR 343,870 | LKR 221,000 (conservative but credible) |
| Churn modeling | None | 10% monthly churn + 30% early abandonment |
| Fraud prevention | None | NIC verification + wallet + payout holds + buyer confirmation |
| Legal/regulatory | Not addressed | CBSL analysis + business registration + tax plan |
| WhatsApp strategy | Chat button only | Product sharing + buyer confirmation + deeplinks |
| Facebook strategy | Not addressed | Targeted seller acquisition via FB groups |
| Courier integration | Phase 3 | Phase 2 (Koombiyo API) with clear roadmap |
| PayHere plan limits | Not addressed | Lite cap identified; Plus upgrade budgeted |

---

**Total risk: LKR 13,700 to launch a web MVP. LKR 53,700 for the full phased rollout including mobile apps and business registration. Monthly operating cost: LKR 2,258 (rising to ~LKR 6,250 when PayHere Plus upgrade is needed). Profitable from Month 1 of launch even with conservative projections.**

**What's genuinely new in v3:** This plan now honestly addresses COD (40% of potential orders), accounts for seller churn, has a regulatory compliance strategy, includes fraud prevention from day one, and targets the full Sri Lankan social selling market — not just Instagram. The revenue projections are 36% lower than v2, but they're projections you can actually defend to an investor or a co-founder.

---

*— End of Document —*

*Version 3.0 — March 2026*
*Prepared by Shahid with strategic review and market research*
