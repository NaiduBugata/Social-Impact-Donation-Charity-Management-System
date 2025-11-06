// Predefined knowledge base for the project chatbot
const knowledge = [
  {
    id: 'intro',
    question: 'What is this project?',
    keywords: ['what', 'project', 'this project', 'about'],
    answer: `This is the Social Impact Platform — a transparent, AI-assisted donation and service-matching system. It connects donors, helpers, receivers and NGOs with role-based dashboards, geo-proximity matching, proof-based sanctioning, and analytics (pie, line, bar charts).`,
  },
  {
    id: 'tech',
    question: 'What tech stack does it use?',
    keywords: ['tech', 'stack', 'technology', 'libraries'],
    answer: 'Frontend: React (Vite), Recharts for charts, Leaflet for maps. Data is currently simulated in localStorage via a mock API (window.__socialImpactApi). Backend patterns exist in /backend for future integration.',
  },
  {
    id: 'run',
    question: 'How do I run locally?',
    keywords: ['run', 'start', 'dev', 'local'],
    answer: `From the frontend folder run: npm install (if needed) then npm run dev. Open http://localhost:5174. If you see errors, try a full reinstall or check console for details.`,
  },
  {
    id: 'credentials',
    question: 'What are the test login credentials?',
    keywords: ['login', 'credentials', 'test', 'accounts'],
    answer: `Sample accounts are in TEST_CREDENTIALS.md. Common ones: admin/admin123, donor1/donor123, helper1/helper123, receiver1/receiver123, ngo1/ngo123. Anonymous donations are available via the landing page.`,
  },
  {
    id: 'impact-stories',
    question: 'How to add impact stories?',
    keywords: ['impact stories', 'stories', 'add story', 'add impact'],
    answer: `Admins can add media-rich impact stories from the Admin Dashboard → Impact Stories tab, or via the standalone Admin → Manage Impact Stories page. Stories are saved to localStorage in this demo and appear publicly at /impact-stories.`,
  },
  {
    id: 'anonymous',
    question: 'Can users donate anonymously?',
    keywords: ['anonymous', 'donate anonymously', 'anonymous donation'],
    answer: `Yes — use the Donate Anonymously button on the landing page. The platform issues a QR or tracking id to follow impact without creating an account.`,
  },
  {
    id: 'reset',
    question: 'How to reset sample data?',
    keywords: ['reset', 'sample data', 'reset sample'],
    answer: `Open browser console on the frontend (F12) and run: window.__socialImpactApi.reset(). This restores seeded demo data.`,
  },
  {
    id: 'media',
    question: 'How are images and videos stored?',
    keywords: ['image', 'video', 'media', 'upload'],
    answer: `In this demo, uploaded media are converted to base64 data URLs and stored in localStorage. For production, switch to a media host (S3/Cloudinary) and save URLs instead.`,
  },
  {
    id: 'transparency',
    question: 'Where is the transparency dashboard?',
    keywords: ['transparency', 'transparency dashboard', 'public portal'],
    answer: `Visit /transparency from the main nav or landing page to view public analytics, campaign progress, and fund utilization.`,
  },
  {
    id: 'support',
    question: 'How to contact support or get help?',
    keywords: ['support', 'help', 'contact'],
    answer: `For developer help, check README files in the repository or open an issue. For live deployments, add an admin contact in the Organization profile or use the contact form (if implemented).`,
  }
];

export default knowledge;
