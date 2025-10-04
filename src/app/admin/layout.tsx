
"use client";

import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import LoginForm from "@/components/admin/login-form";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/services/auth-service";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }
  
  if (!ADMIN_EMAIL) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/20 bg-destructive/10">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="mt-4 text-2xl font-bold">Configuration Error</CardTitle>
                <CardDescription>The admin email has not been configured. Please set the NEXT_PUBLIC_ADMIN_EMAIL environment variable.</CardDescription>
            </CardHeader>
        </Card>
       </main>
    )
  }
  
  // Trim and convert to lowercase for a robust comparison
  const userEmail = user.email?.trim().toLowerCase();
  const adminEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (userEmail !== adminEmail) {
    return (
       <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/20 bg-destructive/10">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="mt-4 text-2xl font-bold">Access Denied</CardTitle>
                <CardDescription>You do not have permission to view this page. This area is for authorized administrators only.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Logged in as: {user.email}</p>
                <Button onClick={() => handleSignOut()}>Logout</Button>
            </CardContent>
        </Card>
       </main>
    )
  }

  return (
    <SidebarProvider defaultOpen>
        <div className="flex min-h-screen bg-muted/40 dark:bg-background">
          <AdminSidebar onLogout={handleSignOut} />
          <div className="flex flex-col flex-1">
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
    </SidebarProvider>
  );
}
