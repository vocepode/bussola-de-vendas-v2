"use client";

import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeSwitch from "@/components/ui/theme-switch";
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
import { useIsMobile } from "@/components/hooks/use-mobile";
import {
  Bell,
  BookOpen,
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
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const MAIN_MENU = [
  { icon: Grid2x2, label: "Dashboard", path: "/" },
  { icon: Compass, label: "Minha Bússola", path: "/minha-bussola" },
  { icon: BookOpen, label: "Meus cursos", path: "/meus-cursos" },
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
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  /** Quando tema é dark: shell e conteúdo escuros. Quando tema é light: shell e conteúdo claros em todas as seções. */
  const sidebarLight = theme !== "dark";
  const contentLight = theme === "light";

  useEffect(() => {
    if (loading) return;
    if (user) return;
    router.replace("/login");
  }, [loading, router, user]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  const showUser = !!user;

  return (
    <SidebarProvider defaultOpen style={{ "--sidebar-width": "220px" } as CSSProperties}>
      <Sidebar
        collapsible="icon"
        className={cn(
          "border-r",
          sidebarLight ? "border-border bg-background" : "border-[#262626] bg-[#111111]"
        )}
      >
        <SidebarHeader
          className={cn("h-14 border-b px-2", sidebarLight ? "border-border" : "border-[#262626]")}
        >
          <SidebarTop theme={sidebarLight ? "light" : "dark"} onLogoClick={() => router.push("/")} />
        </SidebarHeader>

        <SidebarContent
          className={cn("px-1.5 py-2", sidebarLight ? "text-foreground" : "text-white")}
        >
          <SidebarMenu>
            {MAIN_MENU.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isPathActive(pathname, item.path)}
                  tooltip={item.label}
                  className={cn(
                    "h-9 text-[14px]",
                    sidebarLight
                      ? "text-foreground/90 hover:bg-muted hover:text-foreground data-[active=true]:bg-primary/25 data-[active=true]:text-primary data-[active=true]:[&>svg]:text-primary"
                      : "text-white/90 hover:bg-white/10 hover:text-white data-[active=true]:bg-primary/25 data-[active=true]:text-white data-[active=true]:[&>svg]:text-white"
                  )}
                  onClick={() => router.push(item.path)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <div
            className={cn(
              "mt-6 px-1.5 text-[11px] uppercase tracking-wide group-data-[collapsible=icon]:hidden",
              sidebarLight ? "text-muted-foreground" : "text-white/45"
            )}
          >
            CONTA
          </div>

          <SidebarMenu className="mt-1.5">
            {ACCOUNT_MENU.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isPathActive(pathname, item.path)}
                  tooltip={item.label}
                  className={cn(
                    "h-9 text-[14px]",
                    sidebarLight
                      ? "text-foreground/90 hover:bg-muted hover:text-foreground data-[active=true]:bg-primary/25 data-[active=true]:text-primary data-[active=true]:[&>svg]:text-primary"
                      : "text-white/90 hover:bg-white/10 hover:text-white data-[active=true]:bg-primary/25 data-[active=true]:text-white data-[active=true]:[&>svg]:text-white"
                  )}
                  onClick={() => router.push(item.path)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter
          className={cn("border-t p-2", sidebarLight ? "border-border" : "border-[#262626]")}
        >
          {showUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left group-data-[collapsible=icon]:justify-center",
                    sidebarLight ? "hover:bg-muted" : "hover:bg-white/5"
                  )}
                >
                  <Avatar
                    className={cn(
                      "h-8 w-8 border",
                      sidebarLight ? "border-border" : "border-white/20"
                    )}
                  >
                    {user!.avatarUrl ? (
                      <AvatarImage src={user!.avatarUrl} alt="" className="object-cover" />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        "text-xs font-semibold",
                        sidebarLight ? "text-foreground" : "bg-white/15 text-white"
                      )}
                    >
                      {(user!.name ?? user!.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p
                      className={cn(
                        "truncate text-xs",
                        sidebarLight ? "text-foreground" : "text-white"
                      )}
                    >
                      {user!.name ?? "Aluno"}
                    </p>
                    <p
                      className={cn(
                        "truncate text-[11px]",
                        sidebarLight ? "text-muted-foreground" : "text-white/55"
                      )}
                    >
                      {user!.email}
                    </p>
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
          ) : (
            <div className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left group-data-[collapsible=icon]:justify-center">
              <Avatar
                className={cn(
                  "h-8 w-8 border",
                  sidebarLight ? "border-border" : "border-white/20"
                )}
              >
                <AvatarFallback
                  className={cn(
                    "text-xs font-semibold",
                    sidebarLight ? "text-foreground" : "bg-white/15 text-white"
                  )}
                >
                  ?
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p
                  className={cn(
                    "truncate text-xs",
                    sidebarLight ? "text-muted-foreground" : "text-white/70"
                  )}
                >
                  Carregando…
                </p>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset
        className={cn(
          "min-h-svh",
          contentLight
            ? "content-area-light bg-background text-foreground"
            : "bg-[#0a0a0a] text-white"
        )}
      >
        <header
          className={cn(
            "sticky top-0 z-30 flex h-14 items-center justify-between px-2 md:px-4",
            contentLight
              ? "border-b border-border bg-background"
              : "border-b border-[#262626] bg-[#111111]"
          )}
        >
          <div className="flex items-center gap-2">
            {isMobile ? <SidebarTrigger /> : null}
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <button
              className={
                contentLight
                  ? "relative rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  : "relative rounded-md p-1.5 text-white/75 hover:bg-white/10 hover:text-white"
              }
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-0 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </button>
            {showUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={
                      contentLight
                        ? "flex items-center gap-1.5 rounded-lg px-1 py-1.5 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        : "flex items-center gap-1.5 rounded-lg px-1 py-1.5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    }
                  >
                    <Avatar
                      className={
                        contentLight
                          ? "h-8 w-8 border border-border rounded-full bg-violet-100"
                          : "h-8 w-8 border border-white/20 rounded-full bg-violet-700"
                      }
                    >
                      {user!.avatarUrl ? (
                        <AvatarImage src={user!.avatarUrl} alt="" className="object-cover" />
                      ) : null}
                      <AvatarFallback
                        className={
                          contentLight
                            ? "text-xs font-semibold text-violet-700"
                            : "text-xs font-semibold text-white"
                        }
                      >
                        {(user!.name ?? user!.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      className={contentLight ? "h-4 w-4 text-muted-foreground" : "h-4 w-4 text-white/70"}
                    />
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
            ) : (
              <Avatar
                className={
                  contentLight
                    ? "h-8 w-8 border border-border rounded-full bg-violet-100"
                    : "h-8 w-8 border border-white/20 rounded-full bg-violet-700"
                }
              >
                <AvatarFallback
                  className={
                    contentLight
                      ? "text-xs font-semibold text-violet-700"
                      : "text-xs font-semibold text-white"
                  }
                >
                  ?
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        <main className="p-2 md:p-4">
          {showUser ? children : (
            <div className={contentLight ? "flex min-h-[40vh] items-center justify-center text-muted-foreground" : "flex min-h-[40vh] items-center justify-center text-white/70"}>
              Carregando…
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SidebarTop({ theme, onLogoClick }: { theme: "light" | "dark"; onLogoClick: () => void }) {
  const { state, toggleSidebar } = useSidebar();
  const isDark = theme === "dark";
  const logoCompass = isDark ? "/branding/logo-compass-white.svg" : "/branding/logo-compass-black.svg";
  const logoVcp = isDark ? "/branding/logo-vcp-white.svg" : "/branding/logo-vcp-black.svg";

  return (
    <div className="flex w-full items-center justify-between gap-1">
      <button
        className={
          isDark
            ? "flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-1.5 text-left hover:bg-white/5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            : "flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-1.5 text-left hover:bg-muted group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        }
        onClick={state === "collapsed" ? toggleSidebar : onLogoClick}
      >
        {state === "collapsed" ? (
          <img
            src={logoCompass}
            alt="Compass Bússola de vendas"
            width={24}
            height={24}
            className="mx-auto h-6 w-6 min-h-[24px] min-w-[24px] shrink-0 object-contain object-center"
          />
        ) : (
          <>
            <img
              src={logoVcp}
              alt="vcp+"
              width={80}
              height={32}
              className="h-8 min-h-[32px] w-auto min-w-[60px] shrink-0 object-contain object-left"
            />
            <div className="min-w-0 flex-1">
              <p
                className={
                  isDark
                    ? "break-words text-[11px] font-medium leading-tight text-white"
                    : "break-words text-[11px] font-medium leading-tight text-foreground"
                }
              >
                Método COMPASS
              </p>
              <p
                className={
                  isDark
                    ? "break-words text-[10px] leading-tight text-white/90"
                    : "break-words text-[10px] leading-tight text-muted-foreground"
                }
              >
                Bússola de vendas
              </p>
            </div>
          </>
        )}
      </button>
      {state === "expanded" && (
        <button
          onClick={toggleSidebar}
          className={
            isDark
              ? "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/85 hover:bg-white/10 hover:text-white"
              : "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          }
          aria-label="Recolher menu"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
