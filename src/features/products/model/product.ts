export interface ProductSummary {
  id?: string;
  brand?: string;
  name?: string;
  basePrice?: number;
  image?: string;
}

export interface ProductSpecifications {
  screen?: string;
  resolution?: string;
  processor?: string;
  mainCamera?: string;
  selfieCamera?: string;
  battery?: string;
  operatingSystem?: string;
  screenRefreshRate?: string;
}

export interface ProductColor {
  name?: string;
  hex?: string;
  image?: string;
}

export interface ProductStorage {
  capacity?: string;
  price?: number;
}

export interface ProductDetail {
  id?: string;
  brand?: string;
  name?: string;
  basePrice?: number;
  description?: string;
  rating?: number;
  specifications?: ProductSpecifications;
  colors?: ProductColor[];
  storageOptions?: ProductStorage[];
  similarProducts?: ProductSummary[];
}
