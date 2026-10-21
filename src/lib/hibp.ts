/**
 * Have I Been Pwned (HIBP) client-side password breach checking
 * Uses the k-anonymity model - only sends first 5 characters of SHA-1 hash
 * This preserves privacy while checking against known breached passwords
 */

import { toast } from "@/hooks/use-toast";

/**
 * Convert string to SHA-1 hash using Web Crypto API
 */
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Check if password appears in known data breaches
 * Returns true if password is compromised, false if safe
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    // Generate SHA-1 hash of password
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Query HIBP API with hash prefix (k-anonymity model)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Alexandria-Tech-Park-Auth-Check'
      }
    });

    if (!response.ok) {
      // Fail-closed by default for security (configurable via constant)
      const FAIL_CLOSED = true; // Set constant behavior
      console.warn('HIBP API unavailable, failing', FAIL_CLOSED ? 'closed' : 'open');
      return FAIL_CLOSED;
    }

    const data = await response.text();
    
    // Check if our password's hash suffix appears in the response
    const lines = data.split('\n');
    for (const line of lines) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix === suffix) {
        return true; // Password found in breach data
      }
    }

    return false; // Password not found in breach data
  } catch (error) {
    // Network error or other issue - fail-closed for security
    const FAIL_CLOSED = true; // Set constant behavior
    console.warn('Error checking password breach:', error, 'failing', FAIL_CLOSED ? 'closed' : 'open');
    return FAIL_CLOSED;
  }
}

/**
 * Validate password and show user-friendly error if breached
 * Returns true if password is safe to use, false if validation fails
 */
export async function validatePasswordSecurity(password: string): Promise<boolean> {
  // Check minimum length first (client-side validation)
  if (password.length < 12) {
    toast({
      variant: "destructive",
      title: "Password Too Short",
      description: "Password must be at least 12 characters long."
    });
    return false;
  }

  // Check against known breaches
  const isBreached = await checkPasswordBreach(password);
  
  if (isBreached) {
    toast({
      variant: "destructive",
      title: "Insecure Password",
      description: "This password appears in known data breaches. Please choose a stronger, unique password."
    });
    return false;
  }

  return true;
}