export type HeroVideo = {
  youtubeUrl: string;
  title: string;
  body: string;
};

export type SiteContent = {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryButton: string;
    secondaryButton: string;
    badges: string[];
    sideTitle: string;
    sideLines: string[];
    video: HeroVideo;
    pitchVideo: HeroVideo;
  };
  sections: {
    problem: CopySection;
    solution: CopySection;
    value: CopySection;
    security: CopySection & {
      noteTitle: string;
      noteBody: string[];
      noteStrong: string;
    };
    useCases: CardsOnlySection;
    whyWrist: CopySection;
    comparison: {
      headline: string;
      columns: string[];
      rows: string[][];
      body: string[];
    };
    productFeatures: FeatureListSection;
    roadmap: {
      headline: string;
      phases: Array<{ title: string; items: string[] }>;
    };
    developer: CopySection;
    sponsors: {
      headline: string;
      body: string;
    };
    finalCta: {
      headline: string;
      body: string[];
      primaryButton: string;
      secondaryButton: string;
      footerLine: string;
    };
  };
  links: {
    waitlistHref: string;
    demoHref: string;
    pitchHref: string;
    xHref: string;
  };
};

export type CopyCard = {
  title: string;
  text: string;
};

export type CopySection = {
  headline: string;
  body: string[];
  cards: CopyCard[];
};

export type CardsOnlySection = {
  headline: string;
  cards: CopyCard[];
};

export type FeatureListSection = {
  headline: string;
  features: CopyCard[];
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

export const defaultSiteContent: SiteContent = {
  hero: {
    eyebrow: "Wearable Solana signer",
    headline: "Hardware-wallet security.\nHot-wallet speed.\nOn your wrist.",
    subheadline:
      "SolWear is a wearable Solana payment signer that lets you approve everyday crypto transactions from your wrist - while keeping your private key off your phone.",
    primaryButton: "Join waitlist",
    secondaryButton: "Watch demo",
    badges: ["Solana Pay", "Blinks", "NFC", "On-device signing"],
    sideTitle: "Tap. Review. Approve.",
    sideLines: [
      "Your phone prepares the transaction.",
      "SolWear signs it on your wrist.",
      "Your private key never leaves the device.",
    ],
    video: {
      youtubeUrl: "",
      title: "Watch demo",
      body: "Add a YouTube demo from the admin panel.",
    },
    pitchVideo: {
      youtubeUrl: "",
      title: "Pitch video",
      body: "Add a YouTube pitch video from the admin panel.",
    },
  },
  sections: {
    problem: {
      headline: "Crypto payments are still stuck between unsafe and inconvenient.",
      body: [
        "Hot wallets are fast, but they put too much trust in your phone.",
        "Hardware wallets are safer, but they are too slow and awkward for daily payments.",
        "SolWear removes that tradeoff.",
      ],
      cards: [
        {
          title: "Hot wallets are convenient",
          text: "But if your phone or wallet app is compromised, your signing flow is exposed.",
        },
        {
          title: "Hardware wallets are secure",
          text: "But nobody wants to pull out a USB device just to approve a small payment.",
        },
        {
          title: "Daily crypto needs a new form factor",
          text: "A signer that is always with you, fast to approve, and separate from your phone.",
        },
      ],
    },
    solution: {
      headline: "SolWear turns your wrist into a Solana approval layer.",
      body: [
        "Your phone can show balances, connect to apps, and broadcast transactions.",
        "SolWear keeps the signing key separate and confirms the final action physically.",
      ],
      cards: [
        {
          title: "Tap to start",
          text: "Use NFC to interact with Solana Pay, Blinks, event check-ins, loyalty flows, or the companion app.",
        },
        {
          title: "Review on phone",
          text: "See the amount, recipient, action, and transaction details before approval.",
        },
        {
          title: "Approve on wrist",
          text: "SolWear signs only after physical confirmation. The signed transaction goes back to the phone for broadcast.",
        },
      ],
    },
    value: {
      headline: "The convenience of a hot wallet.\nThe separation of a hardware wallet.",
      body: [
        "SolWear keeps the most sensitive part of the wallet experience - signing - away from the phone. You still get a smooth mobile UX, but the private key stays on the wearable.",
      ],
      cards: [
        {
          title: "Keys stay off your phone",
          text: "Private keys are generated and stored on the device, not inside your mobile wallet.",
        },
        {
          title: "Physical approval",
          text: "Transactions require wrist-side confirmation, so signing becomes an intentional action.",
        },
        {
          title: "Made for small daily payments",
          text: "Use SolWear as a limited daily spending wallet while keeping your main funds elsewhere.",
        },
        {
          title: "Built for Solana-native flows",
          text: "Designed for Solana Pay, Blinks, mobile dApps, events, loyalty, and everyday USDC payments.",
        },
      ],
    },
    security: {
      headline: "Security model: simple, honest, physical.",
      body: [
        "SolWear is built around one idea: your phone should not be the final source of trust.",
        "The phone can be the screen.",
        "The phone can be the network.",
        "The phone can be the interface.",
        "But the signing key should live somewhere else.",
      ],
      cards: [
        {
          title: "On-device signing",
          text: "SolWear signs transactions locally. The private key is not exported to the phone.",
        },
        {
          title: "Encrypted key storage",
          text: "The key is encrypted at rest using device-side secrets and user authentication.",
        },
        {
          title: "Phone as relay, not vault",
          text: "The phone prepares and broadcasts transactions, but does not hold the signing key.",
        },
        {
          title: "Spending limits",
          text: "Daily limits and payment thresholds help reduce the risk of accidental or malicious approvals.",
        },
        {
          title: "Production security path",
          text: "Future versions are designed to add a dedicated secure element for stronger physical attack resistance.",
        },
      ],
      noteTitle: "Phone-optional.",
      noteBody: [
        "SolWear works with a phone when that gives the best user experience. The phone handles the screen, apps, balances, and internet connection.",
      ],
      noteStrong: "The difference is simple: the phone does not hold the signing key.",
    },
    useCases: {
      headline: "Built for moments where a normal hardware wallet makes no sense.",
      cards: [
        {
          title: "Solana Pay at events",
          text: "Pay for merch, food, tickets, or access with a quick wrist approval.",
        },
        {
          title: "Blinks in the real world",
          text: "Tap an NFC tag or phone and trigger a Solana action from your wrist.",
        },
        {
          title: "Crypto-native communities",
          text: "Use SolWear for check-ins, loyalty, gated drops, and on-chain identity moments.",
        },
        {
          title: "Daily spending wallet",
          text: "Keep a limited balance on SolWear for everyday transactions while your main funds stay elsewhere.",
        },
        {
          title: "Creator and merchant payments",
          text: "Let people tap to pay, tip, claim, or interact without scanning QR codes manually.",
        },
      ],
    },
    whyWrist: {
      headline: "A wallet that does not look like a wallet.",
      body: [
        "Most hardware wallets live in drawers, bags, or pockets.",
        "SolWear lives on your wrist.",
        "That makes it faster for real-world payments, harder to forget, and more natural for events, stores, conferences, and community spaces.",
      ],
      cards: [
        {
          title: "Always with you",
          text: "No cable. No digging through your bag. No awkward payment flow.",
        },
        {
          title: "Social by default",
          text: "People can see it, tap it, ask about it, and interact with it.",
        },
        {
          title: "Built for movement",
          text: "Payments, check-ins, rewards, and identity should work while you are walking around - not only at a desk.",
        },
      ],
    },
    comparison: {
      headline: "Not a card. Not a phone wallet. Not a normal smartwatch.",
      columns: ["Product", "Fast daily payments", "Key off phone", "Wrist-worn", "Solana-native"],
      rows: [
        ["Hot wallet", "Yes", "No", "No", "Yes"],
        ["Hardware wallet", "No", "Yes", "No", "Sometimes"],
        ["NFC card wallet", "Yes", "Yes", "No", "Sometimes"],
        ["Smartwatch", "Yes", "No", "Yes", "No"],
        ["SolWear", "Yes", "Yes", "Yes", "Yes"],
      ],
      body: [
        "SolWear is not trying to beat Ledger at cold storage or Apple Watch at fitness.",
        "It creates a new category: a wrist-worn Solana signer for everyday crypto actions.",
      ],
    },
    productFeatures: {
      headline: "What SolWear does",
      features: [
        {
          title: "Tap-to-sign flow",
          text: "Start a payment or wallet action with NFC.",
        },
        {
          title: "Wrist approval",
          text: "Confirm the transaction physically from the wearable.",
        },
        {
          title: "Mobile companion app",
          text: "View balance, transaction details, spending limits, and device status.",
        },
        {
          title: "Solana Pay support",
          text: "Designed for USDC and SOL payments through Solana-native payment flows.",
        },
        {
          title: "Blinks support",
          text: "Trigger on-chain actions from NFC tags, links, and real-world surfaces.",
        },
        {
          title: "Secure daily wallet mode",
          text: "Keep a limited balance for daily use instead of exposing your main wallet.",
        },
        {
          title: "Recovery flow",
          text: "Planned backup and recovery system so losing the device does not mean losing access.",
        },
      ],
    },
    roadmap: {
      headline: "Roadmap",
      phases: [
        {
          title: "V1 - Prototype",
          items: [
            "NFC tap flow",
            "On-device signing demo",
            "Mobile companion app",
            "Solana transaction approval",
            "Basic encrypted key storage",
          ],
        },
        {
          title: "V2 - Payment beta",
          items: [
            "Solana Pay merchant flow",
            "Blinks support",
            "Spending limits",
            "Better transaction preview",
            "Recovery setup",
          ],
        },
        {
          title: "V3 - Production security",
          items: [
            "Secure element integration",
            "Improved tamper resistance",
            "Strap/on-body confirmation signals",
            "Audited firmware",
            "Developer SDK",
          ],
        },
      ],
    },
    developer: {
      headline: "For builders",
      body: [
        "SolWear is a hardware signing layer for Solana mobile experiences.",
        "Developers can use it for payments, NFC-triggered actions, event access, loyalty, identity, and real-world Blinks.",
      ],
      cards: [
        {
          title: "Solana Pay",
          text: "Let users approve merchant payments from the wrist.",
        },
        {
          title: "Blinks",
          text: "Turn physical surfaces into on-chain actions.",
        },
        {
          title: "Mobile Wallet Adapter",
          text: "Connect SolWear to the Solana mobile ecosystem.",
        },
        {
          title: "NFC actions",
          text: "Use tap-based flows for events, products, and community experiences.",
        },
      ],
    },
    sponsors: {
      headline: "Ecosystem support",
      body: "Partners, sponsors, and Solana ecosystem projects supporting the build.",
    },
    finalCta: {
      headline: "Bring Solana payments to the wrist.",
      body: [
        "SolWear is for people who want crypto payments to feel instant - without trusting every approval to a phone.",
        "Join the waitlist and follow the build as we turn the prototype into a real product.",
      ],
      primaryButton: "Join waitlist",
      secondaryButton: "Follow on X",
      footerLine: "Built in Ukraine for the Solana ecosystem.",
    },
  },
  links: {
    waitlistHref: "#waitlist",
    demoHref: "#demo",
    pitchHref: "/pitch/",
    xHref: "https://x.com/SolWear_",
  },
};

export const defaultSponsors: SponsorLogo[] = [
  {
    id: 1,
    name: "SuperTeam Ukraine",
    logo_url: "https://superteam.fun/static/logo-light.svg",
    href: "https://superteam.fun/ukraine",
    invert: false,
    brightness: 1.0,
    sort_order: 10,
  },
];
