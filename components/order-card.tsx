import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

interface OrderCardProps {
  id: Id<"orders">;
  date: string;
  customer: string;
  items: number;
  total: number;
  linkTo?: string; // Optional link to order detail page
  onClick?: (id: Id<"orders">) => void; // Optional click handler
}

export function OrderCard({
  id,
  date,
  customer,
  items,
  total,
  linkTo,
  onClick,
}: OrderCardProps) {
  const content = (
    <>
      <Badge variant="secondary">{date}</Badge>
      <p className="mt-3 capitalize sm:text-base text-sm">
        <span className="font-medium uppercase">customer:</span> {customer}
      </p>
      <p className="mt-1 capitalize sm:text-base text-sm">
        <span className="font-medium uppercase">Items:</span> {items}
      </p>
      <p className="mt-1 capitalize sm:text-base text-sm">
        <span className="font-medium uppercase">Total:</span> ₹{total}
      </p>
    </>
  );

  // If linkTo is provided, wrap in Link
  if (linkTo) {
    return (
      <Link href={linkTo} className="block">
        <div className="border p-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
          {content}
        </div>
      </Link>
    );
  }

  // If onClick is provided, make it clickable
  if (onClick) {
    return (
      <div
        onClick={() => onClick(id)}
        className="border p-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
      >
        {content}
      </div>
    );
  }

  // Default: non-clickable card
  return <div className="border p-3">{content}</div>;
}
