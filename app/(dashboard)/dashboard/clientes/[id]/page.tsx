import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ClientDetailsContent from "./client-details-content";

export const dynamic = "force-dynamic";

export default async function ClientPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Busca dados do cliente
  const { data: cliente, error: errorCliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (errorCliente || !cliente) {
    return notFound();
  }

  // 2. Busca pedidos do cliente
  const { data: pedidos, error: errorPedidos } = await supabase
    .from("pedidos")
    .select("*")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  return (
    <ClientDetailsContent 
      cliente={cliente} 
      initialPedidos={pedidos || []} 
    />
  );
}
