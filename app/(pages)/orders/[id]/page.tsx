import { OrderDetailClient } from "@/components/order-detail-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <OrderDetailClient orderId={id} />;
}

export default OrderDetailPage;
