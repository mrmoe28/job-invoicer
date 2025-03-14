# Permit Office Scraper

This project contains various web scrapers for collecting information about building permit offices, fees, application instructions, and forms.

## Overview

The project includes three different scraping approaches:

1. **Basic Scraper** (`basic_scraper.py`): Uses requests and BeautifulSoup to scrape static websites.
2. **Selenium Scraper** (`selenium_scraper.py`): Uses Selenium WebDriver to scrape JavaScript-heavy websites.
3. **Scrapy Spider** (`scrapy_project/permit_spider.py`): Uses Scrapy framework for more advanced crawling.

## Installation

1. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the required packages:

   ```bash
   pip install -r ../requirements.txt
   ```

## Usage

### Basic Scraper

The basic scraper uses requests and BeautifulSoup to scrape permit office information:

```bash
python basic_scraper.py
```

This will:

- Fetch permit office information
- Fetch permit fees for each office
- Save the data to CSV files in the `output` directory

### Selenium Scraper

The Selenium scraper uses WebDriver to scrape JavaScript-heavy websites:

```bash
python selenium_scraper.py
```

This will:

- Launch a headless Chrome browser
- Search for permit offices based on an address
- Fetch permit forms for each office
- Save the data to CSV files in the `output` directory

### Scrapy Spider

The Scrapy spider uses the Scrapy framework for more advanced crawling:

```bash
python scrapy_project/permit_spider.py
```

This will:

- Crawl the permit office website
- Extract permit office information
- Save the data to a JSON file in the `output` directory

## Data Structure

### Permit Offices

```json
{
  "id": "sf-dbi",
  "name": "San Francisco Department of Building Inspection",
  "address": "49 South Van Ness Avenue",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94103",
  "phone": "(628) 652-3700",
  "email": "dbi.info@sfgov.org",
  "website": "https://sfdbi.org",
  "hours": "Monday-Friday: 8:00 AM - 5:00 PM"
}
```

### Permit Fees

```json
{
  "id": "sf-fee-1",
  "name": "Building Permit Application Fee",
  "amount": 175.00,
  "description": "Base fee for building permit application review",
  "office_id": "sf-dbi",
  "permit_type": "Building"
}
```

### Permit Forms

```json
{
  "id": "sf-form-1",
  "title": "Building Permit Application",
  "description": "Standard application form for building permits",
  "file_url": "/forms/building-permit-application.pdf",
  "file_type": "application/pdf",
  "file_size": 250000,
  "last_updated": "2023-01-15",
  "office_id": "sf-dbi",
  "permit_type": "Building"
}
```

## Customization

You can customize the scrapers by:

1. Modifying the URLs to target different websites
2. Adjusting the CSS selectors to match the structure of the target websites
3. Adding additional data fields to extract
4. Implementing additional processing or analysis of the scraped data

## Notes

- These scrapers are for educational purposes only
- Always respect the terms of service of the websites you scrape
- Consider using official APIs if available
- Add appropriate delays between requests to avoid overloading servers
- Some websites may block automated scraping attempts
