import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";

const mockLogin = jest.fn();

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// ログインコンポーネントのテストスイート - ログインフォームの機能をテスト
describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // NOTE:
  // Id: 18
  // ログインフォーム表示テスト - フォーム要素が正しく表示されることを確認
  it("renders login form", () => {
    render(<Login />);

    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログイン" }),
    ).toBeInTheDocument();
  });

  // NOTE:
  // ID: 19
  // ログイン機能テスト - フォーム送信時にログイン関数が呼び出されることを確認
  it("calls login function on form submission", async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  // NOTE:
  // ID: 20
  // ログイン失敗時のエラー表示テスト - ログイン失敗時にエラーメッセージが表示されることを確認
  it("shows error message on login failure", async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: "ログインに失敗しました",
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(screen.getByText("ログインに失敗しました")).toBeInTheDocument();
    });
  });
});

