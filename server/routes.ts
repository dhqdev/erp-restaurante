import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { loginSchema, insertUserSchema, insertFoodSchema, insertTableSchema, insertOrderSchema } from "@shared/schema";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Check trial status
      const trial = await storage.getTrialStatus(user.id);
      if (trial && trial.startDate) {
        const trialStart = new Date(trial.startDate);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 7 && trial.active) {
          await storage.updateTrialStatus(user.id, false);
          return res.status(402).json({ 
            message: "Período de teste expirado",
            paymentUrl: "https://pay.cakto.com.br/fna8efe_427848"
          });
        }
      }

      // Store user in session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      // Save session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Erro interno do servidor" });
        }
        
          res.json({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            trialDaysLeft: trial && trial.startDate ? Math.max(0, 7 - Math.floor((new Date().getTime() - new Date(trial.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 0
          });
        });
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const trial = await storage.getTrialStatus(user.id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      trialDaysLeft: trial && trial.startDate ? Math.max(0, 7 - Math.floor((new Date().getTime() - new Date(trial.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 0
    });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    next();
  };

  // Middleware to check admin role
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }
    next();
  };

  // Users routes (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Create trial status for new user
      await storage.createTrialStatus({
        userId: user.id,
        active: true
      });

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteUser(id);
    
    if (!success) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ success: true });
  });

  // Foods routes
  app.get("/api/foods", requireAuth, async (req, res) => {
    const foods = await storage.getAllFoods();
    res.json(foods);
  });

  app.post("/api/foods", requireAdmin, async (req, res) => {
    try {
      const foodData = insertFoodSchema.parse(req.body);
      const food = await storage.createFood(foodData);
      res.json(food);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.put("/api/foods/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const foodData = insertFoodSchema.partial().parse(req.body);
      
      const food = await storage.updateFood(id, foodData);
      if (!food) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      res.json(food);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.delete("/api/foods/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteFood(id);
    
    if (!success) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    res.json({ success: true });
  });

  // Tables routes
  app.get("/api/tables", requireAuth, async (req, res) => {
    const tables = await storage.getAllTables();
    res.json(tables);
  });

  app.post("/api/tables", requireAdmin, async (req, res) => {
    try {
      const tableData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(tableData);
      res.json(table);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.put("/api/tables/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tableData = insertTableSchema.partial().parse(req.body);
      
      const table = await storage.updateTable(id, tableData);
      if (!table) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }

      res.json(table);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.delete("/api/tables/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTable(id);
    
    if (!success) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    res.json({ success: true });
  });

  // Orders routes
  app.get("/api/orders", requireAuth, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    let orders;
    if (user.role === "admin") {
      orders = await storage.getAllOrders();
    } else {
      orders = await storage.getOrdersByWaiter(user.id);
    }

    res.json(orders);
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const waiterId = req.session.userId;
      if (!waiterId) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const order = await storage.createOrder({
        ...orderData,
        waiterId
      });

      // Update table status to occupied
      if (orderData.tableId) {
        await storage.updateTable(orderData.tableId, { status: "occupied" });
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.put("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = insertOrderSchema.partial().parse(req.body);
      
      const order = await storage.updateOrder(id, orderData);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      // If order is completed, free up the table
      if (orderData.status === "delivered") {
        await storage.updateTable(order.tableId, { status: "available" });
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.delete("/api/orders/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    const success = await storage.deleteOrder(id);
    if (success) {
      // Free up the table
      await storage.updateTable(order.tableId, { status: "available" });
    }

    res.json({ success });
  });

  // Analytics routes (admin only)
  app.get("/api/analytics/stats", requireAdmin, async (req, res) => {
    const stats = await storage.getTodayStats();
    res.json(stats);
  });

  app.get("/api/analytics/financial", requireAdmin, async (req, res) => {
    const financial = await storage.getFinancialData();
    res.json(financial);
  });

  // Payments routes (admin only)
  app.get("/api/payments", requireAdmin, async (req, res) => {
    const payments = await storage.getAllPayments();
    res.json(payments);
  });

  const httpServer = createServer(app);
  return httpServer;
}
