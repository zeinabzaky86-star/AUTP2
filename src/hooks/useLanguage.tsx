import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  const t = (key: string) => getTranslation(key, context.language);

  return {
    ...context,
    t,
  };
};
