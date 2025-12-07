"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header({ lang }: { lang: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const isAr = lang === "ar";
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push(`/${lang}/login`);
    };

    return (
        <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${lang}`} className="font-bold text-2xl bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent">
                    {isAr ? "بصيرة" : "Baseera"}
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <div className="w-8 h-8 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <span>{user.email}</span>
                            </div>
                            <Link href={`/${lang}/dashboard`}>
                                <Button variant="ghost" size="sm" className="text-slate-700 hover:bg-slate-100">
                                    {isAr ? "لوحة التحكم" : "Dashboard"}
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <LogOut className="w-4 h-4 mr-2" />
                                {isAr ? "خروج" : "Logout"}
                            </Button>
                        </div>
                    ) : (
                        <Link href={`/${lang}/login`}>
                            <Button variant="default" className="bg-brand-indigo hover:bg-brand-indigo/90">
                                {isAr ? "دخول" : "Login"}
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden border-t p-4 bg-white shadow-lg absolute w-full left-0 top-16 flex flex-col gap-4">
                    {user ? (
                        <>
                            <div className="text-sm font-medium text-slate-700 px-2 break-all">
                                {user.email}
                            </div>
                            <Link href={`/${lang}/dashboard`}>
                                <Button variant="ghost" className="w-full justify-start text-slate-700">
                                    {isAr ? "لوحة التحكم" : "Dashboard"}
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={handleLogout} className="w-full justify-start text-red-500">
                                <LogOut className="w-4 h-4 mr-2" />
                                {isAr ? "خروج" : "Logout"}
                            </Button>
                        </>
                    ) : (
                        <Link href={`/${lang}/login`} onClick={() => setMenuOpen(false)}>
                            <Button className="w-full">
                                {isAr ? "دخول" : "Login"}
                            </Button>
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
