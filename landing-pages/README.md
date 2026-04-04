# @ensoulify/whatsapp-landing-pages

WhatsApp Customer Support Automation Landing Page Generator for Multiple Business Niches

## Overview

This Node.js project generates customized landing pages for WhatsApp automation services, targeting different business niches in Egypt and MENA. Each landing page is available in both English and Egyptian Arabic (عامية مصرية).

## Developer

**Mostafa Rawash**  
Email: mostafa@rawash.com  
Company: [Ensoulify.com](https://ensoulify.com)

## Business Niches

1. **Restaurant** 🍽️ - Menu inquiries, reservations, delivery orders
2. **Medical Clinic** 🏥 - Appointment scheduling, working hours, patient inquiries
3. **E-Commerce Store** 🛒 - Product inquiries, order status, customer support
4. **Real Estate** 🏠 - Property inquiries, viewing schedules, client questions
5. **Service Business** 💇 - Booking automation, appointment reminders, inquiries

## Features

- ✅ **Bilingual**: English and Egyptian Arabic (عامية مصرية)
- ✅ **RTL Support**: Proper right-to-left layout for Arabic
- ✅ **Mobile Responsive**: Works on all devices
- ✅ **Modern UI**: Tailwind CSS styling
- ✅ **SEO Optimized**: Meta tags and semantic HTML
- ✅ **Customized Content**: Each business type has unique messaging
- ✅ **Conversion Focused**: Problem-solution structure with clear CTAs

## Project Structure

```
whatsapp-landing-pages/
├── build.js                 # Main build script
├── package.json             # Project configuration
├── README.md                # This file
├── src/
│   ├── data/               # Content for each business type
│   │   ├── restaurant.js   # Restaurant content (EN + AR)
│   │   ├── clinic.js       # Clinic content (EN + AR)
│   │   ├── ecommerce.js    # E-commerce content (EN + AR)
│   │   ├── realestate.js   # Real estate content (EN + AR)
│   │   └── service.js      # Service business content (EN + AR)
│   └── templates/
│       └── template.js     # HTML template generator
└── dist/                   # Generated HTML files
    ├── index.html          # Index page with all links
    ├── restaurant/
    │   ├── en/index.html   # English version
    │   └── ar/index.html   # Arabic version
    ├── clinic/
    │   ├── en/index.html
    │   └── ar/index.html
    ├── ecommerce/
    │   ├── en/index.html
    │   └── ar/index.html
    ├── realestate/
    │   ├── en/index.html
    │   └── ar/index.html
    └── service/
        ├── en/index.html
        └── ar/index.html
```

## Installation

No dependencies required! The project uses only Node.js built-in modules.

```bash
# Clone or download the project
cd whatsapp-landing-pages

# Build all landing pages
npm run build
# or
node build.js
```

## Usage

### Build Landing Pages

```bash
npm run build
```

This generates all HTML files in the `dist/` directory.

### Serve Locally

```bash
npm run serve
# or
npx serve dist
```

Then open http://localhost:3000 in your browser.

### Development

```bash
npm run dev
```

Builds and serves the pages in one command.

## Customization

### Modify Content

Edit the content files in `src/data/`:

```javascript
// src/data/restaurant.js
module.exports = {
  en: {
    meta: { title: "...", description: "..." },
    hero: { headline: "...", subheadline: "...", cta: "..." },
    // ... more sections
  },
  ar: {
    // Arabic version
  }
};
```

### Modify Template

Edit `src/templates/template.js` to change the HTML structure, styling, or layout.

### Add New Business Type

1. Create a new file in `src/data/` (e.g., `gym.js`)
2. Copy the structure from an existing file
3. Customize the content for the new business type
4. Add to `businessTypes` array in `build.js`:

```javascript
const businessTypes = [
  { name: 'restaurant', data: require('./src/data/restaurant') },
  { name: 'clinic', data: require('./src/data/clinic') },
  // ... existing types
  { name: 'gym', data: require('./src/data/gym') } // New type
];
```

## Landing Page Sections

Each landing page includes:

1. **Hero Section** - Strong headline and CTA
2. **Problem Section** - Business-specific pain points
3. **Solution Section** - How the service helps
4. **Features Section** - Key benefits
5. **How It Works** - Simple 3-step process
6. **Use Cases** - Specific business examples
7. **Testimonials** - Localized customer quotes
8. **Pricing Section** - 3 tiers (Basic/Standard/Premium)
9. **FAQ Section** - Common objections
10. **Final CTA** - Closing call-to-action

## Deployment

The generated files are static HTML with embedded Tailwind CSS (via CDN). Deploy to any static hosting:

- **Netlify**: Drag and drop `dist/` folder
- **Vercel**: Deploy with zero config
- **GitHub Pages**: Push `dist/` to gh-pages branch
- **AWS S3**: Upload to S3 bucket
- **Any web server**: Copy `dist/` folder

## Technical Details

- **No build dependencies**: Uses only Node.js built-in modules
- **Tailwind CSS**: Loaded via CDN (no build step needed)
- **Fonts**: Google Fonts (Inter for English, Cairo for Arabic)
- **Icons**: Emoji-based (no icon library needed)
- **JavaScript**: Minimal vanilla JS for FAQ accordion

## Target Audience

- Small and medium businesses in Egypt and MENA
- Business owners with limited technical knowledge
- Companies using WhatsApp for customer communication

## Design Philosophy

1. **No Technical Jargon**: Avoids APIs, integrations, technical terms
2. **Outcome-Focused**: Emphasizes business results, not features
3. **Localized**: Egyptian Arabic in natural colloquial language
4. **Trust-Building**: Realistic testimonials, clear pricing
5. **Action-Oriented**: Multiple CTAs throughout the page

## Statistics

- 5 Business Niches
- 10 Total Landing Pages (EN + AR)
- 50+ Testimonials (localized)
- 75 FAQ Answers (customized per business)
- 100% Mobile Responsive

## License

ISC

## Support

For questions or customization requests:  
Email: mostafa@rawash.com  
Website: [ensoulify.com](https://ensoulify.com)

---

**Built with ❤️ by Mostafa Rawash for Ensoulify.com**