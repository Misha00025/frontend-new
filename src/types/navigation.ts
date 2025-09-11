export interface NavigationItem {
    id: string;
    label: string;
    path: string;
    icon: string;
    isBackButton?: boolean;
  }
  
  export interface NavigationConfig {
    default: NavigationItem[];
    group: NavigationItem[];
  }