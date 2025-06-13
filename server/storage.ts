import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  users, trialStatus, foods, tables, orders, payments,
  type User, type InsertUser,
  type TrialStatus, type InsertTrialStatus,
  type Food, type InsertFood,
  type Table, type InsertTable,
  type Order, type InsertOrder,
  type Payment, type InsertPayment
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql_client = postgres(process.env.DATABASE_URL);
const db = drizzle(sql_client);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Trial Status
  getTrialStatus(userId: number): Promise<TrialStatus | undefined>;
  createTrialStatus(trial: InsertTrialStatus): Promise<TrialStatus>;
  updateTrialStatus(userId: number, active: boolean): Promise<TrialStatus | undefined>;

  // Foods
  getFood(id: number): Promise<Food | undefined>;
  getAllFoods(): Promise<Food[]>;
  createFood(food: InsertFood): Promise<Food>;
  updateFood(id: number, food: Partial<InsertFood>): Promise<Food | undefined>;
  deleteFood(id: number): Promise<boolean>;

  // Tables
  getTable(id: number): Promise<Table | undefined>;
  getAllTables(): Promise<Table[]>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined>;
  deleteTable(id: number): Promise<boolean>;

  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByWaiter(waiterId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Analytics
  getTodayStats(): Promise<{
    todayOrders: number;
    todayRevenue: string;
    occupiedTables: string;
    avgOrderTime: string;
  }>;
  getFinancialData(): Promise<{
    today: string;
    month: string;
    avgTicket: string;
  }>;
}

export class DrizzleStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getTrialStatus(userId: number): Promise<TrialStatus | undefined> {
    const result = await db.select().from(trialStatus).where(eq(trialStatus.userId, userId)).limit(1);
    return result[0];
  }

  async createTrialStatus(trial: InsertTrialStatus): Promise<TrialStatus> {
    const result = await db.insert(trialStatus).values(trial).returning();
    return result[0];
  }

  async updateTrialStatus(userId: number, active: boolean): Promise<TrialStatus | undefined> {
    const result = await db.update(trialStatus)
      .set({ active })
      .where(eq(trialStatus.userId, userId))
      .returning();
    return result[0];
  }

  async getFood(id: number): Promise<Food | undefined> {
    const result = await db.select().from(foods).where(eq(foods.id, id)).limit(1);
    return result[0];
  }

  async getAllFoods(): Promise<Food[]> {
    return await db.select().from(foods).where(eq(foods.active, true)).orderBy(foods.category, foods.name);
  }

  async createFood(food: InsertFood): Promise<Food> {
    const result = await db.insert(foods).values(food).returning();
    return result[0];
  }

  async updateFood(id: number, food: Partial<InsertFood>): Promise<Food | undefined> {
    const result = await db.update(foods).set(food).where(eq(foods.id, id)).returning();
    return result[0];
  }

  async deleteFood(id: number): Promise<boolean> {
    const result = await db.update(foods).set({ active: false }).where(eq(foods.id, id));
    return result.length > 0;
  }

  async getTable(id: number): Promise<Table | undefined> {
    const result = await db.select().from(tables).where(eq(tables.id, id)).limit(1);
    return result[0];
  }

  async getAllTables(): Promise<Table[]> {
    return await db.select().from(tables).orderBy(tables.name);
  }

  async createTable(table: InsertTable): Promise<Table> {
    const result = await db.insert(tables).values(table).returning();
    return result[0];
  }

  async updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined> {
    const result = await db.update(tables).set(table).where(eq(tables.id, id)).returning();
    return result[0];
  }

  async deleteTable(id: number): Promise<boolean> {
    const result = await db.delete(tables).where(eq(tables.id, id));
    return result.length > 0;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByWaiter(waiterId: number): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.waiterId, waiterId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return result.length > 0;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.paymentDate));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async getTodayStats(): Promise<{
    todayOrders: number;
    todayRevenue: string;
    occupiedTables: string;
    avgOrderTime: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrdersResult = await db.select({
      count: sql<number>`count(*)`
    }).from(orders).where(sql`DATE(${orders.createdAt}) = CURRENT_DATE`);

    const todayRevenueResult = await db.select({
      sum: sql<string>`COALESCE(SUM(${orders.total}), 0)`
    }).from(orders).where(sql`DATE(${orders.createdAt}) = CURRENT_DATE`);

    const occupiedTablesResult = await db.select({
      occupied: sql<number>`count(*) filter (where ${tables.status} = 'occupied')`,
      total: sql<number>`count(*)`
    }).from(tables);

    return {
      todayOrders: todayOrdersResult[0]?.count || 0,
      todayRevenue: `R$ ${todayRevenueResult[0]?.sum || '0,00'}`,
      occupiedTables: `${occupiedTablesResult[0]?.occupied || 0}/${occupiedTablesResult[0]?.total || 0}`,
      avgOrderTime: "18 min" // Mock for now - would need order timing tracking
    };
  }

  async getFinancialData(): Promise<{
    today: string;
    month: string;
    avgTicket: string;
  }> {
    const todayRevenueResult = await db.select({
      sum: sql<string>`COALESCE(SUM(${orders.total}), 0)`
    }).from(orders).where(sql`DATE(${orders.createdAt}) = CURRENT_DATE`);

    const monthRevenueResult = await db.select({
      sum: sql<string>`COALESCE(SUM(${orders.total}), 0)`
    }).from(orders).where(sql`EXTRACT(MONTH FROM ${orders.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`);

    const avgTicketResult = await db.select({
      avg: sql<string>`COALESCE(AVG(${orders.total}), 0)`
    }).from(orders);

    return {
      today: `R$ ${todayRevenueResult[0]?.sum || '0,00'}`,
      month: `R$ ${monthRevenueResult[0]?.sum || '0,00'}`,
      avgTicket: `R$ ${avgTicketResult[0]?.avg || '0,00'}`
    };
  }
}

export const storage = new DrizzleStorage();
