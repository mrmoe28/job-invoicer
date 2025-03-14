# PermitHelper

PermitHelper is a web application that helps users find permit offices, pricing information, instructions, and application forms for building permits based on their location.

## Features

- **Address Search**: Find permit offices near your location
- **Interactive Map**: Use Google Maps to select your location
- **Permit Information**: View detailed information about permit offices, fees, and requirements
- **Form Downloads**: Access and download necessary application forms
- **AI Assistant**: Get answers to your permit-related questions using multiple AI providers (OpenAI, Perplexity, Anthropic)

## Technologies Used

- **Next.js**: React framework for server-side rendering and static site generation
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For responsive and modern UI design
- **Google Maps API**: For location selection and mapping
- **AI Integration**: Support for OpenAI, Perplexity, and Anthropic APIs

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- API keys for:
  - Google Maps
  - OpenAI (optional)
  - Perplexity (optional)
  - Anthropic (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/permithelper.git
   cd permithelper
   ```

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

1. Create a `.env.local` file in the root directory with your API keys:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   OPENAI_API_KEY=your_openai_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

1. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

1. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter your address in the search form or use the interactive map to select your location
1. View permit offices near your location
1. Access detailed information about permit requirements, fees, and application forms
1. Download necessary forms for your permit application
1. Use the AI Assistant to get answers to your permit-related questions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the contributors who have helped with this project
- Special thanks to the open-source community for providing the tools and libraries used in this project
