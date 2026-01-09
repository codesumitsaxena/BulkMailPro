export const INITIAL_TEMPLATES = {
  bde: {
    name: 'BDE Partnership Outreach',
    icon: '',
    category: 'Business Development',
    subject: 'Strategic Partnership Opportunity with {{company_name}}',
    body: `Dear {{client_name}},

I hope this message finds you in great spirits.

I'm reaching out from {{our_company}}, a leading provider in digital transformation solutions. We've been following {{company_name}}'s impressive growth trajectory and believe there's a compelling opportunity for strategic collaboration.

**Why Partner With Us:**
✓ 15+ years of industry expertise
✓ 500+ successful enterprise implementations
✓ ROI-driven approach with measurable outcomes
✓ Dedicated account management team

**Proposed Next Steps:**
1. Quick 15-minute discovery call
2. Custom solution presentation
3. Pilot program discussion

I'd love to schedule a brief conversation this week to explore how we can drive mutual growth. 

Would Tuesday or Thursday afternoon work for a quick call?

Looking forward to connecting,

{{sender_name}}
{{sender_title}}
{{our_company}}
{{contact_phone}} | {{contact_email}}`
  },
  
  seo: {
    name: 'SEO Services Offer',
    icon: '',
    category: 'Digital Marketing',
    subject: 'Boost {{company_name}} Rankings - Free SEO Audit Included',
    body: `Hi {{client_name}},

I recently analyzed {{company_name}}'s online presence and noticed some significant opportunities to increase your organic traffic.

**Current Situation:**
Our preliminary audit shows that you're missing out on 2,500+ monthly searches in your industry.

**What We Offer:**
✅ Comprehensive Technical SEO Audit
✅ Competitor Gap Analysis
✅ Custom Keyword Strategy Blueprint
✅ On-Page Optimization Roadmap

**Results We've Achieved:**
• 250% average traffic increase within 6 months
• 180% boost in qualified leads

Can I share the preliminary findings I've compiled for {{company_name}}?

Best regards,
{{sender_name}}
SEO Strategist`
  },

  webDesign: {
    name: 'Website Design Proposal',
    icon: '',
    category: 'Web Development',
    subject: 'Transform {{company_name}} Digital Experience',
    body: `Hello {{client_name}},

Your website is the digital front door to {{company_name}}.

**Our Approach:**
Conversion-Focused Design
Mobile-First Development
Lightning-Fast Load Times
SEO-Optimized Architecture

I'd love to show you our recent work.

Creative regards,
{{sender_name}}`
  },

  coldEmail: {
    name: 'Cold Sales Outreach',
    icon: '',
    category: 'Sales',
    subject: 'Quick question about {{company_name}} growth goals',
    body: `Hi {{client_name}},

I'll keep this brief since I know your time is valuable.

We've helped companies in your industry achieve:
→ 45% increase in qualified leads
→ 60% faster sales cycles

Would you be open to a quick 10-minute demo?

Cheers,
{{sender_name}}`
  },

  followUp: {
    name: 'Professional Follow-Up',
    icon: '',
    category: 'Follow-Up',
    subject: 'Re: Following up - {{previous_subject}}',
    body: `Hi {{client_name}},

I wanted to circle back on my previous email regarding {{previous_topic}}.

Just reply with 1, 2, or 3 and I'll take it from there.

Best regards,
{{sender_name}}`
  }
};

export const API_BASE_URL = 'http://localhost:5000/api';