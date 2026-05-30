import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isDiscounted = product.originalPrice && product.originalPrice > product.price;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group cursor-pointer overflow-hidden border-transparent bg-transparent hover:bg-muted/50 transition-colors h-full flex flex-col rounded-none">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="uppercase text-xs tracking-widest font-medium">StyleAI</span>
              </div>
            )}
            
            {product.featured && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-none uppercase text-[10px] tracking-wider px-2 py-1 border-none shadow-none">
                Featured
              </Badge>
            )}
            
            {!product.inStock && (
              <Badge variant="destructive" className="absolute top-3 right-3 rounded-none uppercase text-[10px] tracking-wider px-2 py-1 border-none shadow-none">
                Sold Out
              </Badge>
            )}
            
            {isDiscounted && product.inStock && (
              <Badge variant="secondary" className="absolute top-3 right-3 rounded-none uppercase text-[10px] tracking-wider px-2 py-1 border-none shadow-none bg-background text-foreground">
                Sale
              </Badge>
            )}
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="font-medium text-sm truncate uppercase tracking-wide">{product.name}</h3>
              <div className="flex flex-col items-end">
                <span className="font-semibold text-sm">${product.price.toFixed(2)}</span>
                {isDiscounted && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.originalPrice?.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-auto uppercase tracking-wide">{product.category}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
