# Solar PDF Analysis Features

## Overview

The ConstructFlow CRM now includes advanced PDF viewing and analysis capabilities specifically designed for solar installation documents. This feature allows you to extract important project data directly from PDF plansets and installation documents.

## Key Features

### 1. Advanced PDF Viewer

- **High-quality rendering** using PDF.js
- **Zoom controls**: Zoom in/out, reset, and pan navigation
- **Page navigation**: Jump to specific pages, navigate with arrows
- **Page selection**: Select specific pages for targeted analysis
- **Full-screen viewing** with professional dark theme

### 2. Intelligent Data Extraction

The system can automatically identify and extract:

#### Customer Information

- **Homeowner Name**: Identifies property owner from various document formats
- **Phone Number**: Extracts contact numbers in multiple formats
- **Address**: Parses property addresses including street, city details

#### System Specifications

- **Number of Panels**: Counts solar panels/modules from technical specifications
- **System Size**: Identifies system capacity (kW ratings)
- **Battery Type**: Detects battery storage systems (Tesla, LG, Enphase, etc.)
- **Inverter Type**: Identifies inverter manufacturers and models

#### Technical Details

- **Roof Type**: Determines roofing material (asphalt, tile, metal, etc.)
- **Utility Company**: Identifies the electrical utility provider

### 3. Page-Specific Analysis

- **Select All Pages**: Analyze the entire document
- **Select Specific Pages**: Target analysis to relevant pages only
- **Page Preview**: See which pages contain the most relevant information

## How to Use

### Accessing PDF Analysis

1. Navigate to **Dashboard > Documents**
2. Click **View** on any PDF document
3. The advanced PDF viewer will open automatically for PDF files

### Extracting Data

1. **Optional**: Select specific pages you want to analyze using the page selection controls
2. Toggle the **Analysis** panel (button in top-right)
3. Click **Extract Data** to begin analysis
4. Review extracted information in the Analysis panel

### Page Selection Options

- **Select Page**: Add/remove current page from analysis
- **Select All**: Include all pages in analysis
- **Clear**: Remove all page selections

### Using Extracted Data

- **Review Results**: Check extracted information for accuracy
- **Copy Data**: Use extracted data to populate contact or job records
- **Save to Database**: Integration points for saving extracted data

## Supported Document Types

### Solar Installation Plans

- Panel layout diagrams
- System specifications
- Electrical schematics
- Roof measurements

### Permits and Applications

- Electrical permits
- Building permits
- Utility interconnection applications

### Site Surveys

- Property assessments
- Shading analysis reports
- Structural evaluations

## Data Extraction Patterns

The system uses intelligent pattern recognition to identify:

### Name Patterns

- "Owner: John Smith"
- "Customer: Jane Doe"
- "Homeowner: Mike Johnson"
- "Mr./Mrs./Ms. [Name]"

### Contact Information

- Phone formats: (555) 123-4567, 555-123-4567, 555.123.4567
- Address formats: Street numbers + street names + common suffixes

### Technical Specifications

- Panel quantities: "24 panels", "Panels: 36", "Qty: 48 modules"
- System sizes: "12.5 kW system", "System Size: 8.2kW"
- Battery types: "Tesla Powerwall", "Enphase Encharge", "LG Chem"

### Equipment Brands

- **Inverters**: SolarEdge, Enphase, SMA, Fronius, APSystems
- **Batteries**: Tesla, LG, Sonnen, Enphase, Generac, Franklin
- **Utilities**: PG&E, SDG&E, SCE, and regional utilities

## Tips for Best Results

### Document Preparation

- Ensure PDFs are text-based (not scanned images)
- Use high-quality scans if working with paper documents
- Keep document formatting consistent

### Page Selection

- Focus on cover pages and specification sheets for customer info
- Select technical drawing pages for system specifications
- Include permit pages for utility and regulatory information

### Data Verification

- Always verify extracted data against the original document
- Check for formatting issues in addresses and phone numbers
- Confirm technical specifications match project requirements

## Troubleshooting

### PDF Won't Load

- Check internet connection (PDF.js loads from CDN)
- Try opening PDF in new tab as fallback
- Ensure file is not corrupted

### No Data Extracted

- Verify PDF contains text (not just images)
- Try selecting different pages
- Check if document uses unusual formatting

### Incorrect Data

- Pattern recognition works best with standard formats
- Manual verification is always recommended
- Consider document formatting improvements for future uploads

## Future Enhancements

### Planned Features

- OCR support for scanned documents
- Machine learning model training on solar documents
- Integration with contact and job management systems
- Batch processing for multiple documents
- Custom extraction patterns configuration

### Integration Points

- Auto-populate contact records from extracted data
- Create jobs automatically from installation plans
- Link documents to existing customer records
- Generate project summaries from multiple documents

## Support

For questions or issues with PDF analysis features:

1. Check this documentation first
2. Verify document quality and format
3. Test with different page selections
4. Contact system administrator for technical issues

---

*This feature is designed specifically for solar installation professionals and integrates seamlessly with the ConstructFlow CRM workflow.*
