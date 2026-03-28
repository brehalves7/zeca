import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./components/dashboard-content";

export const dynamic = 'force-dynamic';

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const mesAnoIso = startOfMonth.toISOString().split('T')[0];

  // Busca perfil e meta do mês atual em paralelo
  const [profileRes, metaRes] = await Promise.all([
    supabase.from("profiles").select("company_name, comissao_padrao").eq("id", userId).single(),
    supabase.from("metas").select("valor_meta").eq("user_id", userId).eq("mes_ano", mesAnoIso).single()
  ]);

  const profile = profileRes.data;
  const meta = metaRes.data?.valor_meta ?? 50000;

  // Busca TODOS os pedidos do mês para o dashboard (será filtrado no client)
  const { data: allOrders } = await supabase
    .from("pedidos")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  const orders = allOrders ?? [];

  // Busca clientes inativos
  const { data: inactiveClients } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", userId)
    .gt("dias_inatividade", 15)
    .limit(3);

  return {
    profile,
    orders,
    meta,
    inactiveClients: inactiveClients ?? [],
  };
}

export default async function HomePageDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await getDashboardData(user.id);

  return (
    <DashboardContent 
      initialOrders={data.orders}
      profile={data.profile as any}
      initialMeta={data.meta}
      inactiveClients={data.inactiveClients}
      userId={user.id}
    />
  );
}