import { pgTable, serial, text, timestamp, boolean, integer, numeric, jsonb, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Matches auth.users.id
  email: text('email').notNull(),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  original_price: numeric('original_price', { precision: 10, scale: 2 }),
  discount_percentage: integer('discount_percentage'),
  image: text('image'),
  images: jsonb('images').$type<string[]>(),
  category: text('category').notNull(),
  purchase_link: text('purchase_link'),
  stock: integer('stock').default(10).notNull(), // Inventory control
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  user_id: uuid('user_id').references(() => profiles.id).notNull(),
  product_id: integer('product_id').references(() => products.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: uuid('user_id').references(() => profiles.id).notNull(),
  status: text('status').notNull().default('pending'), // pending, paid, shipped, delivered, cancelled
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  stripe_session_id: text('stripe_session_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').references(() => orders.id).notNull(),
  product_id: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').references(() => products.id).notNull(),
  user_id: uuid('user_id').references(() => profiles.id).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const storeSettings = pgTable('store_settings', {
  id: serial('id').primaryKey(),
  name: text('name').default('Minha Lojinha'),
  logo: text('logo'),
  banner: text('banner'),
  about_text: text('about_text'),
  whatsapp_number: text('whatsapp_number'),
  instagram_link: text('instagram_link'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
