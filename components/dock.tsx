"use client";

import { Box, ChartArea, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";

function Dock() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/stock", icon: Box, label: "Stock" },
    { href: "/reports", icon: ChartArea, label: "Reports" },
  ];

  return (
    <ButtonGroup className="mx-auto">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;

        return (
          <Button
            key={href}
            size="lg"
            variant={isActive ? "default" : "outline"}
            asChild
          >
            <Link href={href}>
              <Icon /> {label}
            </Link>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

export default Dock;
