import { createClient } from "@/lib/supabase/server";
import PedidosContent from "./components/pedidos-content";

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  return <PedidosContent initialPedidos={pedidos || []} />;
}
