import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  useGetCart, 
  useUpdateCartItem, 
  useRemoveFromCart, 
  useCreateOrder,
  useClearCart
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  shippingAddress: z.string().min(10, "Full address is required"),
});

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const createOrder = useCreateOrder();
  const clearCart = useClearCart();
  
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      shippingAddress: "",
    },
  });

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    updateItem.mutate({
      id,
      data: { quantity: newQuantity }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
    });
  };

  const handleRemove = (id: number) => {
    removeItem.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart."
        });
      }
    });
  };

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    createOrder.mutate({
      data: values
    }, {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        clearCart.mutate();
        toast({
          title: "Order placed successfully!",
          description: `Your order #${order.id} has been confirmed.`
        });
        setLocation("/orders");
      },
      onError: () => {
        toast({
          title: "Checkout failed",
          description: "There was an error processing your order. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tighter uppercase mb-12">Your Cart</h1>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3 space-y-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-none" />
            ))}
          </div>
          <div className="w-full lg:w-1/3">
            <Skeleton className="h-96 w-full rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted flex items-center justify-center rounded-full mb-8">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter uppercase mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Looks like you haven't added anything to your cart yet. Discover our latest collection and find your perfect outfit.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-none uppercase tracking-widest px-8 h-14">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-12">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Cart Items */}
        <div className="w-full lg:w-3/5">
          <div className="border-t border-border/50">
            {cart.items.map((item) => (
              <div key={item.id} className="py-8 border-b border-border/50 flex gap-6">
                <Link href={`/products/${item.product.id}`} className="shrink-0">
                  <div className="w-24 md:w-32 aspect-[3/4] bg-muted relative">
                    {item.product.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase tracking-widest">
                        Image
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-medium md:text-lg uppercase tracking-wide hover:underline">{item.product.name}</h3>
                    </Link>
                    <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4 space-y-1">
                    {item.size && <p>Size: {item.size}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                    <p>${item.product.price.toFixed(2)} each</p>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1 || updateItem.isPending}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="w-10 h-8 flex items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={updateItem.isPending}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      disabled={removeItem.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Remove item</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Checkout Form & Summary */}
        <div className="w-full lg:w-2/5">
          <div className="bg-muted/30 p-6 md:p-8 rounded-none border border-border/50 sticky top-24">
            <h2 className="text-xl font-bold tracking-tighter uppercase mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t pt-8">
              <h3 className="font-bold tracking-widest uppercase text-sm mb-6">Checkout Details</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs tracking-widest text-muted-foreground">Full Name</FormLabel>
                        <FormControl>
                          <Input className="rounded-none border-t-0 border-x-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary" placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs tracking-widest text-muted-foreground">Email</FormLabel>
                        <FormControl>
                          <Input type="email" className="rounded-none border-t-0 border-x-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary" placeholder="jane@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs tracking-widest text-muted-foreground">Shipping Address</FormLabel>
                        <FormControl>
                          <Input className="rounded-none border-t-0 border-x-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary" placeholder="123 Fashion Ave, NY 10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-14 rounded-none uppercase tracking-widest mt-8"
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? "Processing..." : "Place Order"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
