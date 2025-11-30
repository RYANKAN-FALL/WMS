/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapRackLocationToClient(loc: any) {
  return {
    id: loc.id,
    name: loc.name,
    description: loc.description,
    createdAt: loc.createdAt,
    productCount: (loc.products || []).length,
  };
}
