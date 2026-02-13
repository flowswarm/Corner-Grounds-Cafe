
export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
  ingredients?: string[];
}

export interface GalleryItem {
  id: number;
  url: string;
  alt: string;
  size: 'small' | 'medium' | 'large';
}
