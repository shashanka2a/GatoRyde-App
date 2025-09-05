# Rydify Landing Page

A production-ready Next.js 14 application for Rydify - a student rideshare platform. This landing page features modern animations, responsive design, and optimized performance.

## 🚀 Features

- **Next.js 14** with static export support
- **React 18** with modern hooks and patterns
- **Framer Motion** for smooth animations
- **Tailwind CSS** for responsive styling
- **Radix UI** components for accessibility
- **TypeScript** for type safety
- **ESLint** for code quality
- **Production optimized** with static export

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Build**: Static Export

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Static Export
```bash
npm run export
```

The static files will be generated in the `out` directory, ready for deployment to any static hosting service.

## 📁 Project Structure

```
├── pages/
│   ├── _app.tsx          # App wrapper
│   ├── _document.tsx     # Document structure
│   └── index.tsx         # Main landing page
├── src/
│   ├── components/
│   │   └── ui/           # Reusable UI components
│   └── styles/
│       └── globals.css   # Global styles
├── public/               # Static assets
└── out/                  # Static export output
```

## 🎨 Key Components

- **Hero Section**: Animated landing with call-to-action
- **How It Works**: Step-by-step process explanation
- **App Features**: Interactive phone mockups
- **Testimonials**: Carousel with student reviews
- **Footer**: Links and company information

## 🔧 Configuration

- **next.config.js**: Next.js configuration with static export
- **tailwind.config.js**: Tailwind CSS customization
- **tsconfig.json**: TypeScript configuration
- **postcss.config.js**: PostCSS setup

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## ⚡ Performance

- Static export for fast loading
- Optimized images and assets
- Minimal JavaScript bundle
- Efficient CSS with Tailwind
- Smooth animations with Framer Motion

## 🚀 Deployment

This app is configured for static export and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any static hosting service

## 📄 Original Design

The original Figma design is available at: https://www.figma.com/design/yRup5RXwUhumFnYQQU7XXM/Rydify-Landing-Page