import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import TodoList from "./TodoList";

const mockTodos = [
  {
    id: 1,
    title: "Test Todo 1",
    description: "Description 1",
    completed: false,
  },
  {
    id: 2,
    title: "Test Todo 2",
    description: "Description 2",
    completed: true,
  },
];

jest.mock("../services/todoService", () => ({
  todoService: {
    getTodos: jest.fn(),
    createTodo: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  },
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    logout: jest.fn(),
    user: { username: "テストユーザー" },
  }),
}));

// TodoListコンポーネントのテストスイート
// Todo一覧表示機能をテスト
describe("TodoList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { todoService } = require("../services/todoService");
    todoService.getTodos.mockResolvedValue({ success: true, data: mockTodos });
  });

  // NOTE:
  // ID: 21
  // Todo一覧表示テスト - 取得したTodoが正しく画面に表示されることを確認
  it("renders todo list with todos", async () => {
    await act(async () => {
      render(<TodoList />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Todo 1")).toBeInTheDocument();
      expect(screen.getByText("Test Todo 2")).toBeInTheDocument();
    });
  });

  // NOTE:
  // ID: 22
  // Todo追加ボタン表示テスト - 新しいTodo追加ボタンが表示されることを確認
  it("renders add todo button", async () => {
    await act(async () => {
      render(<TodoList />);
    });

    await waitFor(() => {
      expect(screen.getByText("+ 新しいTodoを追加")).toBeInTheDocument();
    });
  });

  // NOTE:
  // ID: 23
  // 読み込み状態テスト - データ読み込み中にローディング表示がされることを確認
  it("shows loading state initially", () => {
    const { todoService } = require("../services/todoService");
    todoService.getTodos.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<TodoList />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});

