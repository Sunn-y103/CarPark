export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateFullName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, errorMessage: 'Full name is required' };
  }
  
  // Check if name contains only alphabets and spaces (no numbers allowed)
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, errorMessage: 'Full name must only contain alphabets (no numbers allowed)' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, errorMessage: 'Full name must be at least 2 characters long' };
  }
  
  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, errorMessage: 'Phone number is required' };
  }
  
  // Remove any spaces, dashes, or brackets
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if exactly 10 digits (not less or more)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, errorMessage: 'Phone number must be exactly 10 digits (not less or more)' };
  }
  
  return { isValid: true };
};

export const validateVehicleNumber = (vehicleNumber: string): ValidationResult => {
  if (!vehicleNumber || vehicleNumber.trim().length === 0) {
    return { isValid: false, errorMessage: 'Vehicle number is required' };
  }
  
  const cleanVehicleNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
  
  // Check format: AB12CD3456 (2 letters, 2 digits, 2 letters, 4 digits)
  const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
  if (!vehicleRegex.test(cleanVehicleNumber)) {
    return { 
      isValid: false, 
      errorMessage: 'Vehicle number must follow format AB12CD3456 (2 letters, 2 digits, 2 letters, 4 digits)' 
    };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, errorMessage: 'Email is required' };
  }
  
  // Email validation regex for standard format like "abc@gmail.com"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, errorMessage: 'Email must follow standard format like "abc@gmail.com"' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { isValid: false, errorMessage: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, errorMessage: 'Password must be at least 6 characters long' };
  }
  
  return { isValid: true };
};

export const formatVehicleNumber = (input: string): string => {
  // Remove spaces and convert to uppercase
  return input.replace(/\s/g, '').toUpperCase();
};

export const formatPhoneNumber = (input: string): string => {
  // Remove any non-digit characters
  return input.replace(/\D/g, '');
};
