"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// User Login
app.post("/api/login", [body("email").isEmail(), body("password").notEmpty()], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
        const user = yield User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });
        const isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
        res.json({
            token,
            user: { id: user._id, name: user.name, email, role: user.role },
        });
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}));
// Meal Entry
app.post("/api/meals", authMiddleware, roleMiddleware(["Admin", "MealManager"]), [
    body("userId").notEmpty(),
    body("date").isISO8601(),
    body("type").isIn(["Breakfast", "Lunch", "Dinner"]),
    body("mealType").isIn(["Veg", "NonVeg"]),
    body("cost").isNumeric(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { userId, date, type, mealType, cost } = req.body;
    try {
        const meal = new Meal({ userId, date, type, mealType, cost });
        yield meal.save();
        res.status(201).json(meal);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}));
// Expense Tracking
app.post("/api/expenses", authMiddleware, roleMiddleware(["Admin", "Buyer", "UtilityManager"]), [
    body("messId").notEmpty(),
    body("category").isIn(["Grocery", "Utility", "Maintenance"]),
    body("amount").isNumeric(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { messId, category, amount, description } = req.body;
    const submittedBy = req.user._id;
    try {
        const expense = new Expense({
            messId,
            category,
            amount,
            description,
            submittedBy,
        });
        yield expense.save();
        res.status(201).json(expense);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}));
// Task Assignment
app.post("/api/tasks", authMiddleware, roleMiddleware(["Admin"]), [
    body("messId").notEmpty(),
    body("assignedTo").notEmpty(),
    body("type").isIn(["GroceryBuyer", "UtilityManager", "MealManager"]),
    body("dueDate").isISO8601(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { messId, assignedTo, type, dueDate } = req.body;
    try {
        const task = new Task({ messId, assignedTo, type, dueDate });
        yield task.save();
        res.status(201).json(task);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}));
// Balance Calculation
app.get("/api/balance/:userId", authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const meals = yield Meal.find({ userId, isActive: true });
        const totalMealCost = meals.reduce((sum, meal) => sum + meal.cost, 0);
        const expenses = yield Expense.find({ submittedBy: userId });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.json({ balance: user.balance - totalMealCost + totalExpenses });
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}));
