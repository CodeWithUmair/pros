export interface UserDetailsResponse {
  message: string;
  user: {
    name: string;
    email: string;
    walletAddress: string | null;
    role: "User" | "Admin";
  };
}

export interface SendFundsResponse {
  message: string;
  txHash: string;
}

export interface TokenAsset {
  symbol: string;
  name: string;
  mint: string;
  image: string;
  balance: number;
  decimals: number;
}

export interface UserPortfolioResponse {
  message: string;
  assets: TokenAsset[];
}

export interface AllUsersEmailsResponse {
  message: string;
  emails: string[];
}
