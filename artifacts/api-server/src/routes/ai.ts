import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { inArray, ne, eq } from "drizzle-orm";
import {
  GetOutfitSuggestionsBody,
  GetOutfitSuggestionsResponse,
  StyleChatBody,
  StyleChatResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/ai/outfit-suggestions", async (req, res): Promise<void> => {
  const parsed = GetOutfitSuggestionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, occasion } = parsed.data;

  const [anchorProduct] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!anchorProduct) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const otherProducts = await db
    .select()
    .from(productsTable)
    .where(ne(productsTable.id, productId))
    .limit(20);

  const shuffled = otherProducts.sort(() => Math.random() - 0.5);
  const suggestions = shuffled.slice(0, 3);

  const occasionText = occasion ? ` for ${occasion}` : "";
  const outfitDescription = `Complete your ${anchorProduct.category} look${occasionText} with these curated pieces that complement the ${anchorProduct.name} perfectly.`;

  res.json(
    GetOutfitSuggestionsResponse.parse({
      outfitDescription,
      suggestions,
    })
  );
});

router.post("/ai/style-chat", async (req, res): Promise<void> => {
  const parsed = StyleChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message } = parsed.data;

  const allProducts = await db.select().from(productsTable).limit(10);

  const lowerMsg = message.toLowerCase();
  let reply = "";
  let suggestedProductIds: number[] = [];

  if (lowerMsg.includes("outfit") || lowerMsg.includes("wear") || lowerMsg.includes("dress")) {
    const featured = allProducts.filter((p) => p.featured);
    suggestedProductIds = featured.slice(0, 3).map((p) => p.id);
    reply = `I'd love to help you put together a great outfit! Based on current trends, I'd suggest pairing a classic top with well-fitted bottoms. Check out these featured pieces I've picked for you — they're versatile and timeless.`;
  } else if (lowerMsg.includes("casual") || lowerMsg.includes("everyday")) {
    const casual = allProducts.filter((p) => p.tags?.includes("casual") || p.category === "casual");
    suggestedProductIds = casual.slice(0, 3).map((p) => p.id);
    reply = `For a casual everyday look, comfort meets style. I recommend pieces that are easy to mix and match — think neutral tones, relaxed fits, and quality fabrics. Here are some great casual picks from our collection.`;
  } else if (lowerMsg.includes("formal") || lowerMsg.includes("office") || lowerMsg.includes("work")) {
    const formal = allProducts.filter((p) => p.tags?.includes("formal") || p.category === "formal");
    suggestedProductIds = formal.slice(0, 3).map((p) => p.id);
    reply = `For a polished professional look, I recommend structured silhouettes and refined fabrics. The key is to invest in versatile staples that work across different settings. Here are some of my top picks for workplace elegance.`;
  } else if (lowerMsg.includes("budget") || lowerMsg.includes("cheap") || lowerMsg.includes("affordable")) {
    const budget = allProducts.filter((p) => p.price < 50).sort((a, b) => a.price - b.price);
    suggestedProductIds = budget.slice(0, 3).map((p) => p.id);
    reply = `Style doesn't have to break the bank! Here are some of our best value picks that look great without compromising quality. Smart shoppers know that great style is about how you wear it, not what you spend.`;
  } else if (lowerMsg.includes("trend") || lowerMsg.includes("new") || lowerMsg.includes("latest")) {
    const newest = [...allProducts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    suggestedProductIds = newest.slice(0, 3).map((p) => p.id);
    reply = `Staying on trend is all about knowing what's fresh and how to wear it with confidence. Here are our newest arrivals that are turning heads right now — each piece can anchor a great look for the season.`;
  } else {
    suggestedProductIds = allProducts.slice(0, 3).map((p) => p.id);
    reply = `As your AI style assistant, I'm here to help you look and feel your best! I can suggest outfits for any occasion, help you find pieces within your budget, or show you the latest trends. What kind of style are you going for today?`;
  }

  res.json(
    StyleChatResponse.parse({
      reply,
      suggestedProductIds,
    })
  );
});

export default router;
