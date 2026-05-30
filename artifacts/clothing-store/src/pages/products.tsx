import { useState } from "react";
import { Link } from "wouter";
import { 
  useListProducts, 
  useListCategories 
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Products() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || undefined;
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [sort, setSort] = useState("newest");
  
  const { data: products, isLoading } = useListProducts({ 
    search: search || undefined, 
    category: category === "all" ? undefined : category 
  });
  
  const { data: categories } = useListCategories();

  // Handle client-side sorting since API doesn't support it in params directly
  const sortedProducts = products ? [...products].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }) : [];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Collection</h1>
          <p className="text-muted-foreground">Discover the latest arrivals and curated selections.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-none bg-muted/50 border-transparent focus-visible:ring-primary"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-none shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="uppercase tracking-widest">Filters</SheetTitle>
                <SheetDescription>
                  Refine your search results.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-widest">Category</h3>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant={category === undefined || category === "all" ? "default" : "ghost"} 
                      className={`justify-start rounded-none ${category === undefined || category === "all" ? '' : 'text-muted-foreground'}`}
                      onClick={() => setCategory("all")}
                    >
                      All Categories
                    </Button>
                    {categories?.map((c) => (
                      <Button 
                        key={c.id} 
                        variant={category === c.slug ? "default" : "ghost"} 
                        className={`justify-start rounded-none ${category === c.slug ? '' : 'text-muted-foreground'}`}
                        onClick={() => setCategory(c.slug)}
                      >
                        {c.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px] rounded-none border-transparent bg-muted/50 hidden md:flex">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="newest">Newest Arrivals</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-32 text-center flex flex-col items-center justify-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold tracking-tighter uppercase mb-2">No products found</h2>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any products matching your current filters. Try adjusting your search or clearing your filters.
          </p>
          <Button 
            className="mt-8 rounded-none uppercase tracking-widest px-8" 
            onClick={() => { setSearch(""); setCategory(undefined); }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}