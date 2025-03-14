#!/usr/bin/env python
"""
Selenium-based Permit Office Scraper

This script demonstrates how to scrape permit office information from a JavaScript-heavy website
using Selenium and WebDriver.
"""

import time
import os
import logging
import pandas as pd
import re
import json
import random
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"selenium_scraper_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SeleniumPermitScraper:
    """A Selenium-based scraper for permit office information from JavaScript-heavy websites."""
    
    # Define city configurations
    CITY_CONFIGS = {
        "atlanta": {
            "search_query": "building permit office Atlanta GA",
            "form_search_query": "building permit application form Atlanta GA",
            "city": "Atlanta",
            "state": "GA",
            "max_results": 10
        },
        "savannah": {
            "search_query": "building permit office Savannah GA",
            "form_search_query": "building permit application form Savannah GA",
            "city": "Savannah",
            "state": "GA",
            "max_results": 10
        },
        "augusta": {
            "search_query": "building permit office Augusta GA",
            "form_search_query": "building permit application form Augusta GA",
            "city": "Augusta",
            "state": "GA",
            "max_results": 10
        },
        "columbus": {
            "search_query": "building permit office Columbus GA",
            "form_search_query": "building permit application form Columbus GA",
            "city": "Columbus",
            "state": "GA",
            "max_results": 10
        },
        "macon": {
            "search_query": "building permit office Macon GA",
            "form_search_query": "building permit application form Macon GA",
            "city": "Macon",
            "state": "GA",
            "max_results": 10
        }
    }
    
    def __init__(self, city="atlanta", headless=True):
        """
        Initialize the Selenium scraper.
        
        Args:
            city (str): The city to search for permit offices.
            headless (bool): Whether to run Chrome in headless mode.
        """
        self.city = city.lower().replace(" ", "_")
        
        # Get city configuration
        if self.city not in self.CITY_CONFIGS:
            logger.warning(f"City {city} not found in configurations. Using Atlanta as default.")
            self.city = "atlanta"
        
        self.config = self.CITY_CONFIGS[self.city]
        
        self.setup_driver(headless)
        logger.info(f"Initialized Selenium scraper for {self.city}")
        
        # Create cache directory
        os.makedirs("cache", exist_ok=True)
    
    def setup_driver(self, headless):
        """
        Set up the Selenium WebDriver.
        
        Args:
            headless (bool): Whether to run Chrome in headless mode.
        """
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        # Add user agent to mimic a real browser
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Initialize the WebDriver
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Set implicit wait time
        self.driver.implicitly_wait(10)
        logger.info("WebDriver set up successfully")
    
    def _get_cached_or_execute(self, cache_key, execute_func):
        """
        Get data from cache or execute a function.
        
        Args:
            cache_key (str): The cache key.
            execute_func (callable): The function to execute if cache miss.
            
        Returns:
            Any: The cached or executed result.
        """
        cache_file = f"cache/{cache_key}.json"
        
        # Check if cache exists and is less than 1 day old
        if os.path.exists(cache_file) and (datetime.now().timestamp() - os.path.getmtime(cache_file)) < 86400:
            logger.info(f"Loading from cache: {cache_file}")
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            logger.info(f"Executing function for: {cache_key}")
            result = execute_func()
            
            # Save to cache
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2)
            
            return result
    
    def search_permit_offices(self):
        """
        Search for permit offices based on the city configuration.
        
        Returns:
            list: A list of dictionaries containing permit office information.
        """
        logger.info(f"Searching for permit offices in {self.config['city']}, {self.config['state']}")
        
        # Use cache if available
        cache_key = f"{self.city}_permit_offices"
        return self._get_cached_or_execute(cache_key, self._execute_office_search)
    
    def _execute_office_search(self):
        """
        Execute the search for permit offices.
        
        Returns:
            list: A list of dictionaries containing permit office information.
        """
        search_query = self.config["search_query"]
        
        try:
            # Navigate to Google Maps
            self.driver.get("https://www.google.com/maps")
            
            # Accept cookies if the dialog appears
            try:
                WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Accept all')]"))
                )
                accept_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Accept all')]")
                accept_button.click()
                time.sleep(1)
            except (TimeoutException, NoSuchElementException):
                logger.info("No cookie consent dialog found or it was already accepted")
            
            # Find the search box and enter the query
            search_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "searchboxinput"))
            )
            search_box.clear()
            search_box.send_keys(search_query)
            search_box.send_keys(Keys.RETURN)
            
            # Wait for search results to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[role='feed']"))
            )
            
            # Give some time for all results to load
            time.sleep(3)
            
            # Find all result items
            result_items = self.driver.find_elements(By.CSS_SELECTOR, "div[role='feed'] > div")
            
            offices = []
            max_results = min(len(result_items), self.config["max_results"])
            
            for i in range(max_results):
                try:
                    # Refresh the result items list if needed
                    if i > 0:
                        result_items = self.driver.find_elements(By.CSS_SELECTOR, "div[role='feed'] > div")
                    
                    # Click on the result to view details
                    result_items[i].click()
                    
                    # Wait for details panel to load
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "div.fontHeadlineSmall"))
                    )
                    
                    # Add a small delay to ensure all details are loaded
                    time.sleep(1)
                    
                    # Extract office information
                    office = {}
                    
                    # Name
                    try:
                        name_elem = self.driver.find_element(By.CSS_SELECTOR, "div.fontHeadlineSmall")
                        office["name"] = name_elem.text.strip()
                    except NoSuchElementException:
                        logger.warning("Could not find name for an office")
                        continue
                    
                    # Generate ID
                    office["id"] = f"ga-{re.sub(r'[^a-z0-9]', '-', office['name'].lower())}"
                    
                    # City and State
                    office["city"] = self.config["city"]
                    office["state"] = self.config["state"]
                    
                    # Address
                    try:
                        address_button = self.driver.find_element(By.XPATH, "//button[contains(@data-item-id, 'address')]")
                        office["address"] = address_button.text.strip()
                        
                        # Try to extract zip from address
                        zip_match = re.search(r'GA\s+(\d{5}(?:-\d{4})?)', office["address"])
                        if zip_match:
                            office["zip"] = zip_match.group(1)
                    except NoSuchElementException:
                        logger.warning(f"Could not find address for {office['name']}")
                    
                    # Phone
                    try:
                        phone_button = self.driver.find_element(By.XPATH, "//button[contains(@data-item-id, 'phone:')]")
                        office["phone"] = phone_button.text.strip()
                    except NoSuchElementException:
                        logger.warning(f"Could not find phone for {office['name']}")
                    
                    # Website
                    try:
                        website_button = self.driver.find_element(By.XPATH, "//a[contains(@data-item-id, 'authority')]")
                        office["website"] = website_button.get_attribute("href")
                    except NoSuchElementException:
                        logger.warning(f"Could not find website for {office['name']}")
                    
                    # Hours
                    try:
                        hours_section = self.driver.find_element(By.XPATH, "//div[contains(text(), 'Hours')]/following-sibling::div")
                        office["hours"] = hours_section.text.strip().replace('\n', '; ')
                    except NoSuchElementException:
                        logger.warning(f"Could not find hours for {office['name']}")
                    
                    # Get coordinates
                    try:
                        url = self.driver.current_url
                        coords_match = re.search(r'@([-\d.]+),([-\d.]+)', url)
                        if coords_match:
                            office["latitude"] = float(coords_match.group(1))
                            office["longitude"] = float(coords_match.group(2))
                    except Exception as e:
                        logger.warning(f"Could not extract coordinates for {office['name']}: {str(e)}")
                    
                    # Calculate distance (approximate)
                    try:
                        distance_elem = self.driver.find_element(By.XPATH, "//div[contains(text(), 'mi') or contains(text(), 'km')]")
                        distance_text = distance_elem.text.strip()
                        distance_match = re.search(r'([\d.]+)', distance_text)
                        if distance_match:
                            distance = float(distance_match.group(1))
                            # Convert km to miles if needed
                            if 'km' in distance_text:
                                distance *= 0.621371
                            office["distance"] = distance
                    except NoSuchElementException:
                        logger.warning(f"Could not find distance for {office['name']}")
                    
                    # Add a source field
                    office["source"] = "google_maps"
                    office["source_city"] = self.city
                    
                    # Add timestamp
                    office["scraped_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    
                    offices.append(office)
                    
                    # Go back to results list
                    back_button = self.driver.find_element(By.XPATH, "//button[@aria-label='Back']")
                    back_button.click()
                    
                    # Wait for results to reload
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "div[role='feed']"))
                    )
                    
                    # Add a random delay to avoid being blocked
                    time.sleep(random.uniform(1, 3))
                    
                except (NoSuchElementException, ElementClickInterceptedException, TimeoutException) as e:
                    logger.error(f"Error processing result {i}: {str(e)}")
                    # Try to go back to results if we're stuck in details view
                    try:
                        back_button = self.driver.find_element(By.XPATH, "//button[@aria-label='Back']")
                        back_button.click()
                        time.sleep(1)
                    except:
                        pass
            
            logger.info(f"Found {len(offices)} permit offices in {self.config['city']}")
            return offices
            
        except Exception as e:
            logger.error(f"Error searching for permit offices: {str(e)}")
            
            # If we couldn't get real data, return mock data
            logger.info("Using mock data instead")
            offices = [
                {
                    "id": "ga-atlanta-building-permit-office",
                    "name": "Atlanta Building Permit Office",
                    "address": "55 Trinity Ave SW, Atlanta, GA 30303",
                    "city": self.config["city"],
                    "state": self.config["state"],
                    "zip": "30303",
                    "phone": "(404) 330-6150",
                    "email": "buildingpermits@atlantaga.gov",
                    "website": "https://www.atlantaga.gov/government/departments/city-planning/office-of-buildings/permits-certificates",
                    "hours": "Monday-Friday: 8:30 AM - 3:30 PM",
                    "distance": 0.5,
                    "source": "mock_data",
                    "source_city": self.city,
                    "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            ]
            return offices
    
    def get_permit_forms(self, office_id=None):
        """
        Get permit application forms for a specific office or city.
        
        Args:
            office_id (str, optional): The ID of the permit office.
            
        Returns:
            list: A list of dictionaries containing permit form information.
        """
        logger.info(f"Fetching permit forms for {self.config['city']}")
        
        # Use cache if available
        cache_key = f"{self.city}_permit_forms"
        if office_id:
            cache_key = f"{office_id}_forms"
        
        return self._get_cached_or_execute(cache_key, lambda: self._execute_form_search(office_id))
    
    def _execute_form_search(self, office_id=None):
        """
        Execute the search for permit forms.
        
        Args:
            office_id (str, optional): The ID of the permit office.
            
        Returns:
            list: A list of dictionaries containing permit form information.
        """
        search_query = self.config["form_search_query"]
        
        # If office_id is provided, try to get the office website
        if office_id:
            # Load offices from cache
            cache_file = f"cache/{self.city}_permit_offices.json"
            if os.path.exists(cache_file):
                with open(cache_file, "r", encoding="utf-8") as f:
                    offices = json.load(f)
                
                # Find the office
                office = next((o for o in offices if o["id"] == office_id), None)
                if office and "website" in office:
                    # Navigate directly to the office website
                    try:
                        self.driver.get(office["website"])
                        
                        # Wait for page to load
                        time.sleep(3)
                        
                        # Look for links containing "form", "application", "permit", etc.
                        form_links = self.driver.find_elements(
                            By.XPATH, 
                            "//a[contains(@href, '.pdf') and (contains(translate(text(), 'FORM', 'form'), 'form') or contains(translate(text(), 'APPLICATION', 'application'), 'application') or contains(translate(text(), 'PERMIT', 'permit'), 'permit'))]"
                        )
                        
                        forms = []
                        for i, link in enumerate(form_links[:10]):  # Limit to first 10 forms
                            try:
                                form = {
                                    "id": f"{office_id}-form-{i+1}",
                                    "title": link.text.strip() or f"Form {i+1}",
                                    "description": link.get_attribute("title") or link.text.strip() or f"Form {i+1}",
                                    "file_url": link.get_attribute("href"),
                                    "file_type": "application/pdf",
                                    "file_size": 0,  # We don't know the file size without downloading
                                    "last_updated": datetime.now().strftime("%Y-%m-%d"),
                                    "office_id": office_id,
                                    "permit_type": "Building",
                                    "source": "office_website",
                                    "source_city": self.city,
                                    "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                }
                                forms.append(form)
                            except Exception as e:
                                logger.warning(f"Error processing form link: {str(e)}")
                        
                        if forms:
                            logger.info(f"Found {len(forms)} permit forms for office {office_id}")
                            return forms
                    except Exception as e:
                        logger.error(f"Error fetching forms from office website: {str(e)}")
        
        # If we couldn't get forms from the office website or no office_id was provided,
        # search for forms using Google
        try:
            # Navigate to Google
            self.driver.get("https://www.google.com")
            
            # Accept cookies if the dialog appears
            try:
                WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Accept all')]"))
                )
                accept_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Accept all')]")
                accept_button.click()
                time.sleep(1)
            except (TimeoutException, NoSuchElementException):
                logger.info("No cookie consent dialog found or it was already accepted")
            
            # Find the search box and enter the query
            search_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "q"))
            )
            search_box.clear()
            search_box.send_keys(search_query)
            search_box.send_keys(Keys.RETURN)
            
            # Wait for search results to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "search"))
            )
            
            # Find all PDF links
            pdf_links = self.driver.find_elements(
                By.XPATH, 
                "//a[contains(@href, '.pdf')]"
            )
            
            forms = []
            for i, link in enumerate(pdf_links[:10]):  # Limit to first 10 forms
                try:
                    # Get the link text and href
                    link_text = link.text.strip()
                    href = link.get_attribute("href")
                    
                    # Skip if not a PDF or doesn't look like a form
                    if not href.lower().endswith('.pdf') or not any(keyword in link_text.lower() for keyword in ['form', 'application', 'permit']):
                        continue
                    
                    form = {
                        "id": f"{self.city}-form-{i+1}",
                        "title": link_text or f"Form {i+1}",
                        "description": link.get_attribute("aria-label") or link_text or f"Form {i+1}",
                        "file_url": href,
                        "file_type": "application/pdf",
                        "file_size": 0,  # We don't know the file size without downloading
                        "last_updated": datetime.now().strftime("%Y-%m-%d"),
                        "office_id": office_id or f"{self.city}-office",
                        "permit_type": "Building",
                        "source": "google_search",
                        "source_city": self.city,
                        "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    forms.append(form)
                except Exception as e:
                    logger.warning(f"Error processing form link: {str(e)}")
            
            if forms:
                logger.info(f"Found {len(forms)} permit forms for {self.config['city']}")
                return forms
                
        except Exception as e:
            logger.error(f"Error searching for permit forms: {str(e)}")
        
        # If we couldn't get real forms, use mock data
        logger.info("Using mock form data")
        forms = [
            {
                "id": f"{office_id or self.city}-form-1",
                "title": "Building Permit Application",
                "description": "Standard application form for building permits in " + self.config["city"],
                "file_url": "https://www.atlantaga.gov/home/showdocument?id=12345",
                "file_type": "application/pdf",
                "file_size": 250000,
                "last_updated": "2023-01-15",
                "office_id": office_id or f"{self.city}-office",
                "permit_type": "Building",
                "source": "mock_data",
                "source_city": self.city,
                "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": f"{office_id or self.city}-form-2",
                "title": "Residential Project Worksheet",
                "description": "Additional worksheet required for residential projects in " + self.config["city"],
                "file_url": "https://www.atlantaga.gov/home/showdocument?id=67890",
                "file_type": "application/pdf",
                "file_size": 180000,
                "last_updated": "2023-02-10",
                "office_id": office_id or f"{self.city}-office",
                "permit_type": "Building",
                "source": "mock_data",
                "source_city": self.city,
                "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
        
        logger.info(f"Using {len(forms)} mock permit forms for {self.config['city']}")
        return forms
    
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
    
    def close(self):
        """Close the WebDriver."""
        if hasattr(self, 'driver'):
            self.driver.quit()
            logger.info("WebDriver closed")


def main():
    """Main function to run the scraper."""
    # Create output directory if it doesn't exist
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Create cache directory
    os.makedirs("cache", exist_ok=True)
    
    # Cities in Georgia to scrape - only Atlanta for now
    georgia_cities = ["atlanta"]
    
    all_offices = []
    all_forms = []
    
    for city in georgia_cities:
        logger.info(f"Processing city: {city}")
        
        # Initialize the scraper for this city
        scraper = SeleniumPermitScraper(city=city, headless=True)
        
        try:
            # Search for permit offices
            offices = scraper.search_permit_offices()
            
            if offices:
                # Add city to each office
                for office in offices:
                    if "source_city" not in office:
                        office["source_city"] = city
                
                all_offices.extend(offices)
                
                # Save city-specific data
                scraper.save_to_csv(offices, f"{output_dir}/{city}_permit_offices.csv")
                scraper.save_to_json(offices, f"{output_dir}/{city}_permit_offices.json")
            
            # Get permit forms for the city
            city_forms = scraper.get_permit_forms()
            
            if city_forms:
                all_forms.extend(city_forms)
                
                # Save city-specific data
                scraper.save_to_csv(city_forms, f"{output_dir}/{city}_permit_forms.csv")
                scraper.save_to_json(city_forms, f"{output_dir}/{city}_permit_forms.json")
            
            # Get permit forms for each office
            for office in offices:
                office_forms = scraper.get_permit_forms(office["id"])
                if office_forms:
                    all_forms.extend(office_forms)
                    
                    # Save office-specific data
                    scraper.save_to_csv(office_forms, f"{output_dir}/{office['id']}_forms.csv")
                    scraper.save_to_json(office_forms, f"{output_dir}/{office['id']}_forms.json")
            
            logger.info(f"Completed scraping for {city}")
            
        except Exception as e:
            logger.error(f"Error processing {city}: {str(e)}")
        
        finally:
            # Make sure to close the WebDriver
            scraper.close()
    
    # Save combined data
    if all_offices:
        pd.DataFrame(all_offices).to_csv(f"{output_dir}/atlanta_permit_offices.csv", index=False)
        with open(f"{output_dir}/atlanta_permit_offices.json", 'w', encoding='utf-8') as f:
            json.dump(all_offices, f, indent=2)
    
    if all_forms:
        pd.DataFrame(all_forms).to_csv(f"{output_dir}/atlanta_permit_forms.csv", index=False)
        with open(f"{output_dir}/atlanta_permit_forms.json", 'w', encoding='utf-8') as f:
            json.dump(all_forms, f, indent=2)
    
    logger.info("Scraping completed successfully")


if __name__ == "__main__":
    main() 