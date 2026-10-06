export type ProductSearchState = {
  q: string;
  category: string;
  sort: string;
  certs: string[];
  regionSido: string;
  regionSigungu: string;
};

export function productSearchQuery(base: string, state: ProductSearchState): URLSearchParams {
  const qs = new URLSearchParams(base);
  ["q", "category", "sort", "cert", "certification", "region", "regionSido", "regionSigungu", "classNo"].forEach((key) => qs.delete(key));
  if (state.q) qs.set("q", state.q);
  if (state.category) qs.set("category", state.category);
  if (state.sort !== "relevance") qs.set("sort", state.sort);
  state.certs.forEach((cert) => qs.append("cert", cert));
  if (state.regionSido) qs.set("regionSido", state.regionSido);
  if (state.regionSido && state.regionSigungu) qs.set("regionSigungu", state.regionSigungu);
  return qs;
}
