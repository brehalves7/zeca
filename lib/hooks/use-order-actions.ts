"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function useOrderActions() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsLoading(true);
    const dataPagamento = newStatus === 'PAGO' ? new Date().toISOString() : (newStatus === 'PENDENTE' ? null : undefined);
    
    try {
      const updateData: any = { status: newStatus };
      if (dataPagamento !== undefined) {
        updateData.data_pagamento = dataPagamento;
      }

      const { error } = await supabase
        .from("pedidos")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;
      
      router.refresh();
      return { success: true, status: newStatus };
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateOrderStatus,
    isLoading
  };
}
