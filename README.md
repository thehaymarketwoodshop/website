# The Haymarket Woodshop

A modern, Apple-inspired marketing website for a handmade woodworking business. Built with Next.js 14+, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Modern Design**: Apple-like aesthetic with lots of whitespace, crisp typography, and subtle animations
- **Responsive**: Mobile-first design that works beautifully on all devices
- **SEO Optimized**: Meta tags, Open Graph, and semantic HTML throughout
- **Contact Form**: Server-side email sending via Nodemailer with spam protection
- **Advanced Filtering**: Gallery with URL-synced filtering by availability, item type, size, and wood type
- **Accessibility**: WCAG basics with proper focus states, ARIA labels, and keyboard navigation

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Validation**: Zod
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd haymarket-woodshop

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your SMTP credentials
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# SMTP Configuration for Contact Form
SMTP_HOST=smtp.gmail.com          # or your SMTP provider
SMTP_PORT=587                     # 587 for TLS, 465 for SSL
SMTP_USER=your-email@gmail.com    # SMTP username
SMTP_PASS=your-app-password       # SMTP password or app password

# Email recipient for contact form submissions
CONTACT_TO_EMAIL=hello@haymarketwoodshop.com

# Site URL (for Open Graph tags)
NEXT_PUBLIC_SITE_URL=https://haymarketwoodshop.com
```

**Gmail Setup**: If using Gmail, enable 2FA and create an [App Password](https://support.google.com/accounts/answer/185833).

### Running Locally

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── about/             # About page
│   ├── gallery/           # Gallery with filtering
│   ├── contact/           # Contact page with form
│   ├── products/[slug]/   # Product detail pages
│   └── api/contact/       # Contact form API endpoint
├── components/            # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Button.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── GalleryFilters.tsx
│   ├── ContactForm.tsx
│   └── ...
├── data/
│   └── products.ts        # Product catalog data
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── validation.ts      # Zod schemas
│   └── filter-utils.ts    # URL filter serialization
└── types/
    └── product.ts         # TypeScript types
```

## Adding/Updating Content

### Adding Images

1. Place images in `/public/placeholders/` (or rename to `/public/images/`)
2. Recommended formats: JPG, PNG, WebP
3. Recommended sizes:
   - Product images: 1200x900px (4:3) or 1200x1200px (square)
   - Multiple images per product are supported
4. Update the `images` array in product data:

```typescript
images: ['/placeholders/your-image-1.jpg', '/placeholders/your-image-2.jpg'],
```

### Adding Products

Edit `/src/data/products.ts`:

```typescript
{
  id: '13',                           // Unique ID
  name: 'Your Product Name',
  slug: 'your-product-name',          // URL-friendly slug
  category: 'Kitchen',                // Display category
  itemType: 'small_goods',            // small_goods | tables | cabinets
  size: 'small',                      // small | medium | large
  woodType: 'Walnut',                 // Walnut | Maple | Oak (or add new)
  dimensions: '12" x 8" x 1"',
  description: 'Full product description...',
  images: ['/placeholders/product.jpg'],
  etsyUrl: 'https://etsy.com/listing/...',
  soldOut: false,
  featured: true,                     // Show on homepage
  createdAt: '2024-03-15',
  price: 150,                         // Optional
  finish: 'Natural oil',              // Optional
  careInstructions: '...',            // Optional
  leadTime: '2-3 weeks',              // Optional
}
```

### Adding a New Wood Type

1. Add the wood type to the `WOOD_TYPES` array in `/src/types/product.ts`:

```typescript
export const WOOD_TYPES = ['Walnut', 'Maple', 'Oak', 'Cherry'] as const;
```

2. That's it! The filter UI will automatically include the new option.

### Updating About Page Content

Edit `/src/app/about/page.tsx` - the content is in standard React JSX within a prose-styled card component.

## Gallery Filtering

The gallery supports combinable filters with URL persistence:

- **In Stock**: Toggle to show/hide sold items (default: ON)
- **Item Type**: Multi-select pills (Small Goods, Tables, Cabinets)
- **Size**: Single-select segmented control (Small, Medium, Large)
- **Wood Type**: Multi-select pills (dynamically generated from WOOD_TYPES)

Example URL: `/gallery?inStock=0&type=small_goods,tables&size=medium&wood=Walnut,Oak`

## Customization

### Colors

Edit the `woodshop` color palette in `/tailwind.config.ts`:

```typescript
colors: {
  woodshop: {
    50: '#faf8f6',
    // ... customize as needed
    950: '#2a201a',
  },
}
```

### Typography

The site uses system fonts optimized for Apple devices. To use custom fonts:

1. Add fonts to `/public/fonts/` or use Google Fonts
2. Update `@font-face` rules in `/src/app/globals.css`
3. Update `fontFamily` in `/tailwind.config.ts`

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in the Vercel dashboard.

### Other Platforms

The site can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Node.js

## License

Private - All rights reserved.
