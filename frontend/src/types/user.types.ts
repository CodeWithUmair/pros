// --- Types ---

export type AppViewType = "LOADING" | "VALIDATE" | "AUTH_VIEW";

export type UserRole = "User" | "Admin";

export type User = {
  name: string;
  email: string;
  walletAddress: string;
  role: UserRole;
};

export type Asset = {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  balance: number;
};
export type Transaction = {
  signature: string;
  block: number;
  time: string;
  instructions: string[];
  signer: string;
  value: string;
  fee: string;
  programs: string[];
};

export type LineItem = {
  amount: number;
  currency: string;
  symbol: string;
};

export type InvoiceData = {
  _id: string;
  creatorId: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
  };
  invoiceName: string;
  payeeEmail: string;
  lineItem: LineItem;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

// '@/types/user.types'
export type LineItem2 = {
  label: string; // human-readable (e.g., "25th January 2025")
  value: string; // ISO string (e.g., "2025-01-25T12:00:00.000Z")
};

export type UsersTableType = {
  name: string;
  email: string;
  status: "Active" | "Inactive" | "Pending";
  signup_date: LineItem2;
  total_balance: string;
  total_transaction: string;
};

export type SupportTableType = {
  username: string;
  email: string;
  status: "Pending" | "Solved" | "In Progress";
  priority: "High" | "Medium" | "Low";
  last_activity: LineItem2;
  description: string;
  Assignee: string;
};
