import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetProduct, 
  getGetProductQueryKey,
  useAddToCart,
  useGetOutfitSuggestions,
  Product
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Sparkles, ArrowLeft, Star, Ruler, RefreshCcw } from "lucide-react";
import { ProductCard } from "@/components/product-card";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const { data: product, isLoading, error } = useGetProduct(productId, {
    query: {
      enabled: !!productId,
      queryKey: getGetProductQueryKey(productId)
    }
  });

  const addToCart = useAddToCart();
  const getOutfit = useGetOutfitSuggestions();

  const isDiscounted = product && product.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }
    
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive"
      });
      return;
    }

    addToCart.mutate({
      data: {
        productId: product.id,
        quantity: 1,
        size: selectedSize || undefined,
        color: selectedColor || undefined
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`
        });
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
    });
  };

  const handleGetOutfit = () => {
    if (!product) return;
    
    getOutfit.mutate({
      data: { productId: product.id }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold tracking-tighter uppercase mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button className="rounded-none uppercase tracking-widest px-8">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </Link>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-24 mb-24">
        {/* Images */}
        <div className="w-full md:w-1/2">
          <div className="aspect-[3/4] bg-muted relative">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="uppercase tracking-widest">No Image</span>
              </div>
            )}
            
            {product.featured && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-none uppercase text-xs tracking-wider px-3 py-1.5 border-none shadow-none">
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col pt-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
              {isDiscounted && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            
            {product.rating && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-primary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? 'fill-current' : 'opacity-30'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}
            
            <p className="text-muted-foreground leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          <div className="space-y-8 mb-10 flex-1">
            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium uppercase tracking-widest">Color</h3>
                  <span className="text-sm text-muted-foreground">{selectedColor || 'Select'}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 px-4 border text-sm font-medium transition-colors
                        ${selectedColor === color 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium uppercase tracking-widest">Size</h3>
                  <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 min-w-12 px-4 border text-sm font-medium transition-colors
                        ${selectedSize === size 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full h-14 rounded-none uppercase tracking-widest text-sm"
              disabled={!product.inStock || addToCart.isPending}
              onClick={handleAddToCart}
            >
              {addToCart.isPending ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : !product.inStock ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-14 rounded-none uppercase tracking-widest text-sm border-primary/20 hover:border-primary hover:bg-primary/5 gap-2"
              onClick={handleGetOutfit}
              disabled={getOutfit.isPending}
            >
              {getOutfit.isPending ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Complete the Outfit
            </Button>
          </div>
        </div>
      </div>

      {/* AI Outfit Suggestions Panel */}
      {getOutfit.data && (
        <div className="mt-24 pt-16 border-t">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-bold tracking-widest uppercase text-sm">StyleAI Suggestion</h2>
              </div>
              <p className="text-xl md:text-2xl font-light leading-relaxed">
                "{getOutfit.data.outfitDescription}"
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {getOutfit.data.suggestions.map((suggestedProduct: Product) => (
              <ProductCard key={suggestedProduct.id} product={suggestedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
