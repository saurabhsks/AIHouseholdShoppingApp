import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Unit } from "../generated/prisma/client";

type VariantSeed = {
  label: string;
  amount: number;
  unit: Unit;
  pricePaise: number;
  stockQuantity: number;
  isActive?: boolean;
};

type ProductSeed = {
  slug: string;
  name: string;
  brand: string;
  description: string;
  isActive?: boolean;
  variants: VariantSeed[];
};

type CategorySeed = {
  slug: string;
  name: string;
  products: ProductSeed[];
};

const catalogue: CategorySeed[] = [
  {
    slug: "oral-care",
    name: "Toothpaste and oral care",
    products: [
      {
        slug: "colgate-strong-teeth",
        name: "Colgate Strong Teeth",
        brand: "Colgate",
        description: "Calcium toothpaste for daily use.",
        variants: [
          { label: "100 g", amount: 100, unit: Unit.G, pricePaise: 5500, stockQuantity: 48 },
          { label: "200 g", amount: 200, unit: Unit.G, pricePaise: 9900, stockQuantity: 36 },
        ],
      },
      {
        slug: "colgate-maxfresh",
        name: "Colgate MaxFresh",
        brand: "Colgate",
        description: "Cooling gel toothpaste.",
        variants: [
          { label: "150 g", amount: 150, unit: Unit.G, pricePaise: 12500, stockQuantity: 22 },
        ],
      },
      {
        slug: "pepsodent-germicheck",
        name: "Pepsodent Germicheck",
        brand: "Pepsodent",
        description: "Everyday cavity protection toothpaste.",
        variants: [
          { label: "200 g", amount: 200, unit: Unit.G, pricePaise: 8500, stockQuantity: 30 },
        ],
      },
      {
        slug: "closeup-everfresh",
        name: "Closeup Everfresh",
        brand: "Closeup",
        description:
          "Gel toothpaste. Out of stock. Similar in-stock options are Colgate and Pepsodent.",
        variants: [
          { label: "150 g", amount: 150, unit: Unit.G, pricePaise: 11000, stockQuantity: 0 },
        ],
      },
    ],
  },
  {
    slug: "laundry-detergent",
    name: "Laundry detergent",
    products: [
      {
        slug: "ghadi-detergent-powder",
        name: "Ghadi Detergent Powder",
        brand: "Ghadi",
        description: "Lowest package price among the in-stock detergents.",
        variants: [
          { label: "500 g", amount: 500, unit: Unit.G, pricePaise: 4500, stockQuantity: 60 },
        ],
      },
      {
        slug: "surf-excel-easy-wash",
        name: "Surf Excel Easy Wash",
        brand: "Surf Excel",
        description: "Detergent powder for everyday laundry.",
        variants: [
          { label: "500 g", amount: 500, unit: Unit.G, pricePaise: 7500, stockQuantity: 40 },
          { label: "1 kg", amount: 1000, unit: Unit.G, pricePaise: 13500, stockQuantity: 28 },
        ],
      },
      {
        slug: "ariel-matic",
        name: "Ariel Matic",
        brand: "Ariel",
        description: "Front-load machine detergent.",
        variants: [
          { label: "1 kg", amount: 1000, unit: Unit.G, pricePaise: 18900, stockQuantity: 16 },
        ],
      },
      {
        slug: "tide-nature-fresh",
        name: "Tide Nature Fresh",
        brand: "Tide",
        description: "Present in the catalogue with no packs left in stock.",
        variants: [
          { label: "1 kg", amount: 1000, unit: Unit.G, pricePaise: 21000, stockQuantity: 0 },
        ],
      },
      {
        slug: "wheel-detergent-powder",
        name: "Wheel Detergent Powder",
        brand: "Wheel",
        description:
          "Detergent powder. Out of stock. Similar in-stock options are Surf Excel, Ghadi, and Ariel.",
        variants: [
          { label: "1 kg", amount: 1000, unit: Unit.G, pricePaise: 9800, stockQuantity: 0 },
        ],
      },
      {
        slug: "retired-wash-powder",
        name: "Retired Wash Powder",
        brand: "Retired",
        description: "Inactive example. The API must not return this product.",
        isActive: false,
        variants: [
          { label: "500 g", amount: 500, unit: Unit.G, pricePaise: 1000, stockQuantity: 5 },
        ],
      },
    ],
  },
  {
    slug: "cooking-oil",
    name: "Cooking oil",
    products: [
      {
        slug: "fortune-sunflower-oil",
        name: "Fortune Sunflower Oil",
        brand: "Fortune",
        description: "Refined sunflower oil sold in several bottle sizes.",
        variants: [
          { label: "500 ml", amount: 500, unit: Unit.ML, pricePaise: 8500, stockQuantity: 24 },
          { label: "1 L", amount: 1000, unit: Unit.ML, pricePaise: 16000, stockQuantity: 18 },
          { label: "2 L", amount: 2000, unit: Unit.ML, pricePaise: 31000, stockQuantity: 12 },
        ],
      },
      {
        slug: "saffola-gold",
        name: "Saffola Gold",
        brand: "Saffola",
        description: "Blended cooking oil that is currently out of stock.",
        variants: [
          { label: "1 L", amount: 1000, unit: Unit.ML, pricePaise: 18500, stockQuantity: 0 },
        ],
      },
      {
        slug: "dhara-sunflower-oil",
        name: "Dhara Sunflower Oil",
        brand: "Dhara",
        description:
          "Sunflower oil. Out of stock. A similar in-stock option is Fortune Sunflower Oil.",
        variants: [
          { label: "1 L", amount: 1000, unit: Unit.ML, pricePaise: 15500, stockQuantity: 0 },
        ],
      },
    ],
  },
  {
    slug: "shampoo",
    name: "Shampoo and personal care",
    products: [
      {
        slug: "clinic-plus-shampoo",
        name: "Clinic Plus Shampoo",
        brand: "Clinic Plus",
        description: "Family shampoo.",
        variants: [
          { label: "175 ml", amount: 175, unit: Unit.ML, pricePaise: 9900, stockQuantity: 26 },
          { label: "650 ml", amount: 650, unit: Unit.ML, pricePaise: 24900, stockQuantity: 14 },
        ],
      },
      {
        slug: "dove-daily-shine",
        name: "Dove Daily Shine",
        brand: "Dove",
        description: "Shampoo for daily hair wash.",
        variants: [
          { label: "340 ml", amount: 340, unit: Unit.ML, pricePaise: 28500, stockQuantity: 11 },
        ],
      },
      {
        slug: "head-shoulders-smooth",
        name: "Head & Shoulders Smooth",
        brand: "Head & Shoulders",
        description:
          "Anti-dandruff shampoo. Out of stock. Similar in-stock options are Clinic Plus and Dove.",
        variants: [
          { label: "180 ml", amount: 180, unit: Unit.ML, pricePaise: 19900, stockQuantity: 0 },
        ],
      },
    ],
  },
  {
    slug: "soap",
    name: "Soap",
    products: [
      {
        slug: "santoor-sandal",
        name: "Santoor Sandal",
        brand: "Santoor",
        description: "Sandal and turmeric bathing soap.",
        variants: [
          { label: "125 g", amount: 125, unit: Unit.G, pricePaise: 3500, stockQuantity: 80 },
        ],
      },
      {
        slug: "lifebuoy-total",
        name: "Lifebuoy Total",
        brand: "Lifebuoy",
        description: "Germ-protection bathing soap.",
        variants: [
          { label: "125 g", amount: 125, unit: Unit.G, pricePaise: 3000, stockQuantity: 70 },
        ],
      },
      {
        slug: "lux-soft-touch",
        name: "Lux Soft Touch",
        brand: "Lux",
        description:
          "Bathing soap. Out of stock. Similar in-stock options are Lifebuoy and Santoor.",
        variants: [
          { label: "125 g", amount: 125, unit: Unit.G, pricePaise: 4000, stockQuantity: 0 },
        ],
      },
    ],
  },
  {
    slug: "dishwashing",
    name: "Dishwashing products and sponges",
    products: [
      {
        slug: "vim-dishwash-liquid",
        name: "Vim Dishwash Liquid",
        brand: "Vim",
        description: "Lemon dishwash liquid.",
        variants: [
          { label: "500 ml", amount: 500, unit: Unit.ML, pricePaise: 9900, stockQuantity: 20 },
          { label: "750 ml", amount: 750, unit: Unit.ML, pricePaise: 14500, stockQuantity: 15 },
        ],
      },
      {
        slug: "scotch-brite-sponge",
        name: "Scotch-Brite Scrub Sponge",
        brand: "Scotch-Brite",
        description: "Sold as a single sponge or a pack of three.",
        variants: [
          { label: "1 piece", amount: 1, unit: Unit.PIECE, pricePaise: 2500, stockQuantity: 40 },
          { label: "3 pieces", amount: 3, unit: Unit.PIECE, pricePaise: 6900, stockQuantity: 25 },
        ],
      },
    ],
  },
  {
    slug: "groceries",
    name: "Rice, flour, and other basic groceries",
    products: [
      {
        slug: "india-gate-basmati",
        name: "India Gate Basmati Rice",
        brand: "India Gate",
        description: "Aged basmati rice.",
        variants: [
          { label: "1 kg", amount: 1000, unit: Unit.G, pricePaise: 18500, stockQuantity: 18 },
          { label: "5 kg", amount: 5000, unit: Unit.G, pricePaise: 89000, stockQuantity: 8 },
        ],
      },
      {
        slug: "daawat-basmati",
        name: "Daawat Basmati Rice",
        brand: "Daawat",
        description:
          "Basmati rice. Out of stock. A similar in-stock option is India Gate Basmati Rice.",
        variants: [
          { label: "1 kg", amount: 1000, unit: Unit.G, pricePaise: 17500, stockQuantity: 0 },
        ],
      },
      {
        slug: "aashirvaad-atta",
        name: "Aashirvaad Atta",
        brand: "Aashirvaad",
        description: "Whole-wheat flour.",
        variants: [
          { label: "1 kg", amount: 1000, unit: Unit.G, pricePaise: 6200, stockQuantity: 22 },
          { label: "5 kg", amount: 5000, unit: Unit.G, pricePaise: 29500, stockQuantity: 10 },
        ],
      },
    ],
  },
  {
    slug: "cleaning-liquids",
    name: "Cleaning liquids",
    products: [
      {
        slug: "lizol-disinfectant",
        name: "Lizol Disinfectant Surface Cleaner",
        brand: "Lizol",
        description: "Floor and surface cleaner.",
        variants: [
          { label: "500 ml", amount: 500, unit: Unit.ML, pricePaise: 11500, stockQuantity: 19 },
          { label: "975 ml", amount: 975, unit: Unit.ML, pricePaise: 19900, stockQuantity: 9 },
        ],
      },
      {
        slug: "dettol-antiseptic",
        name: "Dettol Antiseptic Liquid",
        brand: "Dettol",
        description:
          "Antiseptic liquid. Out of stock. A similar in-stock cleaner is Lizol.",
        variants: [
          { label: "250 ml", amount: 250, unit: Unit.ML, pricePaise: 14900, stockQuantity: 0 },
        ],
      },
    ],
  },
  {
    slug: "tissues",
    name: "Tissues and household supplies",
    products: [
      {
        slug: "origami-face-tissues",
        name: "Origami Face Tissues",
        brand: "Origami",
        description: "Two-ply facial tissue box.",
        variants: [
          { label: "100 pulls", amount: 100, unit: Unit.PIECE, pricePaise: 7500, stockQuantity: 33 },
        ],
      },
    ],
  },
];

export async function seedCatalogue(client: PrismaClient) {
  for (const categorySeed of catalogue) {
    const category = await client.category.upsert({
      where: { slug: categorySeed.slug },
      update: { name: categorySeed.name },
      create: { slug: categorySeed.slug, name: categorySeed.name },
    });

    for (const productSeed of categorySeed.products) {
      const product = await client.product.upsert({
        where: { slug: productSeed.slug },
        update: {
          name: productSeed.name,
          brand: productSeed.brand,
          description: productSeed.description,
          isActive: productSeed.isActive ?? true,
          categoryId: category.id,
        },
        create: {
          slug: productSeed.slug,
          name: productSeed.name,
          brand: productSeed.brand,
          description: productSeed.description,
          isActive: productSeed.isActive ?? true,
          categoryId: category.id,
        },
      });

      for (const variantSeed of productSeed.variants) {
        await client.productVariant.upsert({
          where: {
            productId_label: {
              productId: product.id,
              label: variantSeed.label,
            },
          },
          update: {
            amount: variantSeed.amount,
            unit: variantSeed.unit,
            pricePaise: variantSeed.pricePaise,
            stockQuantity: variantSeed.stockQuantity,
            isActive: variantSeed.isActive ?? true,
          },
          create: {
            productId: product.id,
            label: variantSeed.label,
            amount: variantSeed.amount,
            unit: variantSeed.unit,
            pricePaise: variantSeed.pricePaise,
            stockQuantity: variantSeed.stockQuantity,
            isActive: variantSeed.isActive ?? true,
          },
        });
      }
    }
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the catalogue.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    await seedCatalogue(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
