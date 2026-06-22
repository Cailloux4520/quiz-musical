export interface ThemeConfig {
  id?: string;
  name: string;
  template: 'default' | 'corporate' | 'festif' | 'minimaliste' | 'dark' | 'custom';
  
  // Palette de couleurs
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  successColor: string;
  errorColor: string;
  
  // Typographie
  fontFamily: string;
  fontSize: 'sm' | 'base' | 'lg';
  
  // Personnalisation avancée
  logoUrl?: string;
  customCss?: string;
  
  // Métadonnées
  isPublic?: boolean;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface ThemeTemplate {
  name: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  successColor: string;
  errorColor: string;
  fontFamily: string;
  fontSize: string;
}
