/**
 * Universal WhatsApp Deep Linking Utility
 * 
 * Directly triggers the native WhatsApp mobile application via `whatsapp://send?phone=...&text=...`
 * on iOS and Android devices without stuck web landing pages ("Continue to chat"),
 * with automatic fallback to `https://wa.me/...`.
 */

export const DEFAULT_BUSINESS_PHONE = '919773203109';

/**
 * Generate native WhatsApp protocol URL (direct app launch)
 */
export const getWhatsAppDeepLink = (
  phone: string = DEFAULT_BUSINESS_PHONE,
  text: string = ''
): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '') || DEFAULT_BUSINESS_PHONE;
  const encodedText = text ? encodeURIComponent(text) : '';
  return `whatsapp://send?phone=${cleanPhone}${encodedText ? `&text=${encodedText}` : ''}`;
};

/**
 * Generate web fallback URL (wa.me)
 */
export const getWhatsAppWebLink = (
  phone: string = DEFAULT_BUSINESS_PHONE,
  text: string = ''
): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '') || DEFAULT_BUSINESS_PHONE;
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ''}`;
};

/**
 * Detect if current device is a mobile or tablet device
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ''
  );
};

/**
 * Get the most appropriate link based on platform
 */
export const getUniversalWhatsAppLink = (
  phone: string = DEFAULT_BUSINESS_PHONE,
  text: string = ''
): string => {
  return isMobileDevice()
    ? getWhatsAppDeepLink(phone, text)
    : getWhatsAppWebLink(phone, text);
};

/**
 * Open WhatsApp using universal deep linking with automatic fallback
 * 
 * - Mobile: Uses `whatsapp://send` to directly invoke the native WhatsApp client.
 *   If not launched within timeout (e.g. app not installed), falls back to `https://wa.me/`.
 * - Desktop: Opens `https://wa.me/` in a new tab smoothly.
 */
export const openWhatsApp = (
  phone: string = DEFAULT_BUSINESS_PHONE,
  text: string = ''
): void => {
  const deepLink = getWhatsAppDeepLink(phone, text);
  const webFallback = getWhatsAppWebLink(phone, text);

  if (typeof window === 'undefined') return;

  const mobile = isMobileDevice();

  if (mobile) {
    let appOpened = false;
    const startTime = Date.now();

    const handleVisibility = () => {
      if (document.hidden) {
        appOpened = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility, { once: true });

    // Directly trigger native WhatsApp application
    window.location.href = deepLink;

    // Fallback if native app is not installed or fails to launch
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibility);
      const elapsed = Date.now() - startTime;
      // If page was not hidden and execution did not pause for an OS dialog
      if (!appOpened && elapsed < 2000) {
        window.location.href = webFallback;
      }
    }, 1200);
  } else {
    // Desktop: open web fallback in a new tab
    window.open(webFallback, '_blank', 'noopener,noreferrer');
  }
};
