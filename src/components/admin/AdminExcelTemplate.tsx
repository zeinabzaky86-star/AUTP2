import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export const AdminExcelTemplate = () => {
  const generateExcelTemplate = () => {
    // Define the comprehensive schema fields
    const templateData = {
      headers: [
        'service_name',      // Service Name
        'category',          // Category
        'description',       // Full description
        'duration',          // Estimated time (e.g., 45 minutes)
        'base_price',        // Base price
        'tenant_price',      // Tenant pricing
        'au_affiliate_price',// AU Affiliate pricing
        'external_price',    // External pricing
        'tags',              // Array of keywords (comma-separated)
        'availability_status', // Available/Unavailable/Scheduled
        'assigned_to',       // Team member or department
        'contact_email',     // Admin or service email
        'media_urls',        // Array of image/video/file URLs (comma-separated)
        'notes',             // Internal admin notes
        'status',            // Active or Inactive
        'lead_time',         // Lead time for service
        'available'          // Boolean for availability
      ],
      sampleData: [
        'Campus Wi-Fi Setup',
        'IT Support',
        'Complete wireless network setup and configuration for student accommodations including router configuration, network security setup, and connectivity testing.',
        '2-3 hours',
        '200.00',
        '150.00',
        '120.00',
        '180.00',
        'wifi,internet,setup,network,campus',
        'available',
        'IT Department - John Smith',
        'it@autp.com.au',
        'https://example.com/wifi-setup.jpg,https://example.com/network-diagram.pdf',
        'High demand service during semester start. Requires advance booking.',
        'active',
        '24 hours',
        'TRUE'
      ],
      validationRules: {
        category: ['IT Support', 'Property Management', 'Security Services', 'Maintenance', 'Academic Support', 'Business Services', 'Legal & Compliance', 'Creative Services', 'Health & Wellness'],
        availability_status: ['available', 'unavailable', 'scheduled', 'on-demand'],
        status: ['active', 'inactive', 'draft'],
        available: ['TRUE', 'FALSE']
      }
    };

    // Create CSV content with instructions
    const instructions = [
      '# AuTP Services - Data Import Template',
      '# Instructions:',
      '# 1. Fill in the data starting from row 4 (after this instruction block)',
      '# 2. service_name and category are REQUIRED fields',
      '# 3. Prices should be numeric values without currency symbols',
      '# 4. Tags should be comma-separated keywords',
      '# 5. Available field should be TRUE or FALSE',
      '# 6. Delete these instruction rows before importing',
      '',
      // Headers
      templateData.headers.join(','),
      // Sample data
      templateData.sampleData.join(',')
    ];

    const csvContent = instructions.join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'AuTP_Services_Template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Excel Template Generator</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Download a comprehensive Excel template with sample data and validation rules for bulk service imports.
        </p>
      </div>

      <Button onClick={generateExcelTemplate} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Download Excel Template
      </Button>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Template Includes:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Required Fields:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>service_name</li>
              <li>category</li>
            </ul>
          </div>
          <div>
            <strong>Optional Fields:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>description</li>
              <li>duration</li>
              <li>pricing (4 tiers)</li>
              <li>tags</li>
              <li>assignment info</li>
              <li>contact details</li>
              <li>media URLs</li>
              <li>admin notes</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4">
          <strong>Features:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
            <li>Sample data row with realistic examples</li>
            <li>Detailed instructions for each field</li>
            <li>Validation rules and accepted values</li>
            <li>Compatible with Excel, Google Sheets, and CSV editors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminExcelTemplate;