export interface ProductSummaryDto {
  id?: string;
  brand?: string;
  name?: string;
  basePrice?: number;
  imageUrl?: string;
}

export interface ProductSpecsDto {
  screen?: string;
  resolution?: string;
  processor?: string;
  mainCamera?: string;
  selfieCamera?: string;
  battery?: string;
  os?: string;
  screenRefreshRate?: string;
}

export interface ProductColorDto {
  name?: string;
  hexCode?: string;
  imageUrl?: string;
}

export interface ProductStorageDto {
  capacity?: string;
  price?: number;
}

export interface ProductDetailDto {
  id?: string;
  brand?: string;
  name?: string;
  basePrice?: number;
  description?: string;
  rating?: number;
  specs?: ProductSpecsDto;
  colorOptions?: ProductColorDto[];
  storageOptions?: ProductStorageDto[];
  similarProducts?: ProductSummaryDto[];
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOptionalString(record: UnknownRecord, key: string): boolean {
  return !(key in record) || typeof record[key] === 'string';
}

function hasOptionalNumber(record: UnknownRecord, key: string): boolean {
  return !(key in record) || typeof record[key] === 'number';
}

function isProductSummaryDto(value: unknown): value is ProductSummaryDto {
  return (
    isRecord(value) &&
    hasOptionalString(value, 'id') &&
    hasOptionalString(value, 'brand') &&
    hasOptionalString(value, 'name') &&
    hasOptionalNumber(value, 'basePrice') &&
    hasOptionalString(value, 'imageUrl')
  );
}

function isProductSpecsDto(value: unknown): value is ProductSpecsDto {
  return (
    isRecord(value) &&
    hasOptionalString(value, 'screen') &&
    hasOptionalString(value, 'resolution') &&
    hasOptionalString(value, 'processor') &&
    hasOptionalString(value, 'mainCamera') &&
    hasOptionalString(value, 'selfieCamera') &&
    hasOptionalString(value, 'battery') &&
    hasOptionalString(value, 'os') &&
    hasOptionalString(value, 'screenRefreshRate')
  );
}

function isProductColorDto(value: unknown): value is ProductColorDto {
  return (
    isRecord(value) &&
    hasOptionalString(value, 'name') &&
    hasOptionalString(value, 'hexCode') &&
    hasOptionalString(value, 'imageUrl')
  );
}

function isProductStorageDto(value: unknown): value is ProductStorageDto {
  return (
    isRecord(value) &&
    hasOptionalString(value, 'capacity') &&
    hasOptionalNumber(value, 'price')
  );
}

function hasOptionalObject(
  record: UnknownRecord,
  key: string,
  guard: (value: unknown) => boolean,
): boolean {
  return !(key in record) || guard(record[key]);
}

function hasOptionalArray(
  record: UnknownRecord,
  key: string,
  guard: (value: unknown) => boolean,
): boolean {
  return (
    !(key in record) || (Array.isArray(record[key]) && record[key].every(guard))
  );
}

function isProductDetailDto(value: unknown): value is ProductDetailDto {
  return (
    isRecord(value) &&
    hasOptionalString(value, 'id') &&
    hasOptionalString(value, 'brand') &&
    hasOptionalString(value, 'name') &&
    hasOptionalNumber(value, 'basePrice') &&
    hasOptionalString(value, 'description') &&
    hasOptionalNumber(value, 'rating') &&
    hasOptionalObject(value, 'specs', isProductSpecsDto) &&
    hasOptionalArray(value, 'colorOptions', isProductColorDto) &&
    hasOptionalArray(value, 'storageOptions', isProductStorageDto) &&
    hasOptionalArray(value, 'similarProducts', isProductSummaryDto)
  );
}

export function parseProductSummaryDtos(value: unknown): ProductSummaryDto[] {
  if (!Array.isArray(value) || !value.every(isProductSummaryDto)) {
    throw new TypeError('The product list response has an invalid shape.');
  }

  return value;
}

export function parseProductDetailDto(value: unknown): ProductDetailDto {
  if (!isProductDetailDto(value)) {
    throw new TypeError('The product detail response has an invalid shape.');
  }

  return value;
}
