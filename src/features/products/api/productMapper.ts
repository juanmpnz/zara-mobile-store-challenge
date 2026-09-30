import type { ProductColorDto, ProductDetailDto, ProductSpecsDto, ProductStorageDto, ProductSummaryDto } from './productDtos';
import type { ProductColor, ProductDetail, ProductSpecifications, ProductStorage, ProductSummary } from '@/features/products/model/product';

export function mapProductSummary(dto: ProductSummaryDto): ProductSummary {
  return {
    id: dto.id,
    brand: dto.brand,
    name: dto.name,
    basePrice: dto.basePrice,
    image: dto.imageUrl,
  };
}

function mapSpecifications(dto: ProductSpecsDto): ProductSpecifications {
  return {
    screen: dto.screen,
    resolution: dto.resolution,
    processor: dto.processor,
    mainCamera: dto.mainCamera,
    selfieCamera: dto.selfieCamera,
    battery: dto.battery,
    operatingSystem: dto.os,
    screenRefreshRate: dto.screenRefreshRate,
  };
}

function mapColor(dto: ProductColorDto): ProductColor {
  return { name: dto.name, hex: dto.hexCode, image: dto.imageUrl };
}

function mapStorage(dto: ProductStorageDto): ProductStorage {
  return { capacity: dto.capacity, price: dto.price };
}

export function mapProductDetail(dto: ProductDetailDto): ProductDetail {
  return {
    id: dto.id,
    brand: dto.brand,
    name: dto.name,
    basePrice: dto.basePrice,
    description: dto.description,
    rating: dto.rating,
    specifications: dto.specs ? mapSpecifications(dto.specs) : undefined,
    colors: dto.colorOptions?.map(mapColor),
    storageOptions: dto.storageOptions?.map(mapStorage),
    similarProducts: dto.similarProducts?.map(mapProductSummary),
  };
}
