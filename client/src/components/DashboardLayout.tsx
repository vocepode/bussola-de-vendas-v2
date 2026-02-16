import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Compass,
  FolderOpen,
  Grid2x2,
  LogOut,
  Settings,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { CSSProperties } from "react";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const MAIN_MENU = [
  { icon: Grid2x2, label: "Dashboard", path: "/" },
  { icon: Compass, label: "Minha Bússola", path: "/minha-bussola" },
  { icon: FolderOpen, label: "Meus Materiais", path: "/materiais" },
] as const;

const ACCOUNT_MENU = [{ icon: Settings, label: "Configurações", path: "/configuracoes" }] as const;

function isPathActive(pathname: string, itemPath: string) {
  if (itemPath === "/") return pathname === "/";
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (user) return;
    router.replace("/login");
  }, [loading, router, user]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="dark">
      <SidebarProvider defaultOpen style={{ "--sidebar-width": "220px" } as CSSProperties}>
      <Sidebar collapsible="icon" className="border-r border-[#1a1a1f] bg-[#0a0a0f]">
        <SidebarHeader className="h-14 border-b border-[#1a1a1f] px-2">
          <SidebarTop onLogoClick={() => router.push("/")} />
        </SidebarHeader>

        <SidebarContent className="px-1.5 py-2 text-white">
          <SidebarMenu>
            {MAIN_MENU.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isPathActive(pathname, item.path)}
                  tooltip={item.label}
                  className="h-9 text-[14px] text-white/90 hover:bg-white/10 hover:text-white data-[active=true]:bg-violet-500/25 data-[active=true]:text-violet-300 data-[active=true]:[&>svg]:text-violet-300"
                  onClick={() => router.push(item.path)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <div className="mt-6 px-1.5 text-[11px] uppercase tracking-wide text-white/45 group-data-[collapsible=icon]:hidden">
            CONTA
          </div>

          <SidebarMenu className="mt-1.5">
            {ACCOUNT_MENU.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isPathActive(pathname, item.path)}
                  tooltip={item.label}
                  className="h-9 text-[14px] text-white/90 hover:bg-white/10 hover:text-white data-[active=true]:bg-violet-500/25 data-[active=true]:text-violet-300 data-[active=true]:[&>svg]:text-violet-300"
                  onClick={() => router.push(item.path)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-[#1a1a1f] p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left hover:bg-white/5 group-data-[collapsible=icon]:justify-center">
                <Avatar className="h-8 w-8 border border-white/20">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt="" className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-xs font-semibold">
                    {(user.name ?? user.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-xs text-white">{user.name ?? "Aluno"}</p>
                  <p className="truncate text-[11px] text-white/55">{user.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/configuracoes")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh bg-[#000000] text-white">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1a1a1f] bg-[#05070d] px-2 md:px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
          </div>

          <div className="flex items-center gap-2">
            <button className="relative rounded-md p-1.5 text-white/75 hover:bg-white/10 hover:text-white" aria-label="Notificações">
              <Bell className="h-4 w-4" />
              <span className="absolute right-0 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-lg px-1 py-1.5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 border border-white/20 rounded-full bg-violet-700">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt="" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-xs font-semibold text-white">
                      {(user.name ?? user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-white/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/configuracoes")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-2 md:p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}

function SidebarTop({ onLogoClick }: { onLogoClick: () => void }) {
  const { state, toggleSidebar } = useSidebar();

  return (
    <div className="flex w-full items-center justify-between gap-1">
      <button
        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-1.5 text-left hover:bg-white/5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        onClick={state === "collapsed" ? toggleSidebar : onLogoClick}
      >
        {state === "collapsed" ? (
          <img
            src="/branding/logo-compass-white.svg"
            alt="Compass Bússola de vendas"
            className="mx-auto h-6 w-6 max-w-[24px] shrink-0 object-contain object-center text-white"
          />
        ) : (
          <>
            <img
              src="/branding/logo-vcp-white.svg"
              alt="vcp+"
              className="h-8 w-auto shrink-0 object-contain text-white"
            />
            <div className="min-w-0 flex-1">
              <p className="break-words text-[11px] font-medium leading-tight text-white">Método COMPASS</p>
              <p className="break-words text-[10px] leading-tight text-white/90">Bússola de vendas</p>
            </div>
          </>
        )}
      </button>
      {state === "expanded" && (
        <button
          onClick={toggleSidebar}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/85 hover:bg-white/10 hover:text-white"
          aria-label="Recolher menu"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
