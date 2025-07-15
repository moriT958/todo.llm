const request = require("supertest");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { body } = require("express-validator");

const { createUser, getUserByEmail } = require("../database");
const { generateToken, authMiddleware, comparePassword } = require("../auth");

jest.mock("../database");
jest.mock("../auth");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.post(
  "/api/auth/register",
  [
    body("username").isLength({ min: 3 }).trim(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = require("express-validator").validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const userId = await createUser(username, email, password);
      const token = generateToken(userId);

      res.status(201).json({
        message: "User created successfully",
        token,
        user: { id: userId, username, email },
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.post(
  "/api/auth/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = require("express-validator").validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const isValidPassword = comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user.id);

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/* 認証エンドポイントのテストスイート */

// ユーザー登録とログイン機能をテスト
describe("Auth Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ユーザー登録エンドポイントのテスト
  describe("POST /api/auth/register", () => {
    // NOTE:
    // ID: 1
    // ユーザー登録(正常系) - 新規ユーザ登録成功
    it("should register a new user successfully", async () => {
      getUserByEmail.mockResolvedValue(null);
      createUser.mockResolvedValue(1);
      generateToken.mockReturnValue("mock-token");

      const response = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      // assertions
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created successfully");
      expect(response.body.token).toBe("mock-token");
      expect(response.body.user.username).toBe("testuser");
    });

    // NOTE:
    // ID: 2
    // 既存ユーザー登録 - 重複するメールアドレスでエラーが返されることを確認
    it("should return error if user already exists", async () => {
      getUserByEmail.mockResolvedValue({ id: 1 });

      const response = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("User already exists");
    });

    // NOTE:
    // ID: 3
    // バリデーションエラーテスト - 不正な入力データでバリデーションエラーが返されることを確認
    it("should return validation errors for invalid input", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "ab",
        email: "invalid-email",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  // ユーザーログインエンドポイントのテスト
  describe("POST /api/auth/login", () => {
    // NOTE:
    // ID: 4
    // 正常ログイン - 有効な認証情報でログインが成功することを確認
    it("should login user successfully", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password_hash: "hashed-password",
      };

      getUserByEmail.mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(true);
      generateToken.mockReturnValue("mock-token");

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBe("mock-token");
    });

    // NOTE:
    // ID: 5
    // 無効な認証情報でのエラーテスト - 存在しないユーザーでエラーが返されることを確認
    it("should return error for invalid credentials", async () => {
      getUserByEmail.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid credentials");
    });

    // NOTE:
    // ID: 6
    // パスワード間違いでのエラーテスト - 間違ったパスワードでエラーが返されることを確認
    it("should return error for wrong password", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password_hash: "hashed-password",
      };

      getUserByEmail.mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(false);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid credentials");
    });
  });
});

