import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

jest.mock("./context/AuthContext", () => ({
  AuthProvider: ({ children }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: jest.fn(),
}));

jest.mock("./components/AuthWrapper", () => {
  return function AuthWrapper() {
    return <div data-testid="auth-wrapper">Please log in</div>;
  };
});

jest.mock("./components/TodoList", () => {
  return function TodoList() {
    return <div data-testid="todo-list">Todo List</div>;
  };
});

// メインアプリケーションコンポーネントのテストスイート - 認証状態に応じた表示制御をテスト
describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // NOTE:
  // ID: 15
  // 読み込み状態の表示テスト - 認証状態の読み込み中にローディング表示されることを確認
  it("renders loading state", async () => {
    const { useAuth } = require("./context/AuthContext");
    useAuth.mockReturnValue({
      token: null,
      loading: true,
    });

    render(<App />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  // NOTE:
  // ID: 16
  // 未認証状態の表示テスト - ログインしていない場合にAuthWrapperが表示されることを確認
  it("renders AuthWrapper when not authenticated", async () => {
    const { useAuth } = require("./context/AuthContext");
    useAuth.mockReturnValue({
      token: null,
      loading: false,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("auth-wrapper")).toBeInTheDocument();
    });
  });

  // NOTE:
  // ID: 17
  // 認証済み状態の表示テスト - ログイン済みの場合にTodoListが表示されることを確認
  it("renders TodoList when authenticated", async () => {
    const { useAuth } = require("./context/AuthContext");
    useAuth.mockReturnValue({
      token: "mock-token",
      loading: false,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("todo-list")).toBeInTheDocument();
    });
  });
});
