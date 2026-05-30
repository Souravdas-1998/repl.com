import { useState } from "react";
import { 
  useHealthCheck,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateCategory,
  useListProducts,
  useListCategories,
  useListOrders,
  useGetOrder
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { data: health } = useHealthCheck();
  const { data: products } = useListProducts();
  const { data: categories } = useListCategories();
  const { data: orders } = useListOrders();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  // Use get order conditionally
  const { data: selectedOrder } = useGetOrder(selectedOrderId || 0, {
    query: {
      enabled: !!selectedOrderId
    }
  });

  const handleCreateCategory = () => {
    createCategory.mutate({
      data: {
        name: "New Category",
        slug: "new-category-" + Date.now(),
        description: "A newly created category"
      }
    }, {
      onSuccess: () => toast({ title: "Category created" })
    });
  };

  const handleCreateProduct = () => {
    if (!categories || categories.length === 0) {
      toast({ title: "Create a category first", variant: "destructive" });
      return;
    }
    
    createProduct.mutate({
      data: {
        name: "New Product",
        price: 99.99,
        category: categories[0].slug,
        description: "A newly created product",
        inStock: true
      }
    }, {
      onSuccess: () => toast({ title: "Product created" })
    });
  };

  const handleDeleteProduct = (id: number) => {
    deleteProduct.mutate({ id }, {
      onSuccess: () => toast({ title: "Product deleted" })
    });
  };

  const handleToggleStock = (id: number, currentStock: boolean) => {
    updateProduct.mutate({
      id,
      data: { inStock: !currentStock }
    }, {
      onSuccess: () => toast({ title: "Stock updated" })
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tighter">Store Admin</h1>
        <div className="flex items-center gap-2 text-sm font-medium">
          API Status: 
          {health?.status === 'ok' ? (
            <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/20 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Online</Badge>
          ) : (
            <Badge variant="destructive" className="border-none"><AlertCircle className="w-3 h-3 mr-1" /> Offline</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-8 w-full justify-start rounded-none border-b h-12 bg-transparent p-0">
          <TabsTrigger value="products" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6">
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6">
            Categories
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6">
            Orders
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleCreateProduct} disabled={createProduct.isPending} className="rounded-none uppercase tracking-widest text-xs">
              Add Product
            </Button>
          </div>
          
          <div className="border border-border/50 bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 uppercase tracking-widest text-xs text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {products?.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4">${p.price.toFixed(2)}</td>
                    <td className="px-6 py-4 uppercase text-xs">{p.category}</td>
                    <td className="px-6 py-4">
                      <Button 
                        variant={p.inStock ? "outline" : "secondary"} 
                        size="sm"
                        className="h-7 text-xs rounded-none"
                        onClick={() => handleToggleStock(p.id, p.inStock)}
                        disabled={updateProduct.isPending}
                      >
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none"
                        onClick={() => handleDeleteProduct(p.id)}
                        disabled={deleteProduct.isPending}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {!products?.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleCreateCategory} disabled={createCategory.isPending} className="rounded-none uppercase tracking-widest text-xs">
              Add Category
            </Button>
          </div>
          
          <div className="border border-border/50 bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 uppercase tracking-widest text-xs text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {categories?.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{c.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.slug}</td>
                    <td className="px-6 py-4">{c.productCount || 0}</td>
                  </tr>
                ))}
                {!categories?.length && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border/50 bg-card">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 uppercase tracking-widest text-xs text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {orders?.map(o => (
                    <tr 
                      key={o.id} 
                      className={`cursor-pointer transition-colors ${selectedOrderId === o.id ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                      onClick={() => setSelectedOrderId(o.id)}
                    >
                      <td className="px-6 py-4 font-medium font-mono">{o.id}</td>
                      <td className="px-6 py-4">${o.total.toFixed(2)}</td>
                      <td className="px-6 py-4 uppercase text-xs tracking-wider">{o.status}</td>
                    </tr>
                  ))}
                  {!orders?.length && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="border border-border/50 bg-card p-6">
              <h3 className="font-bold tracking-tighter uppercase mb-6">Order Details</h3>
              {selectedOrder ? (
                <div className="space-y-6 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground uppercase text-xs tracking-widest mb-1">Customer</p>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p className="text-muted-foreground">{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase text-xs tracking-widest mb-1">Shipping</p>
                      <p className="font-medium">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase text-xs tracking-widest mb-3">Items</p>
                    <div className="space-y-3">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${item.price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select an order to view details
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
