#!/usr/bin/env python
"""
Scrapy Spider for Permit Offices

This script demonstrates how to use Scrapy to crawl and extract permit office information.
"""

import scrapy
import json
import os
from datetime import datetime


class PermitOfficeSpider(scrapy.Spider):
    """Spider for crawling permit office information."""
    
    name = "permit_offices"
    
    def __init__(self, city=None, state=None, *args, **kwargs):
        """
        Initialize the spider.
        
        Args:
            city (str, optional): The city to search for.
            state (str, optional): The state to search for.
        """
        super(PermitOfficeSpider, self).__init__(*args, **kwargs)
        self.city = city
        self.state = state
        
        # Set the start URL based on city and state
        if city and state:
            self.start_urls = [f"https://example.com/permit-offices?city={city}&state={state}"]
        else:
            self.start_urls = ["https://example.com/permit-offices"]
    
    def parse(self, response):
        """
        Parse the response and extract permit office information.
        
        Args:
            response: The response object.
            
        Yields:
            dict: A dictionary containing permit office information.
        """
        # In a real implementation, you would extract data from the response
        # For demonstration, we'll yield mock data
        
        # Example of how you would extract data in a real implementation:
        # for office in response.css('.office-card'):
        #     yield {
        #         'id': office.css('.office-id::text').get(),
        #         'name': office.css('.office-name::text').get(),
        #         'address': office.css('.office-address::text').get(),
        #         'city': office.css('.office-city::text').get(),
        #         'state': office.css('.office-state::text').get(),
        #         'zip': office.css('.office-zip::text').get(),
        #         'phone': office.css('.office-phone::text').get(),
        #         'email': office.css('.office-email::text').get(),
        #         'website': office.css('.office-website::attr(href)').get(),
        #         'hours': office.css('.office-hours::text').get(),
        #     }
        
        # Mock data for demonstration
        yield {
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
        
        yield {
            "id": "sf-planning",
            "name": "San Francisco Planning Department",
            "address": "49 South Van Ness Avenue, Suite 1400",
            "city": "San Francisco",
            "state": "CA",
            "zip": "94103",
            "phone": "(628) 652-7600",
            "email": "pic@sfgov.org",
            "website": "https://sfplanning.org",
            "hours": "Monday-Friday: 8:00 AM - 5:00 PM"
        }
        
        # In a real implementation, you might follow links to detail pages
        # for office in response.css('.office-card'):
        #     detail_url = office.css('.office-detail-link::attr(href)').get()
        #     if detail_url:
        #         yield response.follow(detail_url, self.parse_office_detail)
    
    def parse_office_detail(self, response):
        """
        Parse the office detail page.
        
        Args:
            response: The response object.
            
        Yields:
            dict: A dictionary containing detailed permit office information.
        """
        # This is a mock implementation
        # In a real implementation, you would extract detailed data from the response
        
        # Example of how you would extract data in a real implementation:
        # yield {
        #     'id': response.css('.office-id::text').get(),
        #     'name': response.css('.office-name::text').get(),
        #     'description': response.css('.office-description::text').get(),
        #     'services': response.css('.office-services li::text').getall(),
        #     'fees': [
        #         {
        #             'name': fee.css('.fee-name::text').get(),
        #             'amount': fee.css('.fee-amount::text').get(),
        #             'description': fee.css('.fee-description::text').get()
        #         }
        #         for fee in response.css('.fee-item')
        #     ]
        # }
        
        # Mock data for demonstration
        yield {
            "id": "sf-dbi-detail",
            "name": "San Francisco Department of Building Inspection",
            "description": "The Department of Building Inspection (DBI) ensures the safe and effective construction of buildings and structures in San Francisco.",
            "services": [
                "Building Permits",
                "Electrical Permits",
                "Plumbing Permits",
                "Inspections",
                "Code Enforcement"
            ],
            "fees": [
                {
                    "name": "Building Permit Application Fee",
                    "amount": 175.00,
                    "description": "Base fee for building permit application review"
                },
                {
                    "name": "Plan Review Fee",
                    "amount": 350.00,
                    "description": "Fee for detailed plan review by department engineers"
                }
            ]
        }


# This is not part of the Spider class, but a helper function to run the spider
def run_spider():
    """Run the spider and save the results to a JSON file."""
    from scrapy.crawler import CrawlerProcess
    from scrapy.utils.project import get_project_settings
    
    # Create output directory if it doesn't exist
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Set up the settings
    settings = get_project_settings()
    settings.update({
        'FEED_FORMAT': 'json',
        'FEED_URI': f"{output_dir}/scrapy_permit_offices_{datetime.now().strftime('%Y%m%d')}.json",
        'LOG_LEVEL': 'INFO'
    })
    
    # Create and start the crawler process
    process = CrawlerProcess(settings)
    process.crawl(PermitOfficeSpider, city="San Francisco", state="CA")
    process.start()  # This will block until the crawling is finished


if __name__ == "__main__":
    run_spider() 