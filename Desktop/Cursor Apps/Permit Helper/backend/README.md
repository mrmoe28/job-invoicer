# PermitHelper Backend

This is the backend for the PermitHelper application, which provides APIs for scraping and retrieving building permit data from various sources.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate the virtual environment:

```bash
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file with the following variables:

```
PORT=5000
DEBUG=True
```

## Running the Application

```bash
python app.py
```

The API will be available at <http://localhost:5000>

## API Endpoints

### GET /api/permits

Get permit data for a specific address.

**Query Parameters:**

- `address` (required): The address to search for permits
- `city` (optional): The city
- `state` (optional): The state

**Example:**

```
GET /api/permits?address=123 Main St&city=San Francisco&state=CA
```

### GET /api/sources

Get available permit data sources.

**Example:**

```
GET /api/sources
```

## Adding New Scrapers

To add a new scraper for a different city or data source:

1. Create a new method in the `PermitScraper` class in `scrapers/permit_scraper.py`
2. Add the new source to the `sources` dictionary in the `__init__` method
3. Update the `_determine_source` method to recognize the new city/state combination
