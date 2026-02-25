export type CatalogItemRow = {
  id: string;
  import_id: string;
  brand: string;
  model: string;
  part_group: string | null;
  part_name: string;
  price_yen: number;
  source_token: string | null;
  source_category: string | null;
  is_active: boolean;
  created_at: string;
};

export type CatalogLatestRow = CatalogItemRow;
