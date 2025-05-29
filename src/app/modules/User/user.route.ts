import { body, validationResult } from "express-validator";

app.post(
  "/api/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("phone").notEmpty(),
    body("messId").notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone, address, nid, role, messId } =
      req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        nid,
        role,
        messId,
      });

      await user.save();
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );
      res
        .status(201)
        .json({ token, user: { id: user._id, name, email, role } });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);
