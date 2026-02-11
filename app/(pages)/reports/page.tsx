import { OrdersGraph } from "@/components/orders-graph";
import { PurchaseGraph } from "@/components/purchase-graph";
import { RevenueGraphChart } from "@/components/revenue-graph";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  ChevronRight,
  ChevronsRight,
  CircleUser,
  Receipt,
  ReceiptText,
  UserCog,
  Users,
  UserStar,
} from "lucide-react";
import Link from "next/link";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  href: string;
};

function page() {
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

  return (
    <div className="w-full flex flex-col gap-4">
      <RevenueGraphChart />

      <div className="grid sm:grid-cols-2 gap-4">
        <OrdersGraph />
        <PurchaseGraph />
      </div>

      <div className="flex flex-col gap-2">
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
    </div>
  );
}

export default page;
