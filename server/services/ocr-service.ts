import path from "path"
import NodeCache from "node-cache"
\
<<<<<<< HEAD
=======
>>>>>>> 2d7fda2939690346df0a3f95e882c21b5ed51760

// Initialize cache for OCR results
const ocrCache = new NodeCache({
  stdTTL: 3600, // 1 hour cache
  checkperiod: 120, // Check for expired keys every 2 minutes
})

<<<<<<< HEAD
/**
 * Process image with OCRWebService.com
 * @param filePath Path to the image file
 * @param options Processing options
 * @returns Extracted text from the image
 */
=======
// Process image with OCRWebService.com
>>>>>>> 2d7fda2939690346df0a3f95e882c21b5ed51760
export async function processImageWithOCR(
  filePath: string,
  options: {
    useCache?: boolean;
    preferredLanguage?: string;
  } = {},
): Promise<string> {
  const { useCache = true, preferredLanguage } = options;

  try {
    // Generate a hash of the file for caching
    const fileHash = await getFileHash(filePath);
    const cacheKey = `ocr_${fileHash}_${preferredLanguage || 'default'}`;

    // Check if result is cached
    if (useCache) {
      const cachedResult = ocrCache.get<string>(cacheKey);
      if (cachedResult) {
<<<<<<< HEAD
        logger.info(`OCR result found in cache for ${path.basename(filePath)}`);
=======
        console.log(`OCR result found in cache for ${path.basename(filePath)}`);
>>>>>>> 2d7fda2939690346df0a3f95e882c21b5ed51760
        return cachedResult;
      }
    }

    // Get OCR credentials from environment variables
    const username = process.env.OCR_USER_NAME;
    const licenseCode = process.env.OCR_LICENSE_CODE;

    if (!username || !licenseCode) {
      throw new Error('OCR credentials not configured. Please set OCR_USER_NAME and OCR_LICENSE_CODE environment variables.');
    }

    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    // Make request to OCRWebService.com
    const response = await axios({
      method: 'post',
      url: 'https://www.ocrwebservice.com/restservices/processDocument?gettext=true',
      data: formData,
      headers: {
        ...formData.getHeaders(),
<<<<<<< HEAD
=======
        'Content-Type': 'multipart/form-data',
>>>>>>> 2d7fda2939690346df0a3f95e882c21b5ed51760
      },
      auth: {
        username,
        password: licenseCode,
      },
      timeout: 15000, // 15 seconds timeout
    });

    // Check for error message in the response
    if (response.data.ErrorMessage) {
      throw new Error(`OCR API Error: ${response.data.ErrorMessage}`);
    }

    // Extract OCR text from response
    const ocrText = response.data.OCRText || '';
<<<<<<< HEAD
    
    // Additional details from the response
    const taskDescription = response.data.TaskDescription || '';
    const availablePages = response.data.AvailablePages || 0;
    const processedPages = response.data.ProcessedPages || 0;

    logger.info(`OCR processing completed: ${taskDescription}, Pages: ${processedPages}/${availablePages}`);
=======
>>>>>>> 2d7fda2939690346df0a3f95e882c21b5ed51760

    // Cache the result if it's substantial
    if (useCache && ocrText.length > 10) {
      ocrCache.set(cacheKey, ocrText);
    }

    return ocrText;
  } catch (error) {
    // Handle specific error types
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized: Invalid OCR API credentials');
      } else if (error.response) {
        throw new Error(`OCR API Error (${error.response.status}): ${error.response.data?.ErrorMessage || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('OCR API request failed: No response received');
      }
    }
    
<<<<<<< HEAD
    logger.error(`Error processing image with OCR: ${path.basename(filePath)}`, error);
=======
    console.error(`Error processing image with OCR: ${path.basename(filePath)}`, error);
>>>>>>> 2d7fda2939690346df0a3f95e882c21b5ed51760
    throw error instanceof Error ? error : new Error('Failed to process image with OCR');
  }
}

/**
 * Parse invoice data from OCR text
 * @param ocrText Text extracted from OCR
 * @returns Structured invoice data
 */
export function parseInvoiceData(ocrText: string) {
  // Extract invoice details from OCR text
  const invoiceNumber = extractInvoiceNumber(ocrText);
  const invoiceDate = extractInvoiceDate(ocrText);
  const amountWithTax = extractAmountWithTax(ocrText);
  const amount = extractAmount(ocrText);
  const vatAmount = extractVatAmount(ocrText);
  const supplier = extractSupplier(ocrText);

  return {
    invoiceNumber,
    invoiceDate,
    amountWithTax,
    amount,
    vatAmount,
    supplier,
    rawText: ocrText,
  };
}

// Helper function to get file hash for caching
async function getFileHash(filePath: string): Promise<string> {
  const crypto = require('crypto');
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Helper functions to extract specific data from OCR text
function extractInvoiceNumber(text: string): string {
  // Look for common invoice number patterns
  const patterns = [
    /facture\s+(?:n[o°]?\s*[:.]?\s*)?([A-Z0-9/-]+)/i,
    /n[o°]?\s*(?:facture|fact)?\s*[:.]?\s*([A-Z0-9/-]+)/i,
    /(?:invoice|inv)\s+(?:no|num|number|#)?\s*[:.]?\s*([A-Z0-9/-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return '';
}

function extractInvoiceDate(text: string): string {
  // Look for date patterns (DD/MM/YYYY or variants)
  const patterns = [
    /date\s+(?:facture|de\s+facture)?\s*[:.]?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i,
    /(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Try to format the date consistently
      const dateParts = match[1].split(/[/.-]/);
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
        return `${day}/${month}/${year}`;
      }
      return match[1].trim();
    }
  }

  return '';
}

function extractAmountWithTax(text: string): number {
  // Look for total amount patterns (with TTC, TVA, TAX, etc.)
  const patterns = [
    /total\s+(?:ttc|t\.t\.c\.)\s*[:.]?\s*(\d+[.,]?\d*)/i,
    /montant\s+(?:ttc|t\.t\.c\.)\s*[:.]?\s*(\d+[.,]?\d*)/i,
    /total\s*[:.]?\s*(\d+[.,]?\d*)/i,
    /net\s+(?:à\s+payer)?\s*[:.]?\s*(\d+[.,]?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Convert to number and handle different decimal separators
      return parseFloat(match[1].replace(',', '.'));
    }
  }

  return 0;
}

function extractAmount(text: string): number {
  // Look for amount without tax patterns (HT, excluding VAT, etc.)
  const patterns = [
    /total\s+(?:ht|h\.t\.)\s*[:.]?\s*(\d+[.,]?\d*)/i,
    /montant\s+(?:ht|h\.t\.)\s*[:.]?\s*(\d+[.,]?\d*)/i,
    /(?:price|amount)\s+(?:excl|excluding)\s+(?:vat|tax)\s*[:.]?\s*(\d+[.,]?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }

  return 0;
}

function extractVatAmount(text: string): number {
  // Look for VAT amount patterns
  const patterns = [
    /(?:tva|t\.v\.a\.|vat)\s*(?:\d+%)?(?:\s*:)?\s*(\d+[.,]?\d*)/i,
    /montant\s+(?:tva|t\.v\.a\.|vat)\s*(?:\d+%)?(?:\s*:)?\s*(\d+[.,]?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }

  return 0;
}

function extractSupplier(text: string): string {
  // Try to extract company name from the first few lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  // Often the supplier name is in one of the first lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Skip lines that are likely not a company name
    if (line.match(/facture|invoice|date|montant|amount|total|tel|email|adresse|address/i)) {
      continue;
    }
    // If line has at least 3 characters and doesn't start with a number, it could be a company name
    if (line.length > 3 && !line.match(/^\d/)) {
      return line;
    }
  }

  return '';
}
