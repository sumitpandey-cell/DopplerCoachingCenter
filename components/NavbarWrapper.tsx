"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname() || "";
  const hideNavbar = pathname.startsWith("/student") || pathname.startsWith("/faculty") || pathname.startsWith("/admin");
  if (hideNavbar) return null;
  return <Navbar />;
} 