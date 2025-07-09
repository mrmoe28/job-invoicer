# Job Invoicer

A modern job management and invoicing application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 📊 **Dashboard** - Overview of business metrics, recent activity, and upcoming deadlines
- 👥 **Customer Management** - Full CRUD operations for customer data
- 💼 **Job Tracking** - Manage jobs with status tracking (pending, in-progress, completed)
- 📄 **Invoice Management** - Create, send, and track invoices with status indicators
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:mrmoe28/job-invoicer.git
cd job-invoicer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server (auto-opens browser)
- `npm run dev:no-open` - Start development server without auto-open
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
job-invoicer/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with navbar
│   ├── page.tsx           # Dashboard (home page)
│   ├── customers/         # Customers page
│   ├── jobs/              # Jobs page
│   └── invoices/          # Invoices page
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── dashboard.tsx  # Dashboard component
│   │   ├── navbar.tsx     # Navigation bar
│   │   └── ...           # Other page components
│   ├── lib/              # Utilities and types
│   └── styles/           # Global styles
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## Features in Detail

### Dashboard
- Business overview with key metrics
- Recent activity feed
- Job status breakdown
- Upcoming deadlines

### Customer Management
- Add, edit, and delete customers
- Search and filter functionality
- Customer type classification (residential/commercial)
- Contact information management

### Job Management
- Track job status (pending, in-progress, completed)
- Associate jobs with customers
- Set start and end dates
- Track job values

### Invoice Management
- Create invoices from completed jobs
- Track invoice status (draft, sent, paid, overdue)
- Financial overview and statistics
- Quick actions for sending and downloading

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is private and proprietary.