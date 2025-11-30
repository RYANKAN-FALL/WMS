/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapCategoryToClient(cat: any) {
  return {
    id: cat.id,
    name: cat.name,
    description: cat.description,
    createdAt: cat.createdAt,
    productCount: (cat.products || []).length,
  };
}
