import { db, categoriesTable, productsTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  const existingCategories = await db.select().from(categoriesTable);
  if (existingCategories.length > 0) {
    console.log("Database already seeded, skipping.");
    process.exit(0);
  }

  const categories = await db
    .insert(categoriesTable)
    .values([
      { name: "T-Shirts", slug: "t-shirts", description: "Casual and comfortable everyday tees" },
      { name: "Jackets", slug: "jackets", description: "Outerwear for all seasons" },
      { name: "Dresses", slug: "dresses", description: "Elegant dresses for every occasion" },
      { name: "Denim", slug: "denim", description: "Classic and modern denim styles" },
      { name: "Sneakers", slug: "sneakers", description: "Comfortable and stylish footwear" },
      { name: "Accessories", slug: "accessories", description: "Complete your look with our accessories" },
    ])
    .returning();

  console.log(`Inserted ${categories.length} categories`);

  await db.insert(productsTable).values([
    {
      name: "Classic White Tee",
      description: "A timeless white cotton t-shirt with a relaxed fit. Made from 100% organic cotton, this versatile staple pairs with everything in your wardrobe.",
      price: 29.99,
      category: "t-shirts",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["White", "Black", "Grey"],
      tags: ["casual", "everyday", "basics"],
      inStock: true,
      featured: true,
      rating: 4.8,
      reviewCount: 234,
    },
    {
      name: "Graphic Logo Tee",
      description: "Bold graphic tee with an artistic print. Soft jersey fabric with a modern slim cut that looks great tucked in or worn loose.",
      price: 34.99,
      originalPrice: 49.99,
      category: "t-shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Olive"],
      tags: ["casual", "graphic", "streetwear"],
      inStock: true,
      featured: false,
      rating: 4.5,
      reviewCount: 89,
    },
    {
      name: "Leather Moto Jacket",
      description: "Premium faux-leather biker jacket with asymmetric zip, quilted shoulder panels, and snap-collar detail. The ultimate statement outerwear piece.",
      price: 189.99,
      originalPrice: 249.99,
      category: "jackets",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Black", "Brown"],
      tags: ["edgy", "statement", "outerwear"],
      inStock: true,
      featured: true,
      rating: 4.9,
      reviewCount: 156,
    },
    {
      name: "Oversized Wool Coat",
      description: "Luxuriously warm wool-blend coat in a relaxed oversized silhouette. Features a single-button closure and deep pockets. Investment dressing at its finest.",
      price: 299.99,
      category: "jackets",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Camel", "Black", "Ivory"],
      tags: ["formal", "winter", "luxury"],
      inStock: true,
      featured: true,
      rating: 4.7,
      reviewCount: 72,
    },
    {
      name: "Floral Wrap Dress",
      description: "Flattering wrap-style midi dress in a vibrant floral print. Lightweight viscose fabric that drapes beautifully. Perfect from brunch to evening events.",
      price: 89.99,
      originalPrice: 129.99,
      category: "dresses",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Floral Blue", "Floral Pink"],
      tags: ["feminine", "summer", "casual"],
      inStock: true,
      featured: true,
      rating: 4.6,
      reviewCount: 198,
    },
    {
      name: "Slip Satin Dress",
      description: "Minimalist satin slip dress with adjustable spaghetti straps. The ultimate versatile piece — wear solo or layered with a tee underneath.",
      price: 74.99,
      category: "dresses",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Champagne", "Black", "Sage"],
      tags: ["formal", "evening", "minimal"],
      inStock: true,
      featured: false,
      rating: 4.4,
      reviewCount: 113,
    },
    {
      name: "Slim Fit Jeans",
      description: "Classic 5-pocket slim fit jeans in premium stretch denim. The perfect balance of comfort and style with a tailored silhouette.",
      price: 79.99,
      category: "denim",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Indigo Blue", "Black", "Light Wash"],
      tags: ["everyday", "classic", "casual"],
      inStock: true,
      featured: false,
      rating: 4.7,
      reviewCount: 341,
    },
    {
      name: "High-Waist Mom Jeans",
      description: "Vintage-inspired high-waist jeans with a relaxed fit through the hip and thigh. Cropped above the ankle for a retro-modern look.",
      price: 84.99,
      category: "denim",
      sizes: ["25", "26", "27", "28", "29", "30"],
      colors: ["Light Wash", "Medium Wash", "White"],
      tags: ["retro", "vintage", "casual"],
      inStock: true,
      featured: false,
      rating: 4.5,
      reviewCount: 167,
    },
    {
      name: "Clean Runner Sneakers",
      description: "Sleek low-profile sneakers with a padded collar and cushioned insole. The minimalist design makes them easy to style with any outfit.",
      price: 119.99,
      originalPrice: 149.99,
      category: "sneakers",
      sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
      colors: ["White/Grey", "Black/White", "Navy"],
      tags: ["casual", "sport", "everyday"],
      inStock: true,
      featured: true,
      rating: 4.8,
      reviewCount: 289,
    },
    {
      name: "Chunky Platform Boots",
      description: "Statement platform boots with a chunky lug sole and side zip. Premium synthetic leather upper with a padded ankle collar for comfort.",
      price: 159.99,
      category: "sneakers",
      sizes: ["36", "37", "38", "39", "40", "41"],
      colors: ["Black", "White"],
      tags: ["edgy", "streetwear", "statement"],
      inStock: false,
      featured: false,
      rating: 4.6,
      reviewCount: 45,
    },
    {
      name: "Leather Crossbody Bag",
      description: "Compact crossbody bag in genuine pebbled leather. Adjustable strap, interior slip pockets, and gold-tone hardware. The perfect everyday carry.",
      price: 129.99,
      originalPrice: 179.99,
      category: "accessories",
      sizes: ["One Size"],
      colors: ["Black", "Tan", "Burgundy"],
      tags: ["formal", "everyday", "accessory"],
      inStock: true,
      featured: false,
      rating: 4.9,
      reviewCount: 87,
    },
    {
      name: "Silk Scarf",
      description: "Luxurious 100% silk square scarf in a vibrant painterly print. Wear as a necktie, headband, or tied to your bag for an instant style update.",
      price: 49.99,
      category: "accessories",
      sizes: ["One Size"],
      colors: ["Multicolor Blue", "Multicolor Pink"],
      tags: ["accessory", "luxe", "gift"],
      inStock: true,
      featured: false,
      rating: 4.7,
      reviewCount: 62,
    },
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
