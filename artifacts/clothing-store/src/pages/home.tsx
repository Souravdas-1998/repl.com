import { Link } from "wouter";
import { 
  useGetFeaturedProducts, 
  useListCategories, 
  useGetProductStats 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { Sparkles, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useGetFeaturedProducts();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: stats } = useGetProductStats();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3 py-1 border-none tracking-widest uppercase text-xs">
            StyleAI Collection
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">
            Intelligence <br className="hidden md:block" /> Meets Fashion
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover your perfect look with our curated collection, powered by an AI stylist that knows your taste better than you do.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="rounded-none uppercase tracking-widest px-8 w-full sm:w-auto">
                Shop Collection
              </Button>
            </Link>
            <Link href="/ai-stylist">
              <Button size="lg" variant="outline" className="rounded-none uppercase tracking-widest px-8 w-full sm:w-auto gap-2 bg-background/50 backdrop-blur-md">
                <Sparkles className="w-4 h-4" />
                Meet Your Stylist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter uppercase mb-2">Featured</h2>
            <p className="text-muted-foreground">Curated picks for the season.</p>
          </div>
          <Link href="/products?featured=true" className="hidden sm:flex items-center gap-2 text-sm font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="py-20 md:py-32 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter uppercase mb-2">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our tailored selections.</p>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[400px] w-full rounded-none" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories?.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <div className="group relative h-[400px] overflow-hidden cursor-pointer flex items-center justify-center bg-background">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted transition-transform duration-700 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <div className="relative z-10 bg-background/90 backdrop-blur-sm px-8 py-4 text-center transform transition-transform group-hover:-translate-y-2">
                      <h3 className="text-xl font-bold tracking-widest uppercase mb-1">{category.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        {category.productCount} Items
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Summary */}
      {stats && (
        <section className="py-20 border-t">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tighter mb-2">{stats.totalProducts}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Unique Styles</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tighter mb-2">{stats.totalCategories}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Categories</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tighter mb-2">{stats.featuredCount}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Featured Curations</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tighter mb-2">{stats.totalOrders}+</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Happy Customers</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Add Badge inline since it's not exported
function Badge({ className, children, ...props }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
