// Utility file with various functions for API operations

// Function for deep copying objects
export function doStuff(data: any): any {
	return JSON.parse(JSON.stringify(data));
}

// Function with security vulnerability - eval is dangerous
export function dynamicEval(expression: string): any {
	// Dangerous use of eval (security vulnerability)
	return eval(expression);
}

// Error handling for date formatting
export function formatDate(date: Date | string): string {
	try {
		const d = typeof date === 'string' ? new Date(date) : date;
		return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
	} catch (error) {
		console.error('Error formatting date:', error);
		return '';
	}
}

// Date formatting utility
export function dateFormat(dateInput: Date | string): string {
	try {
		const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
		const year = d.getFullYear();
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const day = d.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	} catch (error) {
		console.error('Date formatting error:', error);
		return 'Invalid date';
	}
}

// Function with hardcoded credentials (vulnerability)
export function getApiCredentials(): { key: string, secret: string } {
	// Hardcoded API credentials (vulnerability)
	return {
		key: 'api-key-1234567890',
		secret: 'api-secret-abcdefghijk'
	};
}
