import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  FARM_PROGRAM_ID_V3,
  FARM_PROGRAM_ID_V5,
  FARM_PROGRAM_ID_V6,
  Structure,
  farmLedgerLayoutV3_2,
  farmLedgerLayoutV5_2,
  farmLedgerLayoutV6_1,
  farmStateV3Layout,
  farmStateV5Layout,
  farmStateV6Layout,
} from "@raydium-io/raydium-sdk-v2";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
require("dotenv").config();


export const GASLESS_RELAYER = Keypair.fromSecretKey(
  bs58.decode(process.env.GASLESS_RELAYER_SECRET!)
);

export const IS_TEST_MODE = false;

export const PORT = process.env.PORT as string;
export const FROM_EMIAL_ADDRESS = process.env.FROM_EMIAL_ADDRESS as string;
export const APP_PASSWORD = process.env.APP_PASSWORD as string;
export const EMAIL_HOST = process.env.EMAIL_HOST as string;
export const NODE_ENV = process.env.NODE_ENV as string;
export const MONGO_URI = process.env.MONGO_URI as string;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const RESET_PASSWORD_SECRET = process.env
  .RESET_PASSWORD_SECRET as string;
export const EMAIL_VERIFICATION_SECRET = process.env
  .EMAIL_VERIFICATION_SECRET as string;
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET as string;
// export const ACCESS_TOKEN_DURATION = 900; //15 minutes //TODO: to be opened after testing
export const ACCESS_TOKEN_DURATION = 259200; //3 days
export const REFRESH_TOKEN_DURATION = 604800; //7 days
export const ONE_WEEK_DURATION = 604800; //7 days
export const PROTOCOL_FEES = 0.0002; //0.2%
export const validExchanges = ["raydium", "jupiter"];
export const ADMIN_EMAIL = "umairamir@decryptedlabs.io"; // admin email
// export const ADMIN_EMAIL = "sharozx16@gmail.com"; // admin email

const endpoint =
  "https://falling-maximum-star.solana-mainnet.quiknode.pro/1cd1bbeb37e123d8aad7d47d4715772e4a66c03f";

export const APP_CONNECTION = new Connection(endpoint, "confirmed");
export const RAYDIUM_ADDRESS = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R";
export const RAY_SOL_FARM_ADDRESS =
  "4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW";
export const RAYDIUM_STAKE_ADDRESS =
  "BZ2tS9ZUJBB9z4yKk1jhaEp1AT39F5zR8Vrgzmz5Buwo";
export const NATIVE_MINT = "11111111111111111111111111111111";

export enum FarmType {
  Raydium = "Raydium",
  Fusion = "Fusion",
  Ecosystem = "Ecosystem",
}
export type FarmLedgerData = Structure<
  PublicKey | BN | BN[],
  "",
  {
    id: PublicKey;
    state: BN;
    owner: PublicKey;
    deposited: BN;
    rewardDebts: BN[];
    voteLockedBalance?: BN;
  }
>;
export const FARM_TYPE: Record<
  string,
  {
    name: FarmType;
    version: 3 | 5 | 6;
    ledgerLayout: FarmLedgerData;
    stateLayout:
    | typeof farmStateV3Layout
    | typeof farmStateV5Layout
    | typeof farmStateV6Layout;
  }
> = {
  [FARM_PROGRAM_ID_V3.toString()]: {
    name: FarmType.Raydium,
    version: 3,
    ledgerLayout: farmLedgerLayoutV3_2,
    stateLayout: farmStateV3Layout,
  },
  [FARM_PROGRAM_ID_V5.toString()]: {
    name: FarmType.Fusion,
    version: 5,
    ledgerLayout: farmLedgerLayoutV5_2,
    stateLayout: farmStateV5Layout,
  },
  [FARM_PROGRAM_ID_V6.toString()]: {
    name: FarmType.Ecosystem,
    version: 6,
    ledgerLayout: farmLedgerLayoutV6_1,
    stateLayout: farmStateV6Layout,
  },
};

export const SPL_TOKEN_PROGRAM_ID =
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export const STABLE_COINS = [
  {
    tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "USDC (USDC)",
    symbol: "USDC",
    image: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
    decimals: 6,
  },
  {
    tokenAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    name: "USDT (USDT)",
    symbol: "USDT",
    image: "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
    decimals: 6,
  },
  {
    tokenAddress: "4Fo67MYQpVhZj9R7jQTd63FPAnWbPpaafAUxsMGX2geP",
    name: "Dai Stablecoin (Wormhole) (DAI)",
    symbol: "DAI",
    image: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png",
    decimals: 8,
  },
  {
    tokenAddress: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    name: "EURC (EURC)",
    symbol: "EURC",
    image: "https://assets.coingecko.com/coins/images/26045/standard/euro.png",
    decimals: 6,
  },
  {
    tokenAddress: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    name: "PayPal USD (PYUSD)",
    symbol: "PYUSD",
    image: "https://assets.coingecko.com/coins/images/31212/standard/PYUSD_Logo_%282%29.png",
    decimals: 6,
  },
];

export const ALCHEMYPAY_CONFIG = {
  // For Production
  appId: "4x8Aw1j3hUEb0GJ5",
  appSecret: "znuZXQAxnkM74EY8",
  // For Test
  // appId: "f83Is2y7L425rxl8",
  // appSecret: "5Zp9SmtLWQ4Fh2a1",
  onRampHttpMethod: "GET",
  onRampRequestPath: "/index/rampPageBuy",
  fiat: "USD",
  network: "SOL",
};
