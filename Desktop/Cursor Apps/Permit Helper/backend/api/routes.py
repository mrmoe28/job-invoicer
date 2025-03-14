from flask import Blueprint, jsonify, request
from scrapers.permit_scraper import PermitScraper
from scrapers.office_scraper import OfficeScraperFactory

api_bp = Blueprint('api', __name__)

@api_bp.route('/permits', methods=['GET'])
def get_permits():
    """
    Get permit data for a specific address
    Query parameters:
    - address: The address to search for permits
    - city: The city (optional)
    - state: The state (optional)
    """
    address = request.args.get('address')
    city = request.args.get('city')
    state = request.args.get('state')
    
    if not address:
        return jsonify({
            "status": "error",
            "message": "Address is required"
        }), 400
    
    try:
        scraper = PermitScraper()
        permits = scraper.get_permits(address, city, state)
        
        return jsonify({
            "status": "success",
            "data": permits
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api_bp.route('/offices', methods=['GET'])
def get_offices():
    """
    Get permit offices near a specific address
    Query parameters:
    - address: The address to search for offices
    - city: The city (optional)
    - state: The state (optional)
    - radius: Search radius in miles (optional, default: 25)
    """
    address = request.args.get('address')
    city = request.args.get('city')
    state = request.args.get('state')
    radius = request.args.get('radius', '25')
    
    if not address:
        return jsonify({
            "status": "error",
            "message": "Address is required"
        }), 400
    
    try:
        radius = float(radius)
    except ValueError:
        return jsonify({
            "status": "error",
            "message": "Radius must be a number"
        }), 400
    
    try:
        # Create the appropriate scraper based on location
        factory = OfficeScraperFactory()
        scraper = factory.create_scraper(city, state)
        offices = scraper.get_offices(address, city, state, radius)
        
        return jsonify({
            "status": "success",
            "data": offices
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api_bp.route('/fees', methods=['GET'])
def get_fees():
    """
    Get permit fees for a specific office and permit type
    Query parameters:
    - office_id: The ID of the permit office
    - permit_type: The type of permit (optional)
    """
    office_id = request.args.get('office_id')
    permit_type = request.args.get('permit_type')
    
    if not office_id:
        return jsonify({
            "status": "error",
            "message": "Office ID is required"
        }), 400
    
    try:
        # Create the appropriate scraper based on office ID
        factory = OfficeScraperFactory()
        scraper = factory.create_scraper_by_office_id(office_id)
        fees = scraper.get_fees(office_id, permit_type)
        
        return jsonify({
            "status": "success",
            "data": fees
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api_bp.route('/instructions', methods=['GET'])
def get_instructions():
    """
    Get permit application instructions for a specific office and permit type
    Query parameters:
    - office_id: The ID of the permit office
    - permit_type: The type of permit (optional)
    """
    office_id = request.args.get('office_id')
    permit_type = request.args.get('permit_type')
    
    if not office_id:
        return jsonify({
            "status": "error",
            "message": "Office ID is required"
        }), 400
    
    try:
        # Create the appropriate scraper based on office ID
        factory = OfficeScraperFactory()
        scraper = factory.create_scraper_by_office_id(office_id)
        instructions = scraper.get_instructions(office_id, permit_type)
        
        return jsonify({
            "status": "success",
            "data": instructions
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api_bp.route('/forms', methods=['GET'])
def get_forms():
    """
    Get permit application forms for a specific office and permit type
    Query parameters:
    - office_id: The ID of the permit office
    - permit_type: The type of permit (optional)
    """
    office_id = request.args.get('office_id')
    permit_type = request.args.get('permit_type')
    
    if not office_id:
        return jsonify({
            "status": "error",
            "message": "Office ID is required"
        }), 400
    
    try:
        # Create the appropriate scraper based on office ID
        factory = OfficeScraperFactory()
        scraper = factory.create_scraper_by_office_id(office_id)
        forms = scraper.get_forms(office_id, permit_type)
        
        return jsonify({
            "status": "success",
            "data": forms
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api_bp.route('/sources', methods=['GET'])
def get_sources():
    """Get available permit data sources"""
    # This would typically come from a database
    sources = [
        {"id": "sf", "name": "San Francisco", "state": "CA"},
        {"id": "nyc", "name": "New York City", "state": "NY"},
        {"id": "la", "name": "Los Angeles", "state": "CA"},
        {"id": "chicago", "name": "Chicago", "state": "IL"},
        {"id": "houston", "name": "Houston", "state": "TX"},
        {"id": "phoenix", "name": "Phoenix", "state": "AZ"},
        {"id": "philadelphia", "name": "Philadelphia", "state": "PA"},
        {"id": "san_antonio", "name": "San Antonio", "state": "TX"},
        {"id": "san_diego", "name": "San Diego", "state": "CA"},
        {"id": "dallas", "name": "Dallas", "state": "TX"}
    ]
    
    return jsonify({
        "status": "success",
        "data": sources
    }) 