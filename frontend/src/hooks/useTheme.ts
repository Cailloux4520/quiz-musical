import { useEffect } from 'react';
import { ThemeConfig } from '../types/theme';

export const useTheme = (theme?: ThemeConfig) => {
  useEffect(() => {
    if (!theme) return;

    // Appliquer les variables CSS
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);
    root.style.setProperty('--color-background', theme.backgroundColor);
    root.style.setProperty('--color-text', theme.textColor);
    root.style.setProperty('--color-success', theme.successColor);
    root.style.setProperty('--color-error', theme.errorColor);

    // Appliquer la police
    if (theme.fontFamily && theme.fontFamily !== 'Inter') {
      // Charger la police depuis Google Fonts
      const fontLink = document.createElement('link');
      fontLink.href = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);

      root.style.fontFamily = `"${theme.fontFamily}", sans-serif`;
    }

    // Appliquer la taille de police
    const fontSizeMap = {
      sm: '14px',
      base: '16px',
      lg: '18px',
    };
    root.style.fontSize = fontSizeMap[theme.fontSize] || '16px';

    // Appliquer le CSS personnalisé si présent
    if (theme.customCss) {
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-css';
      styleElement.textContent = theme.customCss;
      document.head.appendChild(styleElement);

      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [theme]);

  return { applyTheme: (newTheme: ThemeConfig) => useTheme(newTheme) };
};
