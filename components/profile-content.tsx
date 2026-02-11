"use client";

import Link from "next/link";
import { ChevronRight, Receipt, UserCog, Users } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  href: string;
};

const menuItems: MenuItem[] = [
  {
    id: "customers",
    label: "All Customers",
    icon: <Users className="h-5 w-5" />,
    description: "View and manage all your customers",
    href: "/customers",
  },
  {
    id: "bills",
    label: "Bills",
    icon: <Receipt className="h-5 w-5" />,
    description: "Track and manage invoices and payments",
    href: "/bills",
  },
  {
    id: "users",
    label: "Users",
    icon: <UserCog className="h-5 w-5" />,
    description: "Manage team members involved in the business",
    href: "/users",
  },
];

export default function ProfileContent() {
  return (
    <div className="flex flex-col gap-4">
      {menuItems.map((item) => (
        <Item key={item.id} variant="outline" asChild>
          <Link href={item.href}>
            <ItemMedia variant="icon">{item.icon}</ItemMedia>
            <ItemContent>
              <ItemTitle>{item.label}</ItemTitle>
              <ItemDescription>{item.description}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight className="h-5 w-5" />
            </ItemActions>
          </Link>
        </Item>
      ))}
    </div>
  );
}
