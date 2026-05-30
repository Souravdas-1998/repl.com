import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  useStyleChat, 
  useGetProduct,
  getGetProductQueryKey,
  ChatMessage 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCard } from "@/components/product-card";
import { Sparkles, Send, User, Bot, Loader2 } from "lucide-react";

// Custom component to fetch and render a product inline based on ID
function SuggestedProduct({ id }: { id: number }) {
  const { data: product, isLoading } = useGetProduct(id, { query: { queryKey: getGetProductQueryKey(id) } });

  if (isLoading) return <div className="h-64 w-48 bg-muted animate-pulse shrink-0 border border-border" />;
  if (!product) return null;

  return (
    <div className="w-64 shrink-0">
      <ProductCard product={product} />
    </div>
  );
}

export default function AIStylist() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello. I'm StyleAI, your personal stylist. Tell me about your upcoming event, your preferred aesthetic, or what you're looking for today, and I'll curate the perfect pieces for you."
    }
  ]);
  const [input, setInput] = useState("");
  const [suggestedIds, setSuggestedIds] = useState<number[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = useStyleChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    setInput("");
    setSuggestedIds([]); // Clear previous suggestions

    chatMutation.mutate({
      data: {
        message: userMessage.content,
        history: messages // pass history up to this point
      }
    }, {
      onSuccess: (data) => {
        setMessages([
          ...newHistory,
          { role: "assistant", content: data.reply }
        ]);
        if (data.suggestedProductIds && data.suggestedProductIds.length > 0) {
          setSuggestedIds(data.suggestedProductIds);
        }
      }
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 h-[calc(100vh-4rem)] flex flex-col max-w-5xl">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">StyleAI Studio</h1>
        <p className="text-muted-foreground">Conversational curation. Discover what works for you.</p>
      </div>

      <div className="flex-1 border bg-card/50 backdrop-blur flex flex-col overflow-hidden shadow-xl">
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-8 pb-4">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1
                  ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-l-2xl rounded-tr-2xl' 
                      : 'bg-muted text-foreground rounded-r-2xl rounded-tl-2xl border'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground shrink-0 flex items-center justify-center mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-muted text-foreground rounded-r-2xl rounded-tl-2xl border p-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Curating looks...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Product Suggestions Panel */}
        {suggestedIds.length > 0 && !chatMutation.isPending && (
          <div className="border-t bg-muted/30 p-6 overflow-x-auto">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Curated Pieces</h3>
            <div className="flex gap-4 pb-2">
              {suggestedIds.map(id => (
                <SuggestedProduct key={id} id={id} />
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-background border-t">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a look, occasion, or style..."
              className="h-14 pr-14 rounded-full border-muted-foreground/30 focus-visible:ring-primary focus-visible:border-primary bg-background shadow-sm"
              disabled={chatMutation.isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 h-10 w-10 rounded-full"
              disabled={!input.trim() || chatMutation.isPending}
            >
              <Send className="w-4 h-4 ml-1" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              StyleAI can make mistakes. Consider pieces critically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
