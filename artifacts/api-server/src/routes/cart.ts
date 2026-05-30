import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import {
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  UpdateCartItemResponse,
  RemoveFromCartParams,
  GetCartResponse,
} from "@workspace/api-zod";

function serializeDates<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  ) as T;
}

const router: IRouter = Router();

async function buildCart() {
  const items = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      size: cartItemsTable.size,
      color: cartItemsTable.color,
      product: productsTable,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id));

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, total, itemCount };
}

router.get("/cart", async (_req, res): Promise<void> => {
  const cart = await buildCart();
  res.json(GetCartResponse.parse(cart));
});

router.delete("/cart", async (_req, res): Promise<void> => {
  await db.delete(cartItemsTable);
  res.sendStatus(204);
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity, size, color } = parsed.data;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [cartItem] = await db.insert(cartItemsTable).values({ productId, quantity, size, color }).returning();

  const itemWithProduct = {
    ...cartItem,
    product,
  };

  res.status(201).json(itemWithProduct);
});

router.patch("/cart/items/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCartItemParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(cartItemsTable)
    .set({ quantity: parsed.data.quantity })
    .where(eq(cartItemsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, updated.productId));

  res.json(UpdateCartItemResponse.parse({ ...updated, product }));
});

router.delete("/cart/items/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RemoveFromCartParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
