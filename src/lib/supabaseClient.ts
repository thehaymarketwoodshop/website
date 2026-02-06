import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ================================
   ADMIN CHECK
================================ */
export async function checkIsAdmin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return false;

  const { data, error } = await supabase
    .from("admin_allowlist")
    .select("email")
    .eq("email", user.email)
    .single();

  return !error && !!data;
}

/* ================================
   WOOD TYPES
================================ */
export async function fetchWoodTypes() {
  const { data, error } = await supabase
    .from("wood_types")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function createWoodType(name: string) {
  const { error } = await supabase.from("wood_types").insert({
    name,
  });

  if (error) throw error;
}

export async function updateWoodType(
  id: string,
  updates: { name?: string; sort_order?: number; is_active?: boolean }
) {
  const { error } = await supabase
    .from("wood_types")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteWoodType(id: string) {
  const { error } = await supabase.from("wood_types").delete().eq("id", id);
  if (error) throw error;
}

/* ================================
   ITEM TYPES
================================ */
export async function fetchItemTypes() {
  const { data, error } = await supabase
    .from("item_types")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function createItemType(name: string) {
  const { error } = await supabase.from("item_types").insert({
    name,
  });

  if (error) throw error;
}

export async function updateItemType(
  id: string,
  updates: { name?: string; sort_order?: number; is_active?: boolean }
) {
  const { error } = await supabase
    .from("item_types")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteItemType(id: string) {
  const { error } = await supabase.from("item_types").delete().eq("id", id);
  if (error) throw error;
}
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
// ===== OVERRIDES (match admin UI payloads) =====

export async function createWoodType(data: {
  name: string;
  sort_order: number;
  is_active: boolean;
}) {
  const { error } = await supabase.from("wood_types").insert(data);
  if (error) throw error;
}

export async function createItemType(data: {
  name: string;
  sort_order: number;
  is_active: boolean;
}) {
  const { error } = await supabase.from("item_types").insert(data);
  if (error) throw error;
}
