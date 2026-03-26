import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  User, 
  Settings 
} from "lucide-react";

export const navItems = [
  { href: "/dashboard/home", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/produtos", label: "Produtos", icon: Package },
  { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];
