MASTER PROMPT — SOLWEAR WEBSITE REDESIGN

You are working on SOLWEAR, an early-stage hardware + software startup building a wearable device for the Solana ecosystem.

Your job is NOT to simply make the current website prettier.

Your job is to rethink and rebuild the entire website as a premium, credible, futuristic product website that makes someone immediately understand what SolWear is, why it matters, and why they should want one.

You are acting simultaneously as:

senior product designer
creative director
frontend engineer
UX engineer
motion designer
conversion/growth designer
technical copywriter

The final result should feel like a real startup preparing for a major product launch — not a hackathon landing page.

1. FIRST: UNDERSTAND SOLWEAR

Before changing code, inspect the entire existing project.

Understand:

current architecture
framework
routing
backend
database
authentication
admin panel
current animations
current assets
current responsive behavior
existing APIs
existing deployment assumptions

Do NOT immediately start rewriting everything.

First understand what already works and preserve useful infrastructure where possible.

Then redesign the product around the direction below.

2. WHAT SOLWEAR ACTUALLY IS

SolWear started as a wearable Solana hardware wallet.

But the positioning has evolved.

Do NOT build the website around:

“another hardware wallet”

and do NOT build it around:

“a crypto watch”

The bigger idea is:

SOLWEAR IS A WEARABLE INTERFACE FOR THE SOLANA ECOSYSTEM.

The hardware is the first reference device.

The long-term vision is:

DEVICE → SOLWEAR OS → SDK → DEVELOPERS → APPS → ECOSYSTEM

The device should feel like something you naturally wear every day, while giving you access to Solana-native experiences.

Potential experiences include:

payments
transaction signing
identity
notifications
loyalty
NFC interactions
Solana Pay
Blinks / Actions
future DePIN interactions
third-party wearable applications
developer-built experiences

The ecosystem is important because the business should eventually be larger than selling a piece of hardware.

The long-term business model can include:

hardware
ecosystem/app revenue
developer services
enterprise / white-label integrations
future security/cloud services

The current business-development plan explicitly frames SolWear as a wearable platform for the Solana ecosystem, with the device as the reference hardware and OS/SDK/ecosystem creating long-term value.

3. VERY IMPORTANT: THE APPLE WATCH QUESTION

This is one of the biggest strategic lessons from our recent conversations.

We have received feedback along the lines of:

“People want an Apple Watch, but on Solana.”

Do NOT ignore this.

This is not necessarily a request to literally clone Apple Watch.

It is a signal that users may value:

wearability + usefulness + beautiful hardware + everyday utility

more than:

“I want a hardware wallet that happens to be a watch.”

Therefore the website should make SolWear feel like:

a new category of wearable computing for Solana

rather than:

a crypto wallet attached to your wrist.

The visitor should be able to imagine wearing it every day.

The website should communicate:

desirable hardware
everyday utility
simplicity
ecosystem potential
premium technology
Solana-native functionality

WITHOUT pretending that SolWear is already a fully mature Apple Watch competitor.

Do not make unsupported claims.

4. LESSONS FROM THE SOLANA ECOSYSTEM

We studied competitors and received external feedback.

Use those lessons strategically.

Solflare Shield

The existence of Solflare Shield means:

“screenless Solana hardware wallet” is NOT enough differentiation.

SolWear should therefore focus on:

wearable form factor
always-on / always-with-you interaction
NFC
payments
wearable identity
ecosystem applications
developer platform
future OS
everyday utility

The research specifically concluded that SolWear cannot win simply by being another screenless Solana wallet.

Unruggable

Unruggable is useful as a reference for:

Solana-native positioning
strong engineering identity
developer ecosystem
open-source thinking
polished product presentation

But DO NOT copy Unruggable.

Instead, understand why their positioning works and create our own category.

The competitive analysis found Unruggable's strongest differentiation to be Solana-native depth, Rust, integrations, and open-source positioning, while its public hardware lacks NFC/payment functionality.

That gives SolWear a very different opportunity:

WEARABLE + SOLANA + NFC + EVERYDAY INTERACTION + ECOSYSTEM

5. WHAT WE LEARNED FROM THE ROAST

We received harsh but useful criticism.

Take the lessons seriously.

Do NOT:

overclaim security
pretend prototype hardware is production hardware
claim “phone-free” if a phone is required
make ridiculous TAM claims
make fake partner claims
make unsupported technical claims
make the website look like a fashion store
make SolWear feel like a generic crypto hardware wallet

The roast's central conclusion was basically:

The concept is interesting, but it needs to become a real product rather than a compelling demo.

The website should therefore communicate maturity and honesty.

For example:

Prefer:

PHONE-OPTIONAL

over:

NO PHONE NEEDED

when that is technically more accurate.

The strategic research specifically recommends positioning SolWear as phone-optional rather than phone-free: direct Wi-Fi can work on provisioned networks while BLE can relay through the phone elsewhere.

6. SECURITY LANGUAGE

Do not invent or exaggerate security claims.

Our existing research identified an important technical correction:

ATECC608A does not natively perform Solana's Ed25519 signing.

Therefore DO NOT write things like:

“ATECC608A securely signs Solana transactions”

unless the actual implementation proves that.

The website should only expose security claims that are actually implemented and verified.

The strategic research describes a credible direction around:

ESP32-S3
secure boot
flash encryption
encrypted storage
Ed25519 signing
future Ed25519-capable secure element

but do not present future architecture as already shipped.

If something is future technology, label it:

PLANNED

IN DEVELOPMENT

FUTURE

etc.

Trust is more important than sounding impressive.

7. BRAND PHILOSOPHY

The website should feel like a combination of:

premium consumer hardware
Nothing
Apple
modern Solana ecosystem design
experimental generative interfaces
brutal simplicity
futuristic physical computing

BUT DO NOT COPY ANY OF THEM.

We want the feeling of:

“What the fuck is this? I want to touch it.”

Not:

“Here is another Web3 startup landing page.”

Avoid:

generic gradients
excessive purple
generic crypto illustrations
floating coins
meaningless 3D blobs
excessive glassmorphism
huge paragraphs
startup buzzwords
fake futuristic UI

The product should be the hero.

8. DESIGN LANGUAGE

Everything should feel intentional.

Typography:

ALL WEBSITE COPY IN UPPERCASE
SOLWEAR brand wordmark:
SOL = BOLD
WEAR = ITALIC
make the wordmark slightly larger than currently
vertically align the wordmark with the logo
keep proportions stable and premium
use a strong bold typeface
avoid excessive font sizes that break hierarchy

The browser title must be exactly:

SOLWEAR

No additional words.

9. INFORMATION ARCHITECTURE

Final primary navigation:

LEFT

SOLWEAR LOGO

Clicking it → HOME

CENTER

PRODUCT

ECOSYSTEM

COMMUNITY

RIGHT

JOIN WAITLIST

The navbar should remain extremely minimal.

Remove:

PITCH
old Achievements navigation
unnecessary buttons
duplicate CTAs
legacy navigation

The old Pitch page should be removed.

The Product page and Ecosystem page should exist because they are strategically important.

10. PAGES
HOME

The homepage must immediately answer:

WHAT IS SOLWEAR?

Do NOT simply show a beautiful device and expect the user to understand.

The first screen should communicate:

what SolWear is
who it is for
what makes it different
what the user can do

But keep it extremely concise.

Follow the positioning lesson:

clarity > cleverness

The messaging workshop specifically emphasized that the hero headline must be extremely clear and concise, and that the customer should be the hero rather than the company.

Use this structure:

HERO

SHORT HEADLINE

SHORT SUBHEADLINE

PRODUCT VISUAL

JOIN WAITLIST

Then:

SOCIAL PROOF

Partners / accelerators / ecosystem / achievements.

Only show real relationships.

If something is merely part of our technology stack, call it a technology stack — do NOT call it a partner.

The messaging workshop explicitly recommends social proof directly below the hero, while warning against falsely presenting technology integrations as partnerships.

Then:

THE PROBLEM

Why existing crypto experiences don't feel like everyday technology.

THE SOLUTION

Why SolWear changes that.

BENEFITS

Focus on outcomes, not a feature dump.

Maximum ~3–4 major benefits.

HOW IT WORKS

Prefer a simple 3-step explanation.

For example:

CONNECT → TAP → DONE

But choose the actual wording based on the implemented product.

PRODUCT / DEVICE

Beautiful product presentation.

ECOSYSTEM

Introduce the larger SolWear vision.

ACHIEVEMENTS / TRUST

Dynamic from admin.

WAITLIST

Strong final CTA.

11. PRODUCT PAGE

Create a dedicated:

SOLWEAR MK1

product page.

This should feel like a real hardware product page.

Not a technical documentation page.

Show:

device
wrist
close-up details
interface
materials
NFC
signing
battery
connectivity
current capabilities
development status

Use large product imagery.

Structure:

INTRO

WHY IT EXISTS

DESIGN

HOW IT WORKS

TECHNOLOGY

SPECIFICATIONS

WHAT'S NEXT

WAITLIST

Do not expose every engineering detail.

This page is for users, partners and potential customers.

12. ECOSYSTEM PAGE

This is extremely important.

The ecosystem is what prevents SolWear from becoming:

“another hardware startup.”

Explain the future:

SOLWEAR DEVICE

The reference hardware.

SOLWEAR OS

The wearable operating system.

SOLWEAR SDK

Tools developers use to build for SolWear.

DEVELOPER PORTAL

Documentation, emulator and examples.

APPLICATIONS

Future third-party applications.

PROTOCOL INTEGRATIONS

Payments, identity, notifications, transaction approvals, etc.

FUTURE APP ECOSYSTEM

Explain that SolWear should eventually become a platform where developers can build wearable experiences.

Do not pretend the ecosystem already exists.

Clearly distinguish:

AVAILABLE

IN DEVELOPMENT

PLANNED

This is aligned with the current business-development strategy.

13. COMMUNITY

Community should be gated.

Flow:

STEP 1

Cloudflare Turnstile.

STEP 2

Login with X / Twitter OAuth.

STEP 3

After authentication:

If user is NOT on waitlist:

JOIN THE SOLWEAR WAITLIST

If already registered:

YOU'RE ON THE LIST

Community should eventually become a place for:

early users
builders
developers
announcements
beta access
feedback
ecosystem members

Keep the architecture extensible.

14. WAITLIST

“WAITLIST” / “JOIN WAITLIST” should be treated as an actual product-growth mechanism.

It must:

collect email
prevent duplicates
store timestamp
optionally store source/referrer
optionally associate X account
provide success state
provide error states
be protected from spam
be manageable from admin

The community login should be able to associate an X account with an existing email/waitlist record where appropriate.

Do not create duplicate users.

15. COMING SOON / UNDER CONSTRUCTION

Coming Soon should NOT necessarily be a permanent navigation page.

Instead:

Build a global admin-controlled maintenance / coming-soon mode.

Admin can toggle:

SITE LIVE

or

COMING SOON

When enabled:

normal visitors see the Coming Soon experience.

Admins can still access the site/admin.

16. ADMIN PANEL

This is NOT optional.

The admin panel must actually work.

Admin should be able to manage the entire website without editing source code.

Include:

SITE
enable/disable Coming Soon
global site settings
SEO title
social links
HOME
hero text
hero media
benefits
sections
achievements
metrics
partners
CTA
PRODUCT
product text
images
specifications
features
status
ECOSYSTEM
roadmap
modules
integrations
development status
future plans
COMMUNITY
users
X accounts
roles
moderation
waitlist status
WAITLIST
total signups
emails
timestamps
X accounts
source
export
duplicate detection
ANALYTICS

At minimum:

visitors
unique visitors
page views
top pages
waitlist conversions
community registrations
wishlist/waitlist growth
referral/source data if available
PARTNERS / ACHIEVEMENTS

CRUD interface.

Nothing should require changing code.

17. CUBE ANIMATION — CORE VISUAL IDENTITY

This is one of the most important parts of the redesign.

The cube system should become part of SolWear's visual identity.

When entering the site:

The entire screen initially consists of cubes.

Then:

random cubes from different parts of the background detach

→ fly toward the foreground

→ cluster together

→ form UI elements

→ reveal the interface.

For example:

CUBES

↓

LOGO

↓

HEADLINE

↓

SUBHEADLINE

↓

BUTTON

↓

PRODUCT

etc.

The effect must happen very quickly.

It should feel engineered, not like a loading screen.

18. IMPORTANT CUBE BEHAVIOR

The background should NEVER disappear after the intro.

The cubes that aren't used remain in the background.

They continuously form the ambient environment.

Therefore there are two systems:

BACKGROUND FIELD

Persistent cubes.

FOREGROUND ASSEMBLY SYSTEM

Cubes temporarily detach from the background and form UI elements.

After forming the element, they should either:

remain as part of the element
or smoothly return to the ambient field

depending on the visual design.

19. SCROLL REVEAL

Do NOT animate the entire page on initial load.

Only assemble elements that are actually visible.

When the user scrolls:

new elements entering the viewport trigger their cube assembly.

Use:

IntersectionObserver
efficient scheduling
animation state tracking

Never waste resources animating invisible content.

20. MOUSE WAVE

Current behavior:

mouse movement creates a wave continuously while the mouse moves.

This is WRONG.

Desired behavior:

USER MOVES CURSOR

→ ONE WAVE

USER CONTINUES MOVING

→ NO NEW WAVE

USER STOPS

→ system becomes ready again

USER MOVES AGAIN

→ ONE NEW WAVE

So the wave is triggered only by the transition from idle → moving.

Implement this cleanly.

Do not attach expensive logic to every mousemove.

Use:

movement state
cooldown/debounce
requestAnimationFrame
GPU-friendly transforms
21. PERFORMANCE IS A FEATURE

The animation must look insane while remaining fast.

Target:

60 FPS where hardware allows it.

Optimize aggressively.

Use:

WebGL efficiently
instanced geometry where appropriate
object pooling
GPU transforms
requestAnimationFrame
throttled input
IntersectionObserver
lazy loading
reduced particle count on mobile
adaptive quality
device capability detection

Do NOT render 10,000 unnecessary DOM elements.

Do NOT create a separate heavy canvas for every section.

Prefer one shared rendering system if architecture allows it.

22. MOBILE

This website MUST work beautifully on:

iPhone
Android
tablets
laptops
ultrawide monitors
low-resolution screens

Do not simply shrink desktop.

Mobile needs its own interaction strategy.

On low-powered devices:

reduce:

cube count
shadow complexity
post-processing
animation frequency

but preserve the identity of the effect.

Never sacrifice usability for animation.

Respect:

prefers-reduced-motion

23. COPYWRITING PRINCIPLES

This is extremely important.

Do NOT write generic startup copy like:

“Revolutionizing the future of decentralized wearable finance.”

That is meaningless.

Use:

SHORT

SPECIFIC

CONFIDENT

HUMAN

PRODUCT-FOCUSED

The messaging workshop emphasized:

one clear idea
clear headline
clear problem
clear solution
outcomes over features
proof over claims
customer as hero
“show, don't claim”

Every section should answer:

WHY SHOULD I CARE?

Do not make users read paragraphs to understand the product.

24. POSITIONING

The site should NOT position SolWear as:

❌ another hardware wallet

❌ another crypto watch

❌ an Apple Watch clone

❌ a Solana phone

❌ a generic wearable

Instead:

A WEARABLE INTERFACE FOR THE SOLANA ECOSYSTEM.

The first killer experience is payments / signing.

The long-term opportunity is the ecosystem.

The device is the entry point.

25. “APPLE WATCH BUT SOLANA” — USE THE INSIGHT, NOT THE PHRASE

Do NOT literally put:

“APPLE WATCH BUT FOR SOLANA”

on the website.

Use the underlying insight:

Apple Watch succeeded because it became an everyday object, not because it was marketed as “a tiny computer strapped to your wrist.”

SolWear should aspire to the same emotional category:

I WANT TO WEAR THIS.

Then:

I CAN DO THINGS WITH IT.

Then:

IT HAPPENS TO BE NATIVE TO SOLANA.

The product should look desirable before the user even understands all the crypto functionality.

26. DO NOT OVERLOAD THE HOMEPAGE

One of the most important design lessons:

ONE IDEA AT A TIME.

Do not put:

20 features
technical architecture diagrams
huge roadmap
tokenomics
security architecture
massive FAQ
giant partner wall

on the homepage.

The homepage sells the idea.

Product explains the product.

Ecosystem explains the future.

Community builds the community.

Admin manages everything.

27. SOCIAL PROOF

Use real evidence.

Possible categories:

accelerators
hackathons
ecosystem involvement
real partners
real integrations
real user numbers
real prototypes
real milestones

If something is not a partnership, don't call it one.

If a number cannot be verified, don't publish it.

Credibility > vanity.

The positioning material explicitly recommends putting names/numbers immediately after the hero when they genuinely prove credibility.

28. FOOTER

Make it small.

Include:

X
GitHub
other actual social channels
copyright
maybe contact

Remove:

Pitch
unnecessary navigation
giant footer CTA
redundant content
29. SEO

Title:

SOLWEAR

Implement proper:

meta description
OG tags
Twitter/X cards
canonical URLs
semantic HTML
sitemap
robots.txt
structured metadata where useful

Do NOT turn the visual WebGL layer into inaccessible text.

All important copy must exist as real HTML.

30. ACCESSIBILITY

Ensure:

keyboard navigation
visible focus
semantic HTML
readable contrast
buttons have labels
forms have accessible errors
animations respect reduced motion
screen readers can understand the content

The crazy visuals must never make the website unusable.

31. TECHNICAL ARCHITECTURE

Before implementation:

inspect the existing stack.

Then choose the simplest architecture that supports:

high-performance animation
routing
authentication
waitlist
community
admin
analytics
content management

Do not introduce unnecessary dependencies.

Do not rewrite working backend infrastructure just because you prefer another framework.

If something is already implemented correctly, improve it instead of replacing it.

32. SECURITY

Treat:

X OAuth
Cloudflare Turnstile
admin authentication
email collection
database access
analytics

as production-sensitive.

Never expose secrets client-side.

Validate everything server-side.

Rate-limit:

waitlist
authentication
admin APIs
community actions

Do not trust client-side authentication state.

33. DATA MODEL

The system should conceptually support:

USER
id
email
X ID
username
createdAt
waitlist status
community status
role
WAITLIST
email
user ID
timestamp
source
referral
status
SITE SETTINGS
maintenance
hero
social links
SEO
CONTENT
pages
sections
images
achievements
partners
roadmap
ANALYTICS
page
visitor
timestamp
source
event

Adapt this to the existing architecture instead of blindly implementing a new schema.

34. DESIGN PROCESS

Do not immediately write hundreds of lines of code.

First:

PHASE 1 — AUDIT

Inspect the existing application.

PHASE 2 — INFORMATION ARCHITECTURE

Define routes and component hierarchy.

PHASE 3 — DESIGN SYSTEM

Define:

typography
spacing
buttons
cards
navigation
cube system
motion principles
PHASE 4 — HOMEPAGE

Build the core experience.

PHASE 5 — PRODUCT
PHASE 6 — ECOSYSTEM
PHASE 7 — COMMUNITY + WAITLIST
PHASE 8 — ADMIN
PHASE 9 — PERFORMANCE
PHASE 10 — FINAL QA
35. DO NOT ASK ME TO MICRO-MANAGE DESIGN

You are expected to make good design decisions yourself.

If something is ambiguous:

choose the solution that best serves:

clarity
product desirability
conversion
credibility
performance
maintainability

Do not ask me whether a 16px margin should be 20px.

Use your judgment.

36. IMPORTANT: USE THE PROVIDED RESEARCH

There are project documents containing:

SolWear strategic research
competitive analysis
Unruggable analysis
roast/feedback
positioning/messaging workshops
business-development strategy
technical architecture
previous SolWear website requirements

Read them before making major positioning or copy decisions.

They are source material and lessons, not text to copy.

Especially study:

the Unruggable analysis
the SolWear strategic/technical research
the roast
the positioning/messaging workshop
the SolWear business-development plan

The goal is to understand the lessons and apply them.

Do not blindly reproduce old claims if newer project information contradicts them.

37. MOST IMPORTANT STRATEGIC SHIFT

The old SolWear website tried to convince people:

“This is a secure crypto hardware wallet.”

The new website needs to make people think:

“Holy shit, I actually want to wear this.”

Then:

“Oh, it's native to Solana.”

Then:

“Wait, developers can build on it?”

Then:

“I want early access.”

That is the emotional progression.

38. FINAL EXPERIENCE

Imagine someone opens:

solwear.tech

They should understand the category within seconds.

They should see a product that feels desirable.

They should understand that SolWear is not merely another wallet.

They should see evidence that real people/ecosystem players are behind it.

They should understand that the device is the beginning of a larger platform.

And they should have one obvious action:

JOIN WAITLIST

39. DEFINITION OF DONE

Do not consider the task complete when the page “looks good.”

It is complete only when:

 HOME works
 PRODUCT works
 ECOSYSTEM works
 COMMUNITY works
 WAITLIST works
 X OAuth works
 Cloudflare Turnstile works
 duplicate waitlists are handled
 admin works
 maintenance mode works
 content is editable
 analytics work
 cube intro works
 cube scroll reveal works
 cube background remains alive
 mouse wave triggers only once per movement session
 mobile experience works
 reduced motion works
 performance is good
 SEO is implemented
 no broken routes
 no console errors
 no fake claims
 no placeholder copy
 no dead buttons
 no legacy Pitch page
 no unnecessary navigation
 all important content is real HTML
 waitlist data is actually persisted
 admin data is actually persisted

Then test the entire site yourself.

Do a final pass as:

A RANDOM USER

A CRYPTO USER

A NON-CRYPTO USER

A POTENTIAL INVESTOR

A POTENTIAL PARTNER

A DEVELOPER

If any of them cannot understand what SolWear is quickly, fix the messaging.

If the website looks impressive but the product is unclear, fix the website.

If the website explains everything but doesn't make people want it, fix the design.

If the animation is beautiful but slow, fix the animation.

If the product claims more than it currently does, fix the claims.

FINAL RULE

DO NOT BUILD A BEAUTIFUL WEBSITE FOR SOLWEAR.

Build a website that makes SOLWEAR FEEL LIKE THE BEGINNING OF A NEW CATEGORY.

The hardware is the entry point.

The wearable experience is the hook.

Solana is the ecosystem.

SolWear OS is the platform.

The SDK is the expansion layer.

The community is the early network.

And the waitlist is the first measurable proof of demand.

MAKE IT FEEL REAL.