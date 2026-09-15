// ─────────────────────────────────────────────────────────────────────────────
// SolWear site content model.
//
// Every string here is rendered as-is and every string is editable from the
// admin panel, so copy lives in ONE place. Site copy is uppercase by design.
//
// Honesty rule: anything not shipping today carries an explicit Status tag.
// ─────────────────────────────────────────────────────────────────────────────

/** Maturity label. Never present PLANNED work as shipped. */
export type Status = "AVAILABLE" | "IN DEVELOPMENT" | "PLANNED";

export type Point = { title: string; text: string };
export type Step = { step: string; title: string; text: string };
export type Spec = { label: string; value: string };
export type StatusItem = { title: string; text: string; status: Status };

export type SiteContent = {
  home: {
    hero: {
      eyebrow: string;
      headline: string;
      subheadline: string;
      primaryCta: string;
      secondaryCta: string;
      capabilities: string[];
      image: string;
      imageAlt: string;
    };
    proof: { label: string; note: string };
    problem: { label: string; headline: string; body: string; points: Point[] };
    solution: { label: string; headline: string; body: string; points: Point[] };
    benefits: { label: string; headline: string; items: Point[] };
    howItWorks: { label: string; headline: string; steps: Step[] };
    device: { label: string; headline: string; body: string; image: string; imageAlt: string; specs: Spec[]; cta: string };
    ecosystem: { label: string; headline: string; body: string; layers: StatusItem[]; cta: string };
    waitlist: { headline: string; body: string; cta: string; note: string };
  };
  product: {
    hero: { eyebrow: string; headline: string; subheadline: string; image: string; imageAlt: string };
    why: { label: string; headline: string; body: string; points: Point[]; image: string; imageAlt: string };
    design: { label: string; headline: string; body: string; details: Point[]; image: string; imageAlt: string };
    howItWorks: { label: string; headline: string; steps: Step[] };
    technology: { label: string; headline: string; body: string; items: StatusItem[] };
    specs: { label: string; headline: string; note: string; groups: Array<{ name: string; specs: Spec[] }> };
    next: { label: string; headline: string; body: string; items: StatusItem[] };
  };
  ecosystem: {
    hero: { eyebrow: string; headline: string; subheadline: string };
    stack: { label: string; headline: string; body: string; layers: StatusItem[] };
    integrations: { label: string; headline: string; body: string; items: StatusItem[] };
    developers: { label: string; headline: string; body: string; points: Point[] };
    apps: { label: string; headline: string; body: string; ideas: Point[] };
  };
  community: {
    hero: { eyebrow: string; headline: string; subheadline: string };
    gate: { turnstileTitle: string; turnstileBody: string; authTitle: string; authBody: string };
    joined: { title: string; body: string };
    notJoined: { title: string; body: string; cta: string };
    perks: Point[];
  };
  footer: { note: string };
};

export type SponsorLogo = {
  id: number;
  name: string;
  logo_url: string;
  href: string | null;
  invert: boolean;
  brightness: number;
  sort_order: number;
};

// ─────────────────────────────────────────────────────────────────────────────

export const defaultSiteContent: SiteContent = {
  home: {
    hero: {
      eyebrow: "WEARABLE INTERFACE FOR SOLANA",
      headline: "WEAR IT.\nTAP IT.\nIT'S SIGNED.",
      subheadline:
        "SOLWEAR IS A WEARABLE YOU ACTUALLY WANT TO PUT ON — AND THE FASTEST WAY TO APPROVE A SOLANA TRANSACTION. THE KEY STAYS ON YOUR WRIST.",
      primaryCta: "JOIN WAITLIST",
      secondaryCta: "SEE THE DEVICE",
      capabilities: ["NFC", "ON-DEVICE SIGNING", "SOLANA PAY", "BLINKS"],
      image: "/watch-mk1.png",
      imageAlt: "SolWear MK1 prototype: a transparent wearable with a monochrome display and clear strap",
    },
    proof: {
      label: "WHERE WE'VE BEEN",
      note: "TECHNOLOGY WE BUILD ON IS LISTED AS A STACK, NOT AS A PARTNERSHIP.",
    },
    problem: {
      label: "01 — THE PROBLEM",
      headline: "CRYPTO STILL DOESN'T FEEL LIKE EVERYDAY TECHNOLOGY.",
      body: "EVERY OTHER PIECE OF TECH ON YOUR BODY DISAPPEARED INTO YOUR LIFE. CRYPTO DIDN'T.",
      points: [
        {
          title: "IT LIVES IN AN APP",
          text: "PAYING MEANS UNLOCKING A PHONE, FINDING A WALLET, SCANNING A CODE, THEN CONFIRMING. FOUR STEPS TOO MANY.",
        },
        {
          title: "SECURITY IS A CHORE",
          text: "THE SAFE OPTION IS A DEVICE IN A DRAWER. SO PEOPLE USE THE FAST OPTION AND KEEP THE KEY ON THE PHONE.",
        },
        {
          title: "NOTHING IS WEARABLE",
          text: "NO ONE HAS BUILT SOMETHING YOU WEAR ALL DAY THAT SPEAKS SOLANA NATIVELY.",
        },
      ],
    },
    solution: {
      label: "02 — THE SOLUTION",
      headline: "A DEVICE ON YOUR WRIST THAT SPEAKS SOLANA.",
      body: "SOLWEAR PUTS THE SIGNING KEY ON YOUR BODY AND THE ACTION ONE TAP AWAY. THE PHONE STAYS USEFUL — IT JUST STOPS BEING THE VAULT.",
      points: [
        {
          title: "TAP INSTEAD OF SCAN",
          text: "NFC STARTS THE ACTION. NO QR CODE, NO APP SWITCHING, NO COPY-PASTED ADDRESS.",
        },
        {
          title: "APPROVE ON YOUR WRIST",
          text: "THE TRANSACTION IS SIGNED ON THE DEVICE AFTER YOU PHYSICALLY CONFIRM IT.",
        },
        {
          title: "BUILT TO BE WORN",
          text: "A 240×240 DISPLAY, FOUR BUTTONS, A STRAP. SOMETHING YOU PUT ON IN THE MORNING.",
        },
      ],
    },
    benefits: {
      label: "03 — WHY IT MATTERS",
      headline: "WHAT YOU ACTUALLY GET.",
      items: [
        {
          title: "PAYMENTS THAT TAKE ONE SECOND",
          text: "TAP, CHECK THE AMOUNT, CONFIRM. FAST ENOUGH TO USE AT A COUNTER WITHOUT HOLDING UP THE LINE.",
        },
        {
          title: "YOUR KEY IS NOT ON YOUR PHONE",
          text: "KEYS ARE GENERATED ON THE DEVICE AND STORED ENCRYPTED. SIGNING HAPPENS THERE AND NOWHERE ELSE.",
        },
        {
          title: "PHONE-OPTIONAL BY DESIGN",
          text: "THE PHONE HELPS WHEN IT'S THERE. THE ARCHITECTURE DOESN'T ASSUME IT ALWAYS IS.",
        },
        {
          title: "A PLATFORM, NOT A GADGET",
          text: "THE DEVICE IS THE FIRST REFERENCE HARDWARE FOR AN OS AND SDK OTHERS CAN BUILD ON.",
        },
      ],
    },
    howItWorks: {
      label: "04 — HOW IT WORKS",
      headline: "THREE STEPS. NOTHING HIDDEN.",
      steps: [
        { step: "01", title: "TAP", text: "HOLD SOLWEAR TO A PHONE OR NFC SURFACE. THE ACTION IS READ OVER NFC." },
        { step: "02", title: "REVIEW", text: "AMOUNT, RECIPIENT AND ACTION ARE SHOWN BEFORE ANYTHING IS SIGNED." },
        { step: "03", title: "APPROVE", text: "YOU PRESS THE BUTTON. THE DEVICE SIGNS. THE KEY NEVER LEAVES." },
      ],
    },
    device: {
      label: "05 — THE DEVICE",
      headline: "SOLWEAR MK1",
      body: "THE FIRST REFERENCE DEVICE. A WORKING PROTOTYPE THAT SIGNS REAL SOLANA TRANSACTIONS OVER NFC TODAY.",
      image: "/watch-mk1.png",
      imageAlt: "SolWear MK1 prototype, three-quarter view",
      specs: [
        { label: "PROCESSOR", value: "ESP32-S3" },
        { label: "DISPLAY", value: "240×240 IPS" },
        { label: "WIRELESS", value: "NFC · BLE · WI-FI" },
        { label: "SIGNING", value: "ED25519 ON-DEVICE" },
      ],
      cta: "EXPLORE THE DEVICE",
    },
    ecosystem: {
      label: "06 — THE ECOSYSTEM",
      headline: "THE DEVICE IS THE ENTRY POINT.",
      body: "HARDWARE ALONE IS A PRODUCT. HARDWARE PLUS AN OS, AN SDK AND DEVELOPERS IS A CATEGORY. HERE IS EXACTLY WHERE EACH LAYER STANDS.",
      layers: [
        { title: "SOLWEAR MK1", text: "THE REFERENCE WEARABLE. WORKING PROTOTYPE.", status: "IN DEVELOPMENT" },
        { title: "SOLWEAR OS", text: "THE FIRMWARE LAYER RUNNING ON THE DEVICE.", status: "IN DEVELOPMENT" },
        { title: "SOLWEAR SDK", text: "TOOLS FOR BUILDING WEARABLE SOLANA EXPERIENCES.", status: "PLANNED" },
        { title: "APP ECOSYSTEM", text: "THIRD-PARTY EXPERIENCES BUILT BY DEVELOPERS.", status: "PLANNED" },
      ],
      cta: "SEE THE FULL PLAN",
    },
    waitlist: {
      headline: "BE FIRST ON THE WRIST.",
      body: "EARLY ACCESS, BUILD UPDATES AND HARDWARE DROPS. ONE EMAIL, NO NOISE.",
      cta: "JOIN WAITLIST",
      note: "WE EMAIL ABOUT SOLWEAR. NOTHING ELSE. UNSUBSCRIBE ANY TIME.",
    },
  },

  product: {
    hero: {
      eyebrow: "REFERENCE DEVICE 01",
      headline: "SOLWEAR MK1",
      subheadline:
        "A WEARABLE SOLANA SIGNER YOU CAN PUT ON YOUR WRIST TODAY. WORKING PROTOTYPE, HONEST SPECS, NOTHING PRETENDED.",
      image: "/watch-mk1.png",
      imageAlt: "SolWear MK1 prototype, three-quarter view showing the transparent case and clear strap",
    },
    why: {
      label: "WHY IT EXISTS",
      headline: "BECAUSE THE SAFEST WALLET IS THE ONE YOU ACTUALLY USE.",
      body: "A HARDWARE WALLET IN A DRAWER PROTECTS NOTHING DURING A PAYMENT. MK1 STARTS FROM THE OPPOSITE END: SOMETHING ALWAYS ON YOU, FAST ENOUGH FOR DAILY USE, WITH THE KEY STILL OFF YOUR PHONE.",
      points: [
        { title: "ALWAYS ON YOU", text: "A WEARABLE IS THE ONLY FORM FACTOR THAT'S PRESENT AT THE MOMENT OF PAYMENT." },
        { title: "PHYSICAL CONFIRMATION", text: "SIGNING NEEDS A BUTTON PRESS ON THE DEVICE. SOFTWARE ALONE CANNOT APPROVE." },
        { title: "SEPARATE FROM THE PHONE", text: "A COMPROMISED PHONE CAN SHOW YOU A LIE, BUT IT CANNOT SIGN FOR YOU." },
      ],
      image: "/watch-mk1-wrist.png",
      imageAlt: "SolWear MK1 worn on a wrist, showing the display in daylight",
    },
    design: {
      label: "DESIGN",
      headline: "ENGINEERED TO BE WORN, NOT DEMONSTRATED.",
      body: "MK1 IS A PROTOTYPE, AND IT LOOKS LIKE ENGINEERING RATHER THAN JEWELLERY. THE INDUSTRIAL DESIGN IS STILL MOVING — WHAT'S FIXED IS THE INTERACTION MODEL.",
      details: [
        { title: "DISPLAY", text: "240×240 IPS PANEL. BRIGHT ENOUGH TO READ AN AMOUNT OUTDOORS." },
        { title: "CONTROLS", text: "FOUR TACTILE BUTTONS. APPROVAL IS ALWAYS A DELIBERATE PHYSICAL ACT." },
        { title: "NFC ANTENNA", text: "PLACED FOR A NATURAL WRIST-TO-SURFACE TAP, NOT A CAREFUL ALIGNMENT RITUAL." },
        { title: "POWER", text: "350 MAH CELL WITH USB-C CHARGING. SIZED FOR A DAY OF NORMAL USE." },
      ],
      image: "/watch-mk1-angle.png",
      imageAlt: "SolWear MK1 seen from a second angle, showing the case sides and strap fixing",
    },
    howItWorks: {
      label: "HOW IT WORKS",
      headline: "TAP. REVIEW. APPROVE.",
      steps: [
        { step: "01", title: "TAP", text: "NFC CARRIES THE TRANSACTION TO THE DEVICE OVER NDEF." },
        { step: "02", title: "REVIEW", text: "THE DEVICE AND THE COMPANION APP SHOW WHAT IS ABOUT TO BE SIGNED." },
        { step: "03", title: "APPROVE", text: "A BUTTON PRESS TRIGGERS ED25519 SIGNING ON THE DEVICE." },
        { step: "04", title: "BROADCAST", text: "THE SIGNED TRANSACTION GOES BACK OVER NFC AND IS SUBMITTED TO SOLANA." },
      ],
    },
    technology: {
      label: "TECHNOLOGY",
      headline: "WHAT IS REAL TODAY, AND WHAT IS NOT.",
      body: "THIS LIST MATCHES THE FIRMWARE. IF SOMETHING IS NOT IMPLEMENTED YET, IT SAYS SO.",
      items: [
        { title: "ED25519 SIGNING ON-DEVICE", text: "TRANSACTIONS ARE SIGNED ON THE ESP32-S3 USING MBEDTLS. THE SEED IS NEVER EXPORTED.", status: "AVAILABLE" },
        { title: "ENCRYPTED KEY STORAGE", text: "THE SEED IS STORED AES-256 ENCRYPTED UNDER A PBKDF2-DERIVED KEY FROM YOUR PASSPHRASE.", status: "AVAILABLE" },
        { title: "HARDWARE RANDOM NUMBER GENERATION", text: "KEYS ARE GENERATED ON-DEVICE FROM THE HARDWARE RNG.", status: "AVAILABLE" },
        { title: "NFC TRANSACTION TRANSPORT", text: "A PN532 MODULE CARRIES TRANSACTIONS OVER NDEF TO THE ANDROID COMPANION APP.", status: "AVAILABLE" },
        { title: "SECURE BOOT AND FLASH ENCRYPTION", text: "SUPPORTED BY THE ESP32-S3 AND ON THE ROADMAP. NOT ENABLED IN THE CURRENT PROTOTYPE BUILD.", status: "PLANNED" },
        { title: "DEDICATED SECURE ELEMENT", text: "A SECURE ELEMENT CAPABLE OF ED25519 IS BEING EVALUATED FOR PRODUCTION HARDWARE.", status: "PLANNED" },
        { title: "SOLANA PAY AND BLINKS FLOWS", text: "NFC-TRIGGERED PAYMENT AND ACTION FLOWS ARE BEING BUILT ON TOP OF THE SIGNING LAYER.", status: "IN DEVELOPMENT" },
      ],
    },
    specs: {
      label: "SPECIFICATIONS",
      headline: "PROTOTYPE SPECIFICATIONS",
      note: "MK1 IS PROTOTYPE HARDWARE. SPECIFICATIONS WILL CHANGE BEFORE PRODUCTION.",
      groups: [
        {
          name: "COMPUTE",
          specs: [
            { label: "MCU", value: "ESP32-S3" },
            { label: "FIRMWARE", value: "SOLWEAR OS (ESP-IDF, C)" },
            { label: "STORAGE", value: "NVS FOR KEY MATERIAL, SPIFFS FOR STATE" },
          ],
        },
        {
          name: "INTERFACE",
          specs: [
            { label: "DISPLAY", value: "ST7789 240×240 IPS OVER SPI" },
            { label: "INPUT", value: "4 TACTILE BUTTONS" },
          ],
        },
        {
          name: "CONNECTIVITY",
          specs: [
            { label: "NFC", value: "PN532 OVER I2C" },
            { label: "WIRELESS", value: "BLE AND WI-FI (ESP32-S3 RADIO)" },
            { label: "COMPANION", value: "ANDROID APP OVER NFC / NDEF" },
          ],
        },
        {
          name: "POWER",
          specs: [
            { label: "BATTERY", value: "350 MAH LIPO" },
            { label: "CHARGING", value: "TP4056 LINEAR CHARGER" },
          ],
        },
        {
          name: "SECURITY",
          specs: [
            { label: "SIGNING", value: "ED25519 (RFC 8032) ON-DEVICE" },
            { label: "KEY STORAGE", value: "AES-256-CBC, PBKDF2-HMAC-SHA256" },
            { label: "ENTROPY", value: "HARDWARE RNG" },
            { label: "SECURE ELEMENT", value: "NOT IN MK1 — PLANNED FOR PRODUCTION" },
          ],
        },
      ],
    },
    next: {
      label: "WHAT'S NEXT",
      headline: "THE PATH FROM PROTOTYPE TO PRODUCT.",
      body: "WE'D RATHER SHOW YOU THE REAL SEQUENCE THAN A ROADMAP FULL OF QUARTERS WE CAN'T PROMISE.",
      items: [
        { title: "SOLANA PAY MERCHANT FLOW", text: "END-TO-END TAP-TO-PAY AT A REAL COUNTER.", status: "IN DEVELOPMENT" },
        { title: "SPENDING LIMITS", text: "ON-DEVICE DAILY CAPS SO A LOST DEVICE IS A SMALL PROBLEM.", status: "PLANNED" },
        { title: "BACKUP AND RECOVERY", text: "LOSING THE DEVICE MUST NOT MEAN LOSING ACCESS.", status: "PLANNED" },
        { title: "HARDENED FIRMWARE BUILD", text: "SECURE BOOT AND FLASH ENCRYPTION ENABLED, THEN INDEPENDENTLY REVIEWED.", status: "PLANNED" },
        { title: "PRODUCTION INDUSTRIAL DESIGN", text: "A CASE AND STRAP MADE TO BE WORN EVERY DAY.", status: "PLANNED" },
      ],
    },
  },

  ecosystem: {
    hero: {
      eyebrow: "THE LONG GAME",
      headline: "ONE DEVICE IS A PRODUCT.\nA PLATFORM IS A CATEGORY.",
      subheadline:
        "SOLWEAR MK1 IS THE REFERENCE HARDWARE. THE REAL TARGET IS A WEARABLE LAYER THE SOLANA ECOSYSTEM CAN BUILD ON. NONE OF THIS SHIPS YET — HERE IS EXACTLY WHERE IT STANDS.",
    },
    stack: {
      label: "THE STACK",
      headline: "FIVE LAYERS. HONEST STATUS ON EACH.",
      body: "EVERY LAYER BELOW IS TAGGED WITH WHAT IT ACTUALLY IS TODAY.",
      layers: [
        { title: "DEVICE", text: "SOLWEAR MK1. WORKING PROTOTYPE THAT SIGNS REAL TRANSACTIONS OVER NFC.", status: "IN DEVELOPMENT" },
        { title: "SOLWEAR OS", text: "THE FIRMWARE: WALLET, NFC STACK, DISPLAY, INPUT AND THE SIGNING PATH.", status: "IN DEVELOPMENT" },
        { title: "SOLWEAR SDK", text: "A LIBRARY FOR REQUESTING SIGNATURES, ACTIONS AND IDENTITY FROM A SOLWEAR DEVICE.", status: "PLANNED" },
        { title: "DEVELOPER PORTAL", text: "DOCUMENTATION, AN EMULATOR AND WORKING EXAMPLES SO YOU CAN BUILD WITHOUT HARDWARE.", status: "PLANNED" },
        { title: "APPLICATIONS", text: "THIRD-PARTY WEARABLE EXPERIENCES RUNNING AGAINST THE SDK.", status: "PLANNED" },
      ],
    },
    integrations: {
      label: "PROTOCOL INTEGRATIONS",
      headline: "WHAT THE WEARABLE CAN SPEAK.",
      body: "SOLANA-NATIVE PRIMITIVES THE DEVICE PLUGS INTO, AND HOW FAR EACH ONE HAS ACTUALLY GOT.",
      items: [
        { title: "TRANSACTION SIGNING", text: "ED25519 SIGNING OF SOLANA TRANSACTIONS ON-DEVICE.", status: "AVAILABLE" },
        { title: "NFC INTERACTIONS", text: "NDEF TRANSPORT BETWEEN THE DEVICE AND AN ANDROID COMPANION APP.", status: "AVAILABLE" },
        { title: "SOLANA PAY", text: "MERCHANT PAYMENT REQUESTS APPROVED FROM THE WRIST.", status: "IN DEVELOPMENT" },
        { title: "BLINKS AND ACTIONS", text: "PHYSICAL SURFACES THAT TRIGGER ON-CHAIN ACTIONS ON TAP.", status: "IN DEVELOPMENT" },
        { title: "WEARABLE IDENTITY", text: "PROVING WHO YOU ARE AT A DOOR, A DESK OR AN EVENT.", status: "PLANNED" },
        { title: "NOTIFICATIONS", text: "ON-CHAIN EVENTS SURFACED ON THE WRIST.", status: "PLANNED" },
        { title: "LOYALTY AND ACCESS", text: "CHECK-INS, GATED DROPS AND MEMBERSHIP HELD ON THE DEVICE.", status: "PLANNED" },
        { title: "DEPIN INTERACTIONS", text: "WEARABLE PARTICIPATION IN PHYSICAL INFRASTRUCTURE NETWORKS.", status: "PLANNED" },
      ],
    },
    developers: {
      label: "FOR DEVELOPERS",
      headline: "WE'RE BUILDING THE THING YOU BUILD ON.",
      body: "THE SDK AND PORTAL DO NOT EXIST YET. IF YOU WANT TO SHAPE THEM, THIS IS THE RIGHT MOMENT TO TALK TO US.",
      points: [
        { title: "REQUEST A SIGNATURE", text: "ASK A NEARBY SOLWEAR TO SIGN A TRANSACTION AND GET THE SIGNATURE BACK." },
        { title: "TRIGGER AN ACTION", text: "BIND AN NFC SURFACE TO AN ON-CHAIN ACTION THE WEARER CONFIRMS PHYSICALLY." },
        { title: "READ IDENTITY", text: "VERIFY A WEARER'S PUBLIC KEY WITHOUT TOUCHING THEIR PRIVATE KEY." },
        { title: "BUILD WITHOUT HARDWARE", text: "AN EMULATOR SO YOU CAN SHIP BEFORE A DEVICE ARRIVES." },
      ],
    },
    apps: {
      label: "FUTURE APPLICATIONS",
      headline: "WHAT PEOPLE COULD BUILD.",
      body: "EXAMPLES, NOT COMMITMENTS. NONE OF THESE EXIST TODAY.",
      ideas: [
        { title: "TAP-TO-PAY AT A COUNTER", text: "MERCHANT TERMINALS THAT ACCEPT A WRIST INSTEAD OF A CARD." },
        { title: "EVENT ACCESS", text: "TICKETS AND CHECK-INS THAT LIVE ON THE DEVICE." },
        { title: "PROOF OF PRESENCE", text: "SIGNED ATTESTATION THAT YOU WERE SOMEWHERE, AT A TIME." },
        { title: "TEAM AND OFFICE ACCESS", text: "DOORS AND MACHINES THAT TRUST A SOLANA KEY ON YOUR WRIST." },
      ],
    },
  },

  community: {
    hero: {
      eyebrow: "COMMUNITY",
      headline: "THE PEOPLE WHO GET IT FIRST.",
      subheadline:
        "EARLY USERS, BUILDERS AND DEVELOPERS SHAPING WHAT SOLWEAR BECOMES. VERIFY YOU'RE HUMAN, SIGN IN WITH X, AND YOU'RE IN.",
    },
    gate: {
      turnstileTitle: "STEP 01 — VERIFY",
      turnstileBody: "A QUICK CHECK THAT YOU'RE A PERSON. NOTHING IS STORED.",
      authTitle: "STEP 02 — SIGN IN WITH X",
      authBody: "WE USE YOUR X ACCOUNT AS YOUR IDENTITY. WE NEVER POST ON YOUR BEHALF.",
    },
    joined: {
      title: "YOU'RE ON THE LIST",
      body: "YOU'RE IN THE COMMUNITY AND ON THE WAITLIST. WE'LL EMAIL YOU BEFORE ANYONE ELSE HEARS ANYTHING.",
    },
    notJoined: {
      title: "JOIN THE SOLWEAR WAITLIST",
      body: "YOU'RE SIGNED IN. ADD AN EMAIL AND WE'LL LINK IT TO YOUR X ACCOUNT — NO SECOND ACCOUNT, NO DUPLICATE.",
      cta: "JOIN WAITLIST",
    },
    perks: [
      { title: "EARLY ACCESS", text: "FIRST HARDWARE DROPS GO TO THIS LIST BEFORE ANYWHERE ELSE." },
      { title: "BUILD UPDATES", text: "WHAT SHIPPED, WHAT BROKE, WHAT'S NEXT — WITHOUT THE MARKETING FILTER." },
      { title: "DIRECT INPUT", text: "POST WHAT YOU WANT SOLWEAR TO DO. WE READ ALL OF IT." },
      { title: "BUILDER ACCESS", text: "DEVELOPERS HERE GET THE SDK FIRST WHEN IT'S READY." },
    ],
  },

  footer: { note: "BUILT IN UKRAINE FOR THE SOLANA ECOSYSTEM." },
};

export const defaultSponsors: SponsorLogo[] = [];
