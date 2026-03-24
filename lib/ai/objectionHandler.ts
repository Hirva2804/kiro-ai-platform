import { geminiGenerate } from './gemini';

interface ObjectionResponse {
  response: string;
  followUpQuestion: string;
  talkingPoints: string[];
  doNotSay: string[];
}

const objectionPlaybook: Record<string, ObjectionResponse> = {
  'price': {
    response: `I understand budget is always a consideration. Let's talk about ROI — our customers typically see 3x return in the first quarter through time saved and deals closed faster. What's your current cost of a missed opportunity?`,
    followUpQuestion: "What's the typical value of a deal you close?",
    talkingPoints: [
      'ROI in 90 days',
      'Cost of inaction (missed deals)',
      'Flexible pricing tiers',
      'Free trial available'
    ],
    doNotSay: [
      "It's not that expensive",
      "You get what you pay for",
      "Our competitors charge more"
    ]
  },
  'timing': {
    response: `I hear you — timing matters. Here's the thing: every day without better lead intelligence means potential revenue walking out the door. What if we could get you up and running in under a week with immediate wins?`,
    followUpQuestion: "What would need to happen for this to become a priority?",
    talkingPoints: [
      'Quick setup (< 1 week)',
      'Immediate value from day 1',
      'Cost of waiting (lost deals)',
      'Pilot program option'
    ],
    doNotSay: [
      "You're making a mistake waiting",
      "Your competitors aren't waiting",
      "This deal won't last"
    ]
  },
  'authority': {
    response: `Totally understand — big decisions need the right people involved. Who else should be part of this conversation? I'd love to show them how we've helped similar teams hit their numbers.`,
    followUpQuestion: "What concerns do you think they'll have?",
    talkingPoints: [
      'Happy to present to decision makers',
      'Case studies from similar companies',
      'ROI calculator for their review',
      'Flexible meeting times'
    ],
    doNotSay: [
      "Can you convince them?",
      "Why aren't they here?",
      "This is a no-brainer"
    ]
  },
  'need': {
    response: `Fair question. Let me ask you this: how many leads are slipping through the cracks right now? Even if things are working okay, our customers find 20-30% more qualified opportunities they were missing. What would that mean for your pipeline?`,
    followUpQuestion: "What's your biggest challenge with lead management right now?",
    talkingPoints: [
      'Hidden opportunities in existing pipeline',
      '20-30% lift in qualified leads',
      'Better prioritization = more closed deals',
      'Free pipeline audit'
    ],
    doNotSay: [
      "You definitely need this",
      "Your process is broken",
      "Everyone needs this"
    ]
  },
  'solution': {
    response: `That's great to hear — it means you're already investing in this area. Many of our best customers came from similar tools. What matters most is how well it fits your workflow.`,
    followUpQuestion: "What's the one thing your current solution doesn't do well?",
    talkingPoints: [
      'Integrates with existing tools',
      'Fills gaps in current stack',
      'No rip-and-replace needed',
      'Migration support included'
    ],
    doNotSay: [
      "Your current solution is bad",
      "We're way better",
      "They're outdated"
    ]
  },
  'trust': {
    response: `I get it — trust is earned, not given. We work with [similar companies in your industry]. Would it help to talk to one of them? Or we could start with a small pilot so you can see results before committing.`,
    followUpQuestion: "What would make you feel confident in moving forward?",
    talkingPoints: [
      'Customer references available',
      'Case studies with metrics',
      'Pilot program (low risk)',
      'Money-back guarantee'
    ],
    doNotSay: [
      "Just trust us",
      "We're the market leader",
      "Everyone uses us"
    ]
  }
};

export async function handleObjection(
  objection: string,
  leadContext?: {
    name?: string;
    company?: string;
    industry?: string;
    dealValue?: number;
  }
): Promise<ObjectionResponse> {
  // Detect objection type
  const objectionType = detectObjectionType(objection);
  const playbook = objectionPlaybook[objectionType];

  if (!playbook) {
    // Fallback to AI if no playbook match
    return await generateAIObjectionResponse(objection, leadContext);
  }

  // Personalize the response with lead context
  let personalizedResponse = playbook.response;
  if (leadContext?.name) {
    personalizedResponse = `${leadContext.name}, ${personalizedResponse}`;
  }

  return {
    ...playbook,
    response: personalizedResponse
  };
}

function detectObjectionType(objection: string): string {
  const lower = objection.toLowerCase();
  
  if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive') || lower.includes('budget')) {
    return 'price';
  }
  if (lower.includes('timing') || lower.includes('later') || lower.includes('not now') || lower.includes('busy')) {
    return 'timing';
  }
  if (lower.includes('decision') || lower.includes('boss') || lower.includes('team') || lower.includes('approval')) {
    return 'authority';
  }
  if (lower.includes('need') || lower.includes('working fine') || lower.includes('happy with')) {
    return 'need';
  }
  if (lower.includes('already have') || lower.includes('current solution') || lower.includes('using')) {
    return 'solution';
  }
  if (lower.includes('trust') || lower.includes('proof') || lower.includes('references') || lower.includes('reviews')) {
    return 'trust';
  }

  return 'general';
}

async function generateAIObjectionResponse(
  objection: string,
  leadContext?: {
    name?: string;
    company?: string;
    industry?: string;
    dealValue?: number;
  }
): Promise<ObjectionResponse> {
  const prompt = `You are a B2B sales expert handling an objection.

Objection: "${objection}"

${leadContext ? `Lead Context:
- Name: ${leadContext.name}
- Company: ${leadContext.company}
- Industry: ${leadContext.industry}
- Deal Value: $${leadContext.dealValue}
` : ''}

Provide a response that:
1. Acknowledges their concern
2. Reframes it positively
3. Asks a clarifying question
4. Suggests 3-4 talking points
5. Lists 2-3 things NOT to say

Format as JSON:
{
  "response": "your empathetic response",
  "followUpQuestion": "your clarifying question",
  "talkingPoints": ["point 1", "point 2", "point 3"],
  "doNotSay": ["avoid 1", "avoid 2"]
}`;

  try {
    const aiResponse = await geminiGenerate(prompt);
    const parsed = JSON.parse(aiResponse);
    return parsed;
  } catch (error) {
    // Fallback response
    return {
      response: "I understand your concern. Let's explore this together — what specifically is holding you back?",
      followUpQuestion: "What would need to change for this to be a good fit?",
      talkingPoints: [
        "Address specific concerns",
        "Provide relevant case studies",
        "Offer flexible options"
      ],
      doNotSay: [
        "That's not a real concern",
        "You're wrong about that"
      ]
    };
  }
}
