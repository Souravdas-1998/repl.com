import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Package, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tighter uppercase mb-12">Order History</h1>
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted flex items-center justify-center rounded-full mb-8">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter uppercase mb-4">No orders yet</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          You haven't placed any orders. Start shopping to build your perfect wardrobe.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-none uppercase tracking-widest px-8 h-14">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-none rounded-none uppercase text-[10px] tracking-wider"><CheckCircle2 className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="rounded-none border-none uppercase text-[10px] tracking-wider"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>;
      default:
        return <Badge variant="outline" className="rounded-none uppercase text-[10px] tracking-wider">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-12">Order History</h1>
      
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="border border-border/50 bg-card">
            <div className="border-b border-border/50 bg-muted/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 text-sm">
                <div>
                  <p className="text-muted-foreground uppercase text-xs tracking-widest mb-1">Order Placed</p>
                  <p className="font-medium">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-xs tracking-widest mb-1">Total Amount</p>
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-xs tracking-widest mb-1">Ship To</p>
                  <p className="font-medium truncate max-w-[150px]">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-xs tracking-widest mb-1">Order #</p>
                  <p className="font-medium font-mono">{order.id.toString().padStart(6, '0')}</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-between md:justify-end w-full md:w-auto mt-4 md:mt-0">
                {getStatusBadge(order.status)}
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-16 h-20 bg-muted shrink-0 flex items-center justify-center text-[10px] uppercase text-muted-foreground">
                      Img
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productId}`}>
                        <h4 className="font-medium uppercase tracking-wide hover:underline truncate">{item.productName}</h4>
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
                <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs h-10">
                  View Invoice
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
