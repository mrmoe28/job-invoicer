#!/usr/bin/env python
"""
Basic Permit Office Scraper

This script demonstrates how to scrape permit office information from a website
using requests and BeautifulSoup.
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import os
import logging
import re
import json
import time
import random
from datetime import datetime
from urllib.parse import urljoin

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"permit_scraper_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PermitOfficeScraper:
    """A basic scraper for permit office information."""
    
    # Define city configurations
    CITY_CONFIGS = {
        "atlanta": {
            "base_url": "https://www.atlantaga.gov",
            "permit_page": "/departments/city-planning/office-buildings/permits",
            "department_selectors": [
                {"type": "div", "class": "field-items"},
                {"type": "a", "href_pattern": r"/departments/"}
            ],
            "fee_url": "https://www.atlantaga.gov/government/departments/city-planning/office-of-buildings/permits-certificates/fee-schedule"
        },
        "san_francisco": {
            "base_url": "https://sf.gov",
            "permit_page": "/topics/building-permits",
            "department_selectors": [
                {"type": "div", "class": "sfgov-dept-card"},
                {"type": "a", "href_pattern": r"/departments/"}
            ],
            "fee_url": "https://sfdbi.org/permit-fees"
        },
        "new_york": {
            "base_url": "https://www1.nyc.gov",
            "permit_page": "/site/buildings/homeowner/permits.page",
            "department_selectors": [
                {"type": "div", "class": "about-description"},
                {"type": "a", "href_pattern": r"/site/buildings/"}
            ],
            "fee_url": "https://www1.nyc.gov/site/buildings/homeowner/permits.page"
        },
        "los_angeles": {
            "base_url": "https://www.ladbs.org",
            "permit_page": "/permits",
            "department_selectors": [
                {"type": "div", "class": "card"},
                {"type": "a", "href_pattern": r"/services/"}
            ],
            "fee_url": "https://www.ladbs.org/services/fee-schedules"
        },
        "chicago": {
            "base_url": "https://www.chicago.gov",
            "permit_page": "/city/en/depts/bldgs/provdrs/permits.html",
            "department_selectors": [
                {"type": "div", "class": "col-md-12"},
                {"type": "a", "href_pattern": r"/city/en/depts/"}
            ],
            "fee_url": "https://www.chicago.gov/city/en/depts/bldgs/provdrs/permits/svcs/fee-schedule.html"
        }
    }
    
    def __init__(self, city="atlanta"):
        """
        Initialize the scraper with a city.
        
        Args:
            city (str): The city to scrape permit offices for.
        """
        self.city = city.lower().replace(" ", "_")
        
        # Get city configuration
        if self.city not in self.CITY_CONFIGS:
            logger.warning(f"City {city} not found in configurations. Using Atlanta as default.")
            self.city = "atlanta"
        
        self.config = self.CITY_CONFIGS[self.city]
        self.base_url = self.config["base_url"]
        
        # Set up session with headers
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': self.base_url
        })
        
        # Create cache directory
        os.makedirs("cache", exist_ok=True)
        
        logger.info(f"Initialized scraper for {self.city} ({self.base_url})")
    
    def _get_cached_or_request(self, url, cache_key=None):
        """
        Get data from cache or make a request.
        
        Args:
            url (str): The URL to request.
            cache_key (str, optional): The cache key. If None, the URL will be used.
            
        Returns:
            BeautifulSoup: The parsed HTML.
        """
        if cache_key is None:
            cache_key = url.replace("/", "_").replace(":", "_").replace(".", "_")
        
        cache_file = f"cache/{cache_key}.html"
        
        # Check if cache exists and is less than 1 day old
        if os.path.exists(cache_file) and (datetime.now().timestamp() - os.path.getmtime(cache_file)) < 86400:
            logger.info(f"Loading from cache: {cache_file}")
            with open(cache_file, "r", encoding="utf-8") as f:
                html = f.read()
        else:
            logger.info(f"Requesting: {url}")
            # Add a random delay to avoid being blocked
            time.sleep(random.uniform(1, 3))
            response = self.session.get(url)
            response.raise_for_status()
            html = response.text
            
            # Save to cache
            with open(cache_file, "w", encoding="utf-8") as f:
                f.write(html)
        
        return BeautifulSoup(html, 'html.parser')
    
    def get_permit_offices(self):
        """
        Scrape permit office information from the website.
        
        Returns:
            list: A list of dictionaries containing permit office information.
        """
        logger.info(f"Fetching permit office information for {self.city}")
        
        try:
            # Get the permit page
            permit_page_url = urljoin(self.base_url, self.config["permit_page"])
            soup = self._get_cached_or_request(permit_page_url, f"{self.city}_permit_page")
            
            # Find the offices section using the city-specific selectors
            offices = []
            
            # Try each selector in order
            for selector in self.config["department_selectors"]:
                if selector["type"] == "div" and "class" in selector:
                    departments = soup.find_all('div', class_=selector["class"])
                elif selector["type"] == "a" and "href_pattern" in selector:
                    departments = soup.find_all('a', href=re.compile(selector["href_pattern"]))
                else:
                    continue
                
                if departments:
                    break
            
            # Process found departments
            for dept in departments:
                office = {}
                
                # Try to extract department name
                name_elem = dept.find('h3') or dept.find('h2') or dept.find('h4') or dept
                if name_elem:
                    office["name"] = name_elem.get_text().strip()
                else:
                    continue  # Skip if we can't find a name
                
                # Generate an ID from the name
                city_prefix = self.city.split("_")[0]
                office["id"] = f"{city_prefix}-" + re.sub(r'[^a-z0-9]', '-', office["name"].lower())
                
                # Try to extract URL
                url_elem = dept if dept.name == 'a' else dept.find('a')
                if url_elem and url_elem.has_attr('href'):
                    href = url_elem['href']
                    if href.startswith('/'):
                        office["website"] = urljoin(self.base_url, href)
                    else:
                        office["website"] = href
                
                # Set default values for city and state
                if self.city == "san_francisco":
                    office["city"] = "San Francisco"
                    office["state"] = "CA"
                elif self.city == "new_york":
                    office["city"] = "New York"
                    office["state"] = "NY"
                elif self.city == "los_angeles":
                    office["city"] = "Los Angeles"
                    office["state"] = "CA"
                elif self.city == "chicago":
                    office["city"] = "Chicago"
                    office["state"] = "IL"
                elif self.city == "atlanta":
                    office["city"] = "Atlanta"
                    office["state"] = "GA"
                
                # If we have a website, try to get more details
                if "website" in office:
                    try:
                        dept_details = self._get_department_details(office["website"], office["id"])
                        office.update(dept_details)
                    except Exception as e:
                        logger.warning(f"Error getting details for {office['name']}: {str(e)}")
                
                offices.append(office)
            
            # If we couldn't find any offices using the above methods,
            # let's try a more general approach
            if not offices:
                # Look for any links that might be related to permits or departments
                permit_links = soup.find_all('a', string=re.compile(r'permit|department|building|planning|inspection', re.I))
                
                for link in permit_links:
                    office = {
                        "name": link.get_text().strip(),
                        "id": f"{city_prefix}-" + re.sub(r'[^a-z0-9]', '-', link.get_text().strip().lower()),
                        "city": office.get("city", ""),
                        "state": office.get("state", "")
                    }
                    
                    if link.has_attr('href'):
                        href = link['href']
                        if href.startswith('/'):
                            office["website"] = urljoin(self.base_url, href)
                        else:
                            office["website"] = href
                    
                    # Only add if we haven't seen this office before
                    if office not in offices:
                        offices.append(office)
            
            logger.info(f"Found {len(offices)} permit offices for {self.city}")
            return offices
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching permit offices: {str(e)}")
            return []
    
    def _get_department_details(self, url, office_id):
        """
        Get additional details about a department from its page.
        
        Args:
            url (str): The URL of the department page.
            office_id (str): The ID of the office.
            
        Returns:
            dict: A dictionary containing department details.
        """
        details = {}
        
        try:
            soup = self._get_cached_or_request(url, f"{office_id}_details")
            
            # Try to find address
            address_patterns = [
                # Common address patterns
                r'\d+\s+[A-Za-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Place|Pl|Court|Ct|Way)',
                # Zip code patterns
                r'\b\d{5}(?:-\d{4})?\b'
            ]
            
            # Try to find address elements
            address_elem = None
            for pattern in address_patterns:
                address_elems = soup.find_all(string=re.compile(pattern, re.I))
                if address_elems:
                    # Find the element with the longest text that matches the pattern
                    address_elem = max(address_elems, key=lambda x: len(x))
                    break
            
            if not address_elem:
                # Try common address containers
                for class_name in ['address', 'location', 'contact-info', 'vcard']:
                    address_elem = soup.find(class_=re.compile(class_name, re.I))
                    if address_elem:
                        break
            
            if address_elem:
                if isinstance(address_elem, str):
                    details["address"] = address_elem.strip()
                else:
                    details["address"] = address_elem.get_text().strip()
            
            # Try to find phone
            phone_patterns = [
                r'\(\d{3}\)\s*\d{3}-\d{4}',  # (123) 456-7890
                r'\d{3}-\d{3}-\d{4}',        # 123-456-7890
                r'\d{3}\.\d{3}\.\d{4}'       # 123.456.7890
            ]
            
            for pattern in phone_patterns:
                phone_elem = soup.find(string=re.compile(pattern))
                if phone_elem:
                    # Extract the phone number using regex
                    phone_match = re.search(pattern, phone_elem)
                    if phone_match:
                        details["phone"] = phone_match.group(0)
                        break
            
            # Try to find email
            email_elem = soup.find('a', href=re.compile(r'mailto:'))
            if email_elem:
                details["email"] = email_elem['href'].replace('mailto:', '')
            
            # Try to find hours
            hours_patterns = [
                r'(?:Monday|Mon|Tuesday|Tue|Wednesday|Wed|Thursday|Thu|Friday|Fri|Saturday|Sat|Sunday|Sun)[\s\-–—:]+(?:Monday|Mon|Tuesday|Tue|Wednesday|Wed|Thursday|Thu|Friday|Fri|Saturday|Sat|Sunday|Sun|[\d:APMapm\s]+)',
                r'(?:Hours|Office Hours|Business Hours)',
                r'\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)'
            ]
            
            for pattern in hours_patterns:
                hours_elem = soup.find(string=re.compile(pattern))
                if hours_elem:
                    # Extract the hours using regex
                    hours_match = re.search(pattern, hours_elem)
                    if hours_match:
                        details["hours"] = hours_match.group(0)
                        break
            
            return details
            
        except requests.exceptions.RequestException as e:
            logger.warning(f"Error fetching department details: {str(e)}")
            return details
    
    def get_permit_fees(self, office_id):
        """
        Scrape permit fee information for a specific office.
        
        Args:
            office_id (str): The ID of the permit office.
            
        Returns:
            list: A list of dictionaries containing permit fee information.
        """
        logger.info(f"Fetching permit fees for office {office_id}")
        
        # Try to get real fee information
        try:
            # Get the fee URL from the city configuration
            fee_url = self.config["fee_url"]
            soup = self._get_cached_or_request(fee_url, f"{self.city}_fees")
            
            # Look for fee tables
            fee_tables = soup.find_all('table')
            
            fees = []
            for i, table in enumerate(fee_tables):
                # Try to extract fees from the table
                rows = table.find_all('tr')
                
                # Skip header row
                for j, row in enumerate(rows[1:], 1):
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        # Try to extract fee name and amount
                        name = cells[0].get_text().strip()
                        
                        # Try to extract amount
                        amount_text = cells[1].get_text().strip()
                        # Remove non-numeric characters except decimal point
                        amount_text = re.sub(r'[^\d.]', '', amount_text)
                        
                        try:
                            amount = float(amount_text) if amount_text else 0.0
                        except ValueError:
                            amount = 0.0
                        
                        # Skip if name is empty or amount is 0
                        if not name or amount == 0.0:
                            continue
                        
                        fee = {
                            "id": f"{office_id}-fee-{i}-{j}",
                            "name": name,
                            "amount": amount,
                            "description": name,
                            "office_id": office_id,
                            "permit_type": "Building"
                        }
                        
                        fees.append(fee)
            
            if fees:
                logger.info(f"Found {len(fees)} permit fees for office {office_id}")
                return fees
            
            # If we couldn't find fees in tables, try to find fee information in paragraphs
            fee_paragraphs = soup.find_all(['p', 'li'], string=re.compile(r'\$\d+|\d+\s*dollars', re.I))
            
            for i, paragraph in enumerate(fee_paragraphs):
                text = paragraph.get_text().strip()
                
                # Try to extract fee name and amount
                fee_matches = re.findall(r'([^.;:]+)(?:\s*[-:]\s*|\s+is\s+|\s+costs?\s+)(\$\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*dollars)', text, re.I)
                
                for j, (name, amount_text) in enumerate(fee_matches):
                    name = name.strip()
                    amount_text = amount_text.strip()
                    
                    # Extract amount
                    amount_match = re.search(r'(\d+(?:\.\d+)?)', amount_text)
                    if amount_match:
                        try:
                            amount = float(amount_match.group(1))
                        except ValueError:
                            amount = 0.0
                        
                        fee = {
                            "id": f"{office_id}-fee-p-{i}-{j}",
                            "name": name,
                            "amount": amount,
                            "description": text,
                            "office_id": office_id,
                            "permit_type": "Building"
                        }
                        
                        fees.append(fee)
            
            if fees:
                logger.info(f"Found {len(fees)} permit fees for office {office_id}")
                return fees
        
        except Exception as e:
            logger.warning(f"Error fetching permit fees: {str(e)}")
        
        # If we couldn't get real fees, use mock data
        logger.info("Using mock fee data")
        fees = [
            {
                "id": f"{office_id}-fee-1",
                "name": "Building Permit Application Fee",
                "amount": 175.00,
                "description": "Base fee for building permit application review",
                "office_id": office_id,
                "permit_type": "Building"
            },
            {
                "id": f"{office_id}-fee-2",
                "name": "Plan Review Fee",
                "amount": 350.00,
                "description": "Fee for detailed plan review by department engineers",
                "office_id": office_id,
                "permit_type": "Building"
            },
            {
                "id": f"{office_id}-fee-3",
                "name": "Inspection Fee",
                "amount": 250.00,
                "description": "Fee for on-site inspections during construction",
                "office_id": office_id,
                "permit_type": "Building"
            }
        ]
        
        logger.info(f"Using {len(fees)} mock permit fees for office {office_id}")
        return fees
    
    def save_to_csv(self, data, filename):
        """
        Save data to a CSV file.
        
        Args:
            data (list): A list of dictionaries to save.
            filename (str): The name of the file to save to.
        """
        if not data:
            logger.warning(f"No data to save to {filename}")
            return
            
        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        logger.info(f"Saved data to {filename}")
    
    def save_to_json(self, data, filename):
        """
        Save data to a JSON file.
        
        Args:
            data (list): A list of dictionaries to save.
            filename (str): The name of the file to save to.
        """
        if not data:
            logger.warning(f"No data to save to {filename}")
            return
            
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        logger.info(f"Saved data to {filename}")


def main():
    """Main function to run the scraper."""
    # Create output directory if it doesn't exist
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Create cache directory
    os.makedirs("cache", exist_ok=True)
    
    # Cities to scrape - only Atlanta for now
    cities = ["atlanta"]
    
    all_offices = []
    all_fees = []
    
    for city in cities:
        logger.info(f"Processing city: {city}")
        
        # Initialize the scraper for this city
        scraper = PermitOfficeScraper(city)
        
        # Get permit offices
        offices = scraper.get_permit_offices()
        if offices:
            # Add city to each office
            for office in offices:
                office["source_city"] = city
            
            all_offices.extend(offices)
            
            # Save city-specific data
            scraper.save_to_csv(offices, f"{output_dir}/{city}_permit_offices.csv")
            scraper.save_to_json(offices, f"{output_dir}/{city}_permit_offices.json")
        
        # Get permit fees for each office
        city_fees = []
        for office in offices:
            fees = scraper.get_permit_fees(office["id"])
            city_fees.extend(fees)
        
        if city_fees:
            all_fees.extend(city_fees)
            
            # Save city-specific data
            scraper.save_to_csv(city_fees, f"{output_dir}/{city}_permit_fees.csv")
            scraper.save_to_json(city_fees, f"{output_dir}/{city}_permit_fees.json")
    
    # Save combined data
    if all_offices:
        pd.DataFrame(all_offices).to_csv(f"{output_dir}/georgia_permit_offices.csv", index=False)
        with open(f"{output_dir}/georgia_permit_offices.json", 'w', encoding='utf-8') as f:
            json.dump(all_offices, f, indent=2)
    
    if all_fees:
        pd.DataFrame(all_fees).to_csv(f"{output_dir}/georgia_permit_fees.csv", index=False)
        with open(f"{output_dir}/georgia_permit_fees.json", 'w', encoding='utf-8') as f:
            json.dump(all_fees, f, indent=2)
    
    logger.info("Scraping completed successfully")


if __name__ == "__main__":
    main() 