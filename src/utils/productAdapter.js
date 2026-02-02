const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isValidObjectId = (value) => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);

export const mapProductFromApi = (product = {}) => {
  const stockQuantity = product.stock?.quantity ?? product.quantity ?? 0;
  const reorderLevel = product.stock?.lowStockThreshold
    ?? product.stock?.reorderPoint
    ?? product.reorderLevel
    ?? 10;

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return {
    id: product._id || product.id || '',
    name: product.name || '',
    sku: product.sku || '',
    description: product.description || '',
    categoryId: product.category?._id || product.category || product.categoryId || '',
    categoryName: product.category?.name || product.categoryName || '',
    supplierId: product.supplier?._id || product.supplier || product.supplierId || '',
    supplierName: product.supplier?.name || product.supplierName || '',
    price: toNumber(product.sellingPrice ?? product.price),
    costPrice: toNumber(product.costPrice),
    unit: product.unit || 'pcs',
    stock: toNumber(stockQuantity),
    quantity: toNumber(stockQuantity),
    available: toNumber(product.stock?.available ?? stockQuantity),
    reserved: toNumber(product.stock?.reserved ?? 0),
    reorderLevel: toNumber(reorderLevel),
    isActive: product.isActive !== false,
    image: primaryImage?.url || product.image || null,
    raw: product
  };
};

export const buildProductPayload = (formData = {}) => {
  const payload = {
    name: formData.name?.trim(),
    description: formData.description?.trim(),
    sellingPrice: toNumber(formData.price, 0),
    costPrice: toNumber(formData.costPrice, 0),
    unit: formData.unit || 'pcs',
    isActive: formData.isActive !== false
  };

  if (formData.sku?.trim()) {
    payload.sku = formData.sku.trim();
  }

  if (isValidObjectId(formData.categoryId)) {
    payload.category = formData.categoryId;
  }

  if (isValidObjectId(formData.supplierId)) {
    payload.supplier = formData.supplierId;
  }

  if (Number.isFinite(formData.quantity)) {
    payload.stock = {
      quantity: toNumber(formData.quantity, 0),
      lowStockThreshold: toNumber(formData.reorderLevel, 10)
    };
  }

  if (formData.reorderLevel !== undefined && payload.stock) {
    payload.stock.lowStockThreshold = toNumber(formData.reorderLevel, 10);
  }

  if (formData.image) {
    payload.images = [
      {
        url: formData.image,
        isPrimary: true
      }
    ];
  }

  return payload;
};
