"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Cadastra um novo cliente vinculado ao usuário logado
 */
export async function createCliente(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const nome = formData.get("nome") as string;
  const telefone = formData.get("telefone") as string;
  const cidade = formData.get("cidade") as string;

  const { error } = await supabase.from("clientes").insert([
    {
      nome,
      telefone,
      cidade,
      user_id: user.id,
      dias_inatividade: 0,
    },
  ]);

  if (error) {
    console.error("Erro ao inserir:", error);
    return { error: "Erro ao salvar cliente" };
  }

  // Limpa o cache da página de clientes para mostrar o novo dado imediatamente
  revalidatePath("/dashboard/clientes");
  return { success: true };
}

/**
 * Exclui um cliente específico
 */
export async function deleteCliente(clienteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", clienteId)
    .eq("user_id", user.id); // Trava de segurança extra para garantir posse do dado

  if (error) {
    console.error("Erro ao deletar:", error);
    return { error: "Erro ao excluir cliente" };
  }

  // Atualiza a lista na interface
  revalidatePath("/dashboard/clientes");
  return { success: true };
}

export async function updateCliente(clienteId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const nome = formData.get("nome") as string;
  const telefone = formData.get("telefone") as string;
  const cidade = formData.get("cidade") as string;

  const { error } = await supabase
    .from("clientes")
    .update({ nome, telefone, cidade })
    .eq("id", clienteId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao atualizar:", error);
    return { error: "Erro ao atualizar cliente" };
  }

  revalidatePath("/dashboard/clientes");
  return { success: true };
}
