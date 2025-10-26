import ReCAPTCHA from 'react-google-recaptcha';
import { useRef, forwardRef, useImperativeHandle } from 'react';

interface RecaptchaProps {
  onVerify: (token: string | null) => void;
  size?: 'normal' | 'compact' | 'invisible';
  theme?: 'light' | 'dark';
}

export interface RecaptchaRef {
  execute: () => Promise<string | null>;
  reset: () => void;
}

export const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>(
  ({ onVerify, size = 'invisible', theme = 'light' }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    useImperativeHandle(ref, () => ({
      execute: async () => {
        if (!recaptchaRef.current) return null;
        try {
          const token = await recaptchaRef.current.executeAsync();
          return token;
        } catch (error) {
          console.error('reCAPTCHA execution failed:', error);
          return null;
        }
      },
      reset: () => {
        recaptchaRef.current?.reset();
      },
    }));

    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return null;
    }

    return (
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        size={size}
        theme={theme}
        onChange={onVerify}
      />
    );
  }
);

Recaptcha.displayName = 'Recaptcha';
