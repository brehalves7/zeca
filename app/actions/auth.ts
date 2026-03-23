"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Função de signIn em Server Action.
 * Se houver erro de credenciais, devolvemos a mensagem limpa.
 */
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "E-mail ou senha inválidos. Verifique as informações." };
    }
    return { error: error.message };
  }

  // Redireciona para a área logada em caso de sucesso
  redirect("/dashboard");
}

/**
 * Destrói a sessão e envia o usuário de volta para o login.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
