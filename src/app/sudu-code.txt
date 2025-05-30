// User Login
app.post(
  "/api/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );
      res.json({
        token,
        user: { id: user._id, name: user.name, email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Meal Entry
app.post(
  "/api/meals",
  authMiddleware,
  roleMiddleware(["Admin", "MealManager"]),
  [
    body("userId").notEmpty(),
    body("date").isISO8601(),
    body("type").isIn(["Breakfast", "Lunch", "Dinner"]),
    body("mealType").isIn(["Veg", "NonVeg"]),
    body("cost").isNumeric(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { userId, date, type, mealType, cost } = req.body;

    try {
      const meal = new Meal({ userId, date, type, mealType, cost });
      await meal.save();
      res.status(201).json(meal);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Expense Tracking
app.post(
  "/api/expenses",
  authMiddleware,
  roleMiddleware(["Admin", "Buyer", "UtilityManager"]),
  [
    body("messId").notEmpty(),
    body("category").isIn(["Grocery", "Utility", "Maintenance"]),
    body("amount").isNumeric(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { messId, category, amount, description } = req.body;
    const submittedBy = (req as any).user._id;

    try {
      const expense = new Expense({
        messId,
        category,
        amount,
        description,
        submittedBy,
      });
      await expense.save();
      res.status(201).json(expense);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Task Assignment
app.post(
  "/api/tasks",
  authMiddleware,
  roleMiddleware(["Admin"]),
  [
    body("messId").notEmpty(),
    body("assignedTo").notEmpty(),
    body("type").isIn(["GroceryBuyer", "UtilityManager", "MealManager"]),
    body("dueDate").isISO8601(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { messId, assignedTo, type, dueDate } = req.body;

    try {
      const task = new Task({ messId, assignedTo, type, dueDate });
      await task.save();
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Balance Calculation
app.get(
  "/api/balance/:userId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const meals = await Meal.find({ userId, isActive: true });
      const totalMealCost = meals.reduce((sum, meal) => sum + meal.cost, 0);

      const expenses = await Expense.find({ submittedBy: userId });
      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      res.json({ balance: user.balance - totalMealCost + totalExpenses });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);
