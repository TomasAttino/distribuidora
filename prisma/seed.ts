import "dotenv/config";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding products...')

  const products = [
    {
      code: 'ALF-GUAY-CHO',
      name: 'Alfajor Guaymallén Chocolate',
      description: 'Alfajor simple bañado en repostería sabor chocolate',
      price: 350.0,
      category: 'Alfajores',
      brand: 'Guaymallén',
      isActive: true,
      isCigarette: false,
    },
    {
      code: 'ALF-JOR-CHO',
      name: 'Alfajor Jorgito Chocolate',
      description: 'Alfajor relleno con dulce de leche bañado en chocolate',
      price: 600.0,
      category: 'Alfajores',
      brand: 'Jorgito',
      isActive: true,
      isCigarette: false,
    },
    {
      code: 'CAR-PAL-SEL',
      name: 'Caramelos Palitos de la Selva Bolsa x 1kg',
      description: 'Caramelos masticables frutilla y vainilla',
      price: 6500.0,
      category: 'Caramelos',
      brand: 'Arcor',
      isActive: true,
      isCigarette: false,
    },
    {
      code: 'CHI-BEL-MEN',
      name: 'Chicles Beldent Menta Caja x 20',
      description: 'Chicles sin azúcar sabor menta',
      price: 8500.0,
      category: 'Chicles',
      brand: 'Beldent',
      isActive: true,
      isCigarette: false,
    },
    {
      code: 'CHO-MIL-LEG',
      name: 'Chocolate Milka Legítimo 150g',
      description: 'Chocolate con leche',
      price: 2300.0,
      category: 'Chocolates',
      brand: 'Milka',
      isActive: true,
      isCigarette: false,
    },
    {
      code: 'CHU-PIC-DUL',
      name: 'Chupetín Pico Dulce Display x 48',
      description: 'Chupetín de caramelo duro sabor tutti frutti',
      price: 7200.0,
      category: 'Chupetines',
      brand: 'Lheritier',
      isActive: true,
      isCigarette: false,
    },
    {
      code: 'TUR-MIS-100',
      name: 'Turrón Misky 100g',
      description: 'Turrón de maní con miel',
      price: 250.0,
      category: 'Turrones',
      brand: 'Misky',
      isActive: true,
      isCigarette: false,
    },
    {
      code: 'BOM-BON-LEC',
      name: 'Bon o Bon Leche Caja x 18',
      description: 'Bombón relleno con pasta de maní',
      price: 5400.0,
      category: 'Bombones',
      brand: 'Arcor',
      isActive: true,
      isCigarette: false,
    }
  ]

  for (const product of products) {
    const existingProduct = await prisma.product.findUnique({
      where: { code: product.code }
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: product
      });
      console.log(`Created product: ${product.name}`);
    } else {
      await prisma.product.update({
        where: { code: product.code },
        data: product
      });
      console.log(`Updated product: ${product.name}`);
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
