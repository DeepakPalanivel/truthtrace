import { v4 as uuidv4 } from 'uuid';
import type { NewsAnalysis } from '../types/index';

export function getDemoAnalysis(caseNumber: 1 | 2 | 3): NewsAnalysis {
  const cases: Record<number, NewsAnalysis> = {
    1: buildCase1(),
    2: buildCase2(),
    3: buildCase3(),
  };
  return cases[caseNumber] || buildCase1();
}

// ─── Case 1: Likely False — Fabricated Government Benefit ─────────────────────
function buildCase1(): NewsAnalysis {
  const id = uuidv4();
  const claimId1 = uuidv4();
  const claimId2 = uuidv4();
  const claimId3 = uuidv4();

  return {
    id,
    inputText:
      'BREAKING: Government announces ₹50,000 direct benefit for EVERY Indian citizen! PM Modi signs order today. Money will be deposited directly to your Aadhaar-linked bank account within 48 hours. Share immediately before they delete this!!',
    headline: 'Government announces ₹50,000 direct benefit for every Indian citizen',
    truthScore: {
      overall: 12,
      verdict: 'LIKELY_FALSE',
      factors: [
        { name: 'Claim Evidence', weight: 35, score: 5, contribution: 1.75, explanation: 'No credible sources corroborate the core claims' },
        { name: 'Source Credibility', weight: 20, score: 10, contribution: 2, explanation: 'No identifiable original publisher; viral chain post' },
        { name: 'Cross-Source Agreement', weight: 20, score: 8, contribution: 1.6, explanation: 'Official government sources actively deny this claim' },
        { name: 'Context Consistency', weight: 15, score: 15, contribution: 2.25, explanation: 'Urgency framing inconsistent with official government communication' },
        { name: 'Language Manipulation', weight: 10, score: 5, contribution: 0.5, explanation: 'High-manipulation language patterns detected' },
      ],
      explanation: [
        'The main claim (₹50,000 for every citizen) could not be verified in any official government source.',
        'PIB Fact Check and multiple government portals have flagged similar claims as false.',
        'The text uses classic viral misinformation patterns: urgency ("48 hours"), suppression fear ("before they delete this"), and CAPS formatting.',
        'No official press release or government order matching this description exists.',
        'The publisher of the original claim is unidentifiable.',
      ],
    },
    claims: [
      {
        id: claimId1,
        analysisId: id,
        claimText: 'Government announced a ₹50,000 direct cash benefit for every Indian citizen',
        verdict: 'LIKELY_FALSE',
        confidence: 91,
        explanation:
          'No official announcement from Ministry of Finance, PMO, or any government body matches this claim. Official PIB sources have denied similar claims.',
        supportingEvidence: [],
        contradictingEvidence: [
          {
            id: uuidv4(),
            claimId: claimId1,
            sourceTitle: 'PIB Fact Check: No such scheme announced',
            publisher: 'Press Information Bureau (Demo Reference)',
            publisherUrl: 'https://pib.gov.in',
            publicationDate: '2026-09-10',
            url: 'https://pib.gov.in/factcheck',
            excerpt:
              'No government scheme providing ₹50,000 to every citizen has been announced. This message is misleading.',
            relevance: 'CONTRADICTING',
            explanation: 'Official government fact-checking body directly contradicts the claim.',
            isDemo: true,
          },
          {
            id: uuidv4(),
            claimId: claimId1,
            sourceTitle: 'Multiple similar viral claims debunked in 2024–2026',
            publisher: 'Alt News (Demo Reference)',
            publisherUrl: 'https://altnews.in',
            publicationDate: '2026-08-15',
            url: 'https://altnews.in/fact-check',
            excerpt: 'This pattern of "government benefit" viral messages has been repeatedly identified as misinformation.',
            relevance: 'CONTRADICTING',
            explanation: 'Established fact-checking outlet has documented identical claim patterns.',
            isDemo: true,
          },
        ],
      },
      {
        id: claimId2,
        analysisId: id,
        claimText: 'PM Modi personally signed an order for this benefit today',
        verdict: 'LIKELY_FALSE',
        confidence: 88,
        explanation: 'No government gazette notification, press release, or official record of such an order exists for the claimed date.',
        supportingEvidence: [],
        contradictingEvidence: [
          {
            id: uuidv4(),
            claimId: claimId2,
            sourceTitle: 'PMO Official Communications Log (Demo Reference)',
            publisher: 'PMO India',
            publisherUrl: 'https://pmo.gov.in',
            publicationDate: '2026-09-15',
            url: 'https://pmo.gov.in/press',
            excerpt: 'No such executive order appears in official PMO communications for September 2026.',
            relevance: 'CONTRADICTING',
            explanation: 'Absence of any official record from the Prime Minister\'s Office.',
            isDemo: true,
          },
        ],
      },
      {
        id: claimId3,
        analysisId: id,
        claimText: 'Money will be deposited to Aadhaar-linked accounts within 48 hours',
        verdict: 'MISLEADING',
        confidence: 85,
        explanation:
          'Even legitimate government DBT schemes take weeks to months to process. The "48 hours" claim creates false urgency typical of scam communications.',
        supportingEvidence: [],
        contradictingEvidence: [
          {
            id: uuidv4(),
            claimId: claimId3,
            sourceTitle: 'How DBT Schemes Actually Work — Government of India (Demo Reference)',
            publisher: 'DBT Bharat',
            publisherUrl: 'https://dbtbharat.gov.in',
            publicationDate: '2025-01-01',
            url: 'https://dbtbharat.gov.in/faq',
            excerpt: 'Direct Benefit Transfer processes require enrollment, verification, and processing cycles that span multiple weeks.',
            relevance: 'CONTRADICTING',
            explanation: 'Official DBT documentation contradicts the claimed 48-hour timeline.',
            isDemo: true,
          },
        ],
      },
    ],
    sourceCredibility: {
      overall: 8,
      publisherScore: 5,
      transparencyScore: 3,
      citationsScore: 0,
      domainScore: 10,
      authorScore: 5,
      hasHttps: false,
      hasAuthor: false,
      hasCitations: false,
      hasDate: false,
      domain: 'Unknown (viral message)',
      publisherName: 'Unknown',
      signals: [
        { type: 'NEGATIVE', label: 'No identifiable publisher', description: 'The message has no traceable original source' },
        { type: 'NEGATIVE', label: 'No author', description: 'No journalist or author attributed' },
        { type: 'NEGATIVE', label: 'No citations', description: 'Makes extraordinary claims with zero referenced sources' },
        { type: 'NEGATIVE', label: 'No publication date', description: 'Undated content is a common trait in viral misinformation' },
        { type: 'NEGATIVE', label: 'Urgency and suppression language', description: '"Before they delete this" is a known manipulation tactic' },
      ],
    },
    contextAnalysis: {
      verdict: 'LIKELY_MISLEADING',
      confidence: 87,
      contextMatchScore: 12,
      issues: [
        {
          type: 'FABRICATED_ATTRIBUTION',
          severity: 'HIGH',
          description: 'Attributes an action to PM Modi with no verifiable basis',
        },
        {
          type: 'DATE_MISMATCH',
          severity: 'HIGH',
          description: 'Claims "today" without any date, enabling recycled reuse of the same message',
        },
      ],
      explanation:
        'The message uses suppression tactics ("before they delete this"), false urgency (48 hours), and authoritative attribution without evidence. These are classic viral misinformation patterns.',
    },
    languageSignals: {
      clickbaitScore: 94,
      emotionalLanguageScore: 85,
      unsupportedCertaintyScore: 92,
      missingAttributionScore: 96,
      sensationalismScore: 88,
      allCapsCount: 3,
      exclamationCount: 3,
      triggerWords: ['BREAKING', 'EVERY', 'immediately', 'delete', 'directly'],
      overallManipulationScore: 91,
      summary:
        'Very high manipulation indicators. Uses BREAKING caps, multiple exclamation marks, false urgency, and suppression fear ("before they delete this"). These are hallmarks of viral misinformation designed to bypass critical thinking.',
    },
    newsDNA: {
      isSimulated: true,
      propagationLabel: 'Illustrative propagation path (demo)',
      nodes: [
        {
          id: 'n1',
          type: 'ORIGINAL_CLAIM',
          label: 'Original Fabrication',
          description: 'Unknown origin — likely created to deceive',
          isSimulated: true,
        },
        {
          id: 'n2',
          type: 'SOCIAL_MEDIA',
          label: 'WhatsApp Forwarding',
          description: 'Spread via WhatsApp chains with "Forward to all" calls to action',
          isSimulated: true,
        },
        {
          id: 'n3',
          type: 'MODIFIED_VERSION',
          label: 'Modified with Screenshot',
          description: 'Message re-shared as a screenshot to bypass text analysis',
          isSimulated: true,
        },
        {
          id: 'n4',
          type: 'VIRAL_CLAIM',
          label: 'Viral on Social Media',
          description: 'Reached thousands of shares before fact-checkers responded',
          isSimulated: true,
        },
      ],
      links: [
        { source: 'n1', target: 'n2', relationship: 'SHARED' },
        { source: 'n2', target: 'n3', relationship: 'MODIFIED' },
        { source: 'n3', target: 'n4', relationship: 'VIRAL_SPREAD' },
      ],
    },
    isDemo: true,
    demoCase: 1,
    processingSteps: completedSteps(),
    createdAt: new Date().toISOString(),
    analysisVersion: '1.0',
  };
}

// ─── Case 2: Misleading Context — Old Image / New Claim ───────────────────────
function buildCase2(): NewsAnalysis {
  const id = uuidv4();
  const claimId1 = uuidv4();
  const claimId2 = uuidv4();

  return {
    id,
    inputText:
      'Massive floods devastate Chennai as climate disaster hits India — thousands displaced. [Image shows aerial view of flooded streets]',
    headline: 'Massive floods devastate Chennai — thousands displaced (September 2026)',
    truthScore: {
      overall: 31,
      verdict: 'MISLEADING',
      factors: [
        { name: 'Claim Evidence', weight: 35, score: 40, contribution: 14, explanation: 'Flooding events in Chennai are historically accurate, but not for the claimed date' },
        { name: 'Source Credibility', weight: 20, score: 35, contribution: 7, explanation: 'Original source is a social media post without verified publication' },
        { name: 'Cross-Source Agreement', weight: 20, score: 25, contribution: 5, explanation: 'No major news outlet has reported Chennai flooding for September 2026' },
        { name: 'Context Consistency', weight: 15, score: 15, contribution: 2.25, explanation: 'Image appears to be from the 2023 Chennai floods, not 2026' },
        { name: 'Language Manipulation', weight: 10, score: 28, contribution: 2.8, explanation: 'Moderate emotional language; disaster framing without source' },
      ],
      explanation: [
        'The image in question appears to be from the 2023 Chennai flooding event, not a 2026 incident.',
        'No verified news agency has reported significant Chennai flooding in September 2026.',
        'The core claim (flooding) is plausible given historical context, but the current application of old media is misleading.',
        'This is a classic "misleading context" case: authentic content repurposed for a false claim.',
        'Weather data for Chennai in September 2026 does not indicate major flooding events.',
      ],
    },
    claims: [
      {
        id: claimId1,
        analysisId: id,
        claimText: 'Massive floods are currently devastating Chennai in September 2026',
        verdict: 'MISLEADING',
        confidence: 79,
        explanation:
          'While Chennai has experienced major floods historically (2015, 2021, 2023), no major flooding event has been reported for September 2026 by verified news sources.',
        supportingEvidence: [
          {
            id: uuidv4(),
            claimId: claimId1,
            sourceTitle: 'Chennai Flood History — documented events',
            publisher: 'IMD India (Demo Reference)',
            publisherUrl: 'https://imd.gov.in',
            publicationDate: '2023-11-05',
            url: 'https://imd.gov.in/pages/historical-floods',
            excerpt: 'Chennai experienced severe flooding in November 2023, with aerial footage matching descriptions of widespread urban inundation.',
            relevance: 'NEUTRAL',
            explanation: 'Confirms flooding events exist but in a different year than claimed.',
            isDemo: true,
          },
        ],
        contradictingEvidence: [
          {
            id: uuidv4(),
            claimId: claimId1,
            sourceTitle: 'No significant Chennai flooding reported — September 2026',
            publisher: 'The Hindu (Demo Reference)',
            publisherUrl: 'https://thehindu.com',
            publicationDate: '2026-09-14',
            url: 'https://thehindu.com/news/national/tamil-nadu',
            excerpt: 'No major flooding event has been reported for Chennai region in September 2026. Weather conditions are within normal seasonal range.',
            relevance: 'CONTRADICTING',
            explanation: 'Major regional newspaper shows no current flooding report.',
            isDemo: true,
          },
        ],
      },
      {
        id: claimId2,
        analysisId: id,
        claimText: 'The image shows the current 2026 flooding event',
        verdict: 'MISLEADING',
        confidence: 82,
        explanation:
          'Based on available image context signals, the visual content is consistent with the documented 2023 Chennai floods rather than a current 2026 event. Image metadata context does not match the claimed timeframe.',
        supportingEvidence: [],
        contradictingEvidence: [
          {
            id: uuidv4(),
            claimId: claimId2,
            sourceTitle: 'Similar aerial images traced to 2023 Chennai floods',
            publisher: 'Boom Live Fact Check (Demo Reference)',
            publisherUrl: 'https://boomlive.in',
            publicationDate: '2023-11-10',
            url: 'https://boomlive.in/fact-check',
            excerpt:
              'Aerial images of Chennai flooding from November 2023 have been recirculated in 2024 and 2025 with false date claims.',
            relevance: 'CONTRADICTING',
            explanation: 'Fact-checking outlet documented reuse of this image category.',
            isDemo: true,
          },
        ],
      },
    ],
    sourceCredibility: {
      overall: 34,
      publisherScore: 25,
      transparencyScore: 30,
      citationsScore: 15,
      domainScore: 45,
      authorScore: 20,
      hasHttps: false,
      hasAuthor: false,
      hasCitations: false,
      hasDate: false,
      domain: 'Social media post',
      publisherName: 'Unknown social media account',
      signals: [
        { type: 'NEGATIVE', label: 'Unverified social media origin', description: 'Post cannot be traced to a verified news organization' },
        { type: 'NEGATIVE', label: 'No publication date on original', description: 'Prevents timeline verification' },
        { type: 'NEGATIVE', label: 'No photographer credit', description: 'Aerial image lacks attribution' },
        { type: 'NEUTRAL', label: 'Historically plausible topic', description: 'Chennai flooding is a documented real phenomenon' },
      ],
    },
    contextAnalysis: {
      verdict: 'MISLEADING_CONTEXT',
      confidence: 82,
      imageAuthenticity: 'LIKELY_AUTHENTIC',
      originalDate: 'November 2023 (estimated)',
      claimedDate: 'September 2026',
      contextMatchScore: 18,
      issues: [
        {
          type: 'DATE_MISMATCH',
          severity: 'HIGH',
          description: 'Image appears to originate from 2023 flood event, not 2026',
        },
        {
          type: 'EVENT_MISMATCH',
          severity: 'HIGH',
          description: 'No 2026 Chennai flooding event corroborated by weather services',
        },
      ],
      explanation:
        'The image appears to be authentic footage of real flooding — but from a different year. This is a misleading context case: genuine media repurposed for a false current-events claim. The image itself is not AI-generated or fabricated, but its application is deceptive.',
    },
    languageSignals: {
      clickbaitScore: 65,
      emotionalLanguageScore: 72,
      unsupportedCertaintyScore: 58,
      missingAttributionScore: 81,
      sensationalismScore: 70,
      allCapsCount: 0,
      exclamationCount: 0,
      triggerWords: ['devastate', 'disaster', 'thousands displaced'],
      overallManipulationScore: 62,
      summary:
        'Moderate manipulation signals. Disaster language is present but not extreme. The main concern is the absence of any source attribution and the recency claim that cannot be verified.',
    },
    newsDNA: {
      isSimulated: true,
      propagationLabel: 'Illustrative propagation path (demo)',
      nodes: [
        {
          id: 'n1',
          type: 'ORIGINAL_CLAIM',
          label: '2023 News Article',
          description: 'Authentic news report of the 2023 Chennai floods',
          date: 'November 2023',
          isSimulated: true,
        },
        {
          id: 'n2',
          type: 'PUBLISHED_ARTICLE',
          label: 'Original Aerial Image',
          description: 'Verified photojournalism from 2023 flood coverage',
          date: 'November 2023',
          isSimulated: true,
        },
        {
          id: 'n3',
          type: 'SOCIAL_MEDIA',
          label: 'Recirculated with New Claim',
          description: 'Same image posted with 2026 date claim on social media',
          date: 'September 2026',
          isSimulated: true,
        },
        {
          id: 'n4',
          type: 'VIRAL_CLAIM',
          label: 'Viral Misleading Post',
          description: 'Widely shared before context could be verified',
          date: 'September 2026',
          isSimulated: true,
        },
      ],
      links: [
        { source: 'n1', target: 'n2', relationship: 'PUBLISHED' },
        { source: 'n2', target: 'n3', relationship: 'MODIFIED' },
        { source: 'n3', target: 'n4', relationship: 'VIRAL_SPREAD' },
      ],
    },
    isDemo: true,
    demoCase: 2,
    processingSteps: completedSteps(),
    createdAt: new Date().toISOString(),
    analysisVersion: '1.0',
  };
}

// ─── Case 3: Likely True — Factual Report ─────────────────────────────────────
function buildCase3(): NewsAnalysis {
  const id = uuidv4();
  const claimId1 = uuidv4();
  const claimId2 = uuidv4();

  return {
    id,
    inputText:
      'India\'s ISRO successfully launched the NISAR satellite in collaboration with NASA on March 12, 2024. The joint Earth observation satellite, designed to monitor global ecosystems, ice sheets, and natural hazards, was launched aboard a GSLV Mk II rocket from Sriharikota.',
    headline: 'ISRO and NASA successfully launch NISAR Earth observation satellite',
    url: 'https://www.isro.gov.in/nisar',
    truthScore: {
      overall: 84,
      verdict: 'LIKELY_TRUE',
      factors: [
        { name: 'Claim Evidence', weight: 35, score: 90, contribution: 31.5, explanation: 'Multiple credible sources confirm the NISAR mission details' },
        { name: 'Source Credibility', weight: 20, score: 85, contribution: 17, explanation: 'Topic aligns with verified official agency communications' },
        { name: 'Cross-Source Agreement', weight: 20, score: 88, contribution: 17.6, explanation: 'ISRO, NASA, and multiple news agencies reported the mission' },
        { name: 'Context Consistency', weight: 15, score: 80, contribution: 12, explanation: 'Technical details match official NISAR mission specifications' },
        { name: 'Language Manipulation', weight: 10, score: 85, contribution: 8.5, explanation: 'Neutral, factual language with specific verifiable details' },
      ],
      explanation: [
        'The NISAR satellite mission is a well-documented joint project between ISRO and NASA.',
        'Multiple independent credible sources — including official ISRO and NASA pages — confirm the mission.',
        'Technical details (GSLV Mk II, Sriharikota, Earth observation purpose) are accurate and verifiable.',
        'The article uses specific, verifiable details rather than vague or emotional claims.',
        'No credible source contradicts the core claims in this report.',
      ],
    },
    claims: [
      {
        id: claimId1,
        analysisId: id,
        claimText: 'ISRO and NASA jointly launched the NISAR satellite on March 12, 2024',
        verdict: 'LIKELY_TRUE',
        confidence: 88,
        explanation:
          'The NISAR (NASA-ISRO Synthetic Aperture Radar) mission is a confirmed joint project. Launch timelines and details are consistent with official documentation from both agencies.',
        supportingEvidence: [
          {
            id: uuidv4(),
            claimId: claimId1,
            sourceTitle: 'NISAR Mission Overview — NASA Official',
            publisher: 'NASA (Demo Reference)',
            publisherUrl: 'https://nasa.gov',
            publicationDate: '2024-03-12',
            url: 'https://www.jpl.nasa.gov/missions/nisar',
            excerpt:
              'NISAR (NASA-ISRO Synthetic Aperture Radar) is a joint Earth-observing mission between NASA and ISRO. The satellite will measure Earth\'s changing ecosystems, dynamic surfaces, and ice masses.',
            relevance: 'SUPPORTING',
            explanation: 'Official NASA mission page confirms the NISAR collaboration and objectives.',
            isDemo: true,
          },
          {
            id: uuidv4(),
            claimId: claimId1,
            sourceTitle: 'NISAR Mission — ISRO Official',
            publisher: 'ISRO (Demo Reference)',
            publisherUrl: 'https://isro.gov.in',
            publicationDate: '2024-03-12',
            url: 'https://www.isro.gov.in/nisar',
            excerpt:
              'ISRO successfully launched the NISAR satellite aboard GSLV Mk II from Satish Dhawan Space Centre, Sriharikota, marking a landmark joint mission with NASA.',
            relevance: 'SUPPORTING',
            explanation: 'Official ISRO launch announcement confirms all key technical details.',
            isDemo: true,
          },
        ],
        contradictingEvidence: [],
      },
      {
        id: claimId2,
        analysisId: id,
        claimText: 'NISAR is designed to monitor global ecosystems, ice sheets, and natural hazards',
        verdict: 'VERIFIED',
        confidence: 94,
        explanation:
          'This exactly matches the official stated mission objectives of the NISAR satellite as documented by both NASA and ISRO.',
        supportingEvidence: [
          {
            id: uuidv4(),
            claimId: claimId2,
            sourceTitle: 'NISAR Science Objectives — JPL NASA',
            publisher: 'NASA Jet Propulsion Laboratory (Demo Reference)',
            publisherUrl: 'https://jpl.nasa.gov',
            publicationDate: '2024-01-15',
            url: 'https://nisar.jpl.nasa.gov/mission/science',
            excerpt:
              'NISAR will study the mechanisms and rates of change of Earth\'s ecosystems, and constrain the global carbon cycle. The mission will also monitor natural hazards and measure ice mass changes.',
            relevance: 'SUPPORTING',
            explanation: 'Official science documentation exactly matches the stated mission objectives.',
            isDemo: true,
          },
        ],
        contradictingEvidence: [],
      },
    ],
    sourceCredibility: {
      overall: 82,
      publisherScore: 85,
      transparencyScore: 78,
      citationsScore: 80,
      domainScore: 90,
      authorScore: 70,
      hasHttps: true,
      hasAuthor: true,
      hasCitations: true,
      hasDate: true,
      domain: 'isro.gov.in',
      publisherName: 'ISRO (Indian Space Research Organisation)',
      signals: [
        { type: 'POSITIVE', label: 'Official government domain (.gov.in)', description: 'Domain belongs to verified government space agency' },
        { type: 'POSITIVE', label: 'HTTPS enabled', description: 'Secure connection indicates legitimate web presence' },
        { type: 'POSITIVE', label: 'Publication date present', description: 'Dated content allows timeline verification' },
        { type: 'POSITIVE', label: 'Cross-agency confirmation available', description: 'Both ISRO and NASA independently confirm the mission' },
        { type: 'NEUTRAL', label: 'Individual article author not specified', description: 'Institutional publication without individual byline' },
      ],
    },
    contextAnalysis: {
      verdict: 'AUTHENTIC_CONTEXT',
      confidence: 88,
      contextMatchScore: 87,
      issues: [],
      explanation:
        'The content is consistent with documented events and verifiable technical details. The timeline matches official launch records. No context manipulation indicators detected.',
    },
    languageSignals: {
      clickbaitScore: 12,
      emotionalLanguageScore: 8,
      unsupportedCertaintyScore: 10,
      missingAttributionScore: 20,
      sensationalismScore: 10,
      allCapsCount: 1,
      exclamationCount: 0,
      triggerWords: ['successfully'],
      overallManipulationScore: 11,
      summary:
        'Very low manipulation signals. The language is factual, specific, and neutral. The presence of specific verifiable details (date, rocket model, location) is a positive credibility indicator.',
    },
    newsDNA: {
      isSimulated: true,
      propagationLabel: 'Illustrative information flow (demo)',
      nodes: [
        {
          id: 'n1',
          type: 'ORIGINAL_CLAIM',
          label: 'ISRO Official Announcement',
          description: 'Official launch announcement from ISRO press release',
          date: 'March 12, 2024',
          source: 'isro.gov.in',
          isSimulated: true,
        },
        {
          id: 'n2',
          type: 'PUBLISHED_ARTICLE',
          label: 'NASA Mission Confirmation',
          description: 'NASA JPL independently confirms launch and mission details',
          date: 'March 12, 2024',
          source: 'jpl.nasa.gov',
          isSimulated: true,
        },
        {
          id: 'n3',
          type: 'PUBLISHED_ARTICLE',
          label: 'Major News Coverage',
          description: 'Multiple news agencies report on successful launch',
          date: 'March 13, 2024',
          isSimulated: true,
        },
        {
          id: 'n4',
          type: 'SOCIAL_MEDIA',
          label: 'Widely Shared Accurately',
          description: 'Story shared with accurate attribution and context',
          date: 'March 13–15, 2024',
          isSimulated: true,
        },
      ],
      links: [
        { source: 'n1', target: 'n2', relationship: 'PUBLISHED' },
        { source: 'n1', target: 'n3', relationship: 'PUBLISHED' },
        { source: 'n3', target: 'n4', relationship: 'SHARED' },
      ],
    },
    isDemo: true,
    demoCase: 3,
    processingSteps: completedSteps(),
    createdAt: new Date().toISOString(),
    analysisVersion: '1.0',
  };
}

function completedSteps() {
  return [
    { step: 'extract', label: 'Extracting content', status: 'done' as const },
    { step: 'claims', label: 'Identifying claims', status: 'done' as const },
    { step: 'source', label: 'Checking source', status: 'done' as const },
    { step: 'evidence', label: 'Comparing evidence', status: 'done' as const },
    { step: 'context', label: 'Analyzing context', status: 'done' as const },
    { step: 'report', label: 'Generating explanation', status: 'done' as const },
  ];
}
