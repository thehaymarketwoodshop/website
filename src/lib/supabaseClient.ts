import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client (safe with anon key).
 * Requires Vercel env vars:
 *  - NEXT_PUBLIC_SUPABASE_URL
 *  - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ================================
   DB TYPES
================================ */
export type DbWoodType = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type DbItemType = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type DbProduct = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  price_cents: number;
  buy_url: string | null;
  image_url: string | null;
  size_label: string | null;
  weight_lbs: number | null;
  is_in_stock: boolean;
  wood_type_id: string | null;
  item_type_id: string | null;
};

/* ================================
   AUTH / ADMIN
================================ */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) return false;

  const email = userData.user?.email;
  if (!email) return false;

  const { data, error } = await supabase
    .from("admin_allowlist")
    .select("email")
    .eq("email", email)
    .single();

  return !error && !!data;
}

/* ================================
   WOOD TYPES
================================ */
export async function fetchWoodTypes(): Promise<DbWoodType[]> {
  const { data, error } = await supabase
    .from("wood_types")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbWoodType[];
}

export async function createWoodType(data: {
  name: string;
  sort_order: number;
  is_active: boolean;
}): Promise<void> {
  const { error } = await supabase.from("wood_types").insert(data);
  if (error) throw error;
}

export async function updateWoodType(
  id: string,
  updates: Partial<Pick<DbWoodType, "name" | "sort_order" | "is_active">>
): Promise<void> {
  const { error } = await supabase.from("wood_types").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteWoodType(id: string): Promise<void> {
  const { error } = await supabase.from("wood_types").delete().eq("id", id);
  if (error) throw error;
}

/* ================================
   ITEM TYPES
================================ */
export async function fetchItemTypes(): Promise<DbItemType[]> {
  const { data, error } = await supabase
    .from("item_types")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbItemType[];
}

export async function createItemType(data: {
  name: string;
  sort_order: number;
  is_active: boolean;
}): Promise<void> {
  const { error } = await supabase.from("item_types").insert(data);
  if (error) throw error;
}

export async function updateItemType(
  id: string,
  updates: Partial<Pick<DbItemType, "name" | "sort_order" | "is_active">>
): Promise<void> {
  const { error } = await supabase.from("item_types").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteItemType(id: string): Promise<void> {
  const { error } = await supabase.from("item_types").delete().eq("id", id);
  if (error) throw error;
}

/* ================================
   PRODUCTS (optional helpers)
   If your admin/products page expects these, they’re ready.
================================ */
export async function fetchProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbProduct[];
}

export async function createProduct(data: {
  name: string;
  description?: string | null;
  price_cents?: number;
  buy_url?: string | null;
  image_url?: string | null;
  size_label?: string | null;
  weight_lbs?: number | null;
  is_in_stock?: boolean;
  wood_type_id?: string | null;
  item_type_id?: string | null;
}): Promise<void> {
  const payload = {
    price_cents: 0,
    is_in_stock: true,
    ...data,
  };

  const { error } = await supabase.from("products").insert(payload);
  if (error) throw error;
}

export async function updateProduct(
  id: string,
  updates: Partial<
    Pick<
      DbProduct,
      | "name"
      | "description"
      | "price_cents"
      | "buy_url"
      | "image_url"
      | "size_label"
      | "weight_lbs"
      | "is_in_stock"
      | "wood_type_id"
      | "item_type_id"
    >
  >
): Promise<void> {
  const { error } = await supabase.from("products").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
