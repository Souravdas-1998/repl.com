import { Link, useLocation } from "wouter";
import { useGetCart } from "@workspace/api-client-react";
import { ShoppingBag, Sparkles, Package, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: cart } = useGetCart();

  const cartCount = cart?.itemCount || 0;

  const NavLinks = () => (
    <>
      <Link href="/products" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/products') ? 'text-primary' : 'text-muted-foreground'}`}>
        Shop
      </Link>
      <Link href="/ai-stylist" className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${location.startsWith('/ai-stylist') ? 'text-primary' : 'text-muted-foreground'}`}>
        <Sparkles className="w-4 h-4" />
        AI Stylist
      </Link>
      <Link href="/orders" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/orders') ? 'text-primary' : 'text-muted-foreground'}`}>
        Orders
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter uppercase">StyleAI</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <NavLinks />
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <footer className="border-t py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter uppercase">StyleAI</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Intelligence meets Fashion. A modern retail experience.
          </p>
        </div>
      </footer>
    </div>
  );
}
