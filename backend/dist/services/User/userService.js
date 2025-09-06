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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFundsService = exports._calculateTransactionCostInUsdc = exports.getAllUsersEmailsService = exports.getUserPortfolioService = exports.getUserDetailsService = void 0;
const AppError_1 = require("../../utils/AppError");
const userModel_1 = __importDefault(require("../../models/userModel"));
const constants_1 = require("../../constants");
const web3_js_1 = require("@solana/web3.js");
const encryption_1 = require("../../utils/encryption");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const spl_token_1 = require("@solana/spl-token");
const raydiumUtils_1 = require("../../utils/raydiumUtils");
const axios_1 = __importDefault(require("axios"));
const txHistoryService_1 = require("../TxHistory/txHistoryService");
const mongoose_1 = __importDefault(require("mongoose"));
// ✅ Get User Details Service
const getUserDetailsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    const role = user.email === constants_1.ADMIN_EMAIL ? "Admin" : (_a = user.role) !== null && _a !== void 0 ? _a : "User";
    return {
        message: "User details fetched successfully.",
        user: {
            name: user.name,
            email: user.email,
            walletAddress: user.solanaWallet ? user.solanaWallet.address : null,
            role,
        },
    };
});
exports.getUserDetailsService = getUserDetailsService;
const getUserPortfolioService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    // const walletAddress = "F8UrBLV3wgc2DSMqRPH88mQyqSnyAkt9uEwf1SNPzXTL";
    const walletAddress = (_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address;
    if (!walletAddress) {
        throw new AppError_1.NotFoundError("Wallet does not exist.");
    }
    const wallet = new web3_js_1.PublicKey(walletAddress);
    // const decryptedPrivateKey = decryptPrivateKey(
    //   user.solanaWallet.encryptedPrivateKey
    // );
    // console.log("🚀 ~ decryptedPrivateKey:", decryptedPrivateKey)
    // --- 1. Fetch stablecoin balances ---
    const stableAssets = constants_1.STABLE_COINS.map((meta) => ({
        mint: meta.tokenAddress, // Using tokenAddress from the array
        name: meta.name,
        decimals: meta.decimals,
        symbol: meta.symbol,
        image: meta.image,
        balance: 0,
    }));
    const tokenAccounts = yield constants_1.APP_CONNECTION.getTokenAccountsByOwner(wallet, {
        programId: new web3_js_1.PublicKey(constants_1.SPL_TOKEN_PROGRAM_ID),
    });
    // Update balances based on fetched token accounts
    tokenAccounts.value.forEach(({ account }) => {
        const { mint, amount } = _parseTokenAccountData(account.data);
        // Find the corresponding stable coin and update its balance
        const stableCoin = stableAssets.find((asset) => asset.mint.toLowerCase() === mint.toLowerCase());
        if (stableCoin) {
            stableCoin.balance = Number(amount) / Math.pow(10, stableCoin.decimals);
        }
    });
    return {
        message: "User portfolio and full transaction history fetched.",
        assets: stableAssets,
    };
});
exports.getUserPortfolioService = getUserPortfolioService;
const getAllUsersEmailsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.isValidObjectId(userId)) {
        throw new AppError_1.ValidationError("Invalid user ID.");
    }
    const users = yield userModel_1.default.find({
        _id: { $ne: userId },
        isVerified: true,
    }, "email").lean();
    const emails = users.map((user) => user.email);
    return {
        message: "All emails fetched successfully.",
        emails,
    };
});
exports.getAllUsersEmailsService = getAllUsersEmailsService;
function _parseTokenAccountData(data) {
    const parsed = spl_token_1.AccountLayout.decode(data);
    return {
        mint: new web3_js_1.PublicKey(parsed.mint).toBase58(),
        amount: BigInt(parsed.amount).toString(),
    };
}
const _fetchSolToUsdcRate = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(
    //TODO: jupiter api
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = response.data;
    if (!data.solana.usd)
        throw new AppError_1.NotFoundError("Could not fetch prices.");
    return Number(data.solana.usd); // This gets the SOL price in USD
});
const _calculateTransactionCostInUsdc = (transactionCostInSol) => __awaiter(void 0, void 0, void 0, function* () {
    const solToUsdcRate = yield _fetchSolToUsdcRate();
    console.log("🚀 ~ Sol to USDC rate:", solToUsdcRate); //TODO: assuming same rates for all stabele coins
    // Convert the cost from SOL to USDC
    const costInUsdc = transactionCostInSol * solToUsdcRate;
    console.log("🚀 ~ Transaction cost in USDC:", costInUsdc);
    return costInUsdc;
});
exports._calculateTransactionCostInUsdc = _calculateTransactionCostInUsdc;
const sendFundsService = (userId, tokenAddress, // Token address (if sending SPL token or SOL)
amount, // Amount to send
recipientEmail, // Recipient wallet address
description, // tx description
invoiceId // if paying an invoice // its validated in controller
) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Fetch senderWalletData and wallet details
    const senderWalletData = yield userModel_1.default.findById(userId);
    if (!senderWalletData || !((_a = senderWalletData.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Sender account does not exist.");
    }
    const stableCoin = constants_1.STABLE_COINS.find((coin) => coin.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
    if (!stableCoin) {
        throw new AppError_1.ConflictError("Invalid token address. Only supported stable coins are allowed.");
    }
    if (senderWalletData.email.toLowerCase() === recipientEmail.toLowerCase()) {
        throw new AppError_1.ConflictError("Cannot send to self.");
    }
    const recipientWalletData = yield userModel_1.default.findOne({ email: recipientEmail });
    if (!recipientWalletData || !((_b = recipientWalletData.solanaWallet) === null || _b === void 0 ? void 0 : _b.address)) {
        throw new AppError_1.NotFoundError("Recipient account does not exist.");
    }
    const decryptedPrivateKey = (0, encryption_1.decryptPrivateKey)(senderWalletData.solanaWallet.encryptedPrivateKey);
    console.log("🚀 ~ sendFundsService ~ senderWalletData.solanaWallet.address:", senderWalletData.solanaWallet.address);
    console.log("🚀 ~ sendFundsService ~ decryptedPrivateKey:", decryptedPrivateKey);
    // const decryptedPrivateKey = TEST_ACCOUNT_1.pvtKey;
    const senderWallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decryptedPrivateKey));
    const res = yield (0, raydiumUtils_1.fetchTokenAccountData)(senderWallet.publicKey);
    const balance = (_c = res.tokenAccounts.find((a) => a.mint.toBase58() === tokenAddress)) === null || _c === void 0 ? void 0 : _c.amount;
    console.log("🚀 ~ sendFundsService ~ balance:", balance);
    const mint = yield constants_1.APP_CONNECTION.getParsedAccountInfo(new web3_js_1.PublicKey(tokenAddress));
    const tokenDecimals = mint.value.data.parsed.info.decimals;
    console.log("🚀 ~ sendFundsService ~ tokenDecimals:", tokenDecimals);
    if (!balance || balance.isZero())
        throw new AppError_1.ValidationError("you do not have enough balance");
    const recipientPubkey = new web3_js_1.PublicKey(recipientWalletData.solanaWallet.address);
    const _mintAddress = new web3_js_1.PublicKey(tokenAddress);
    console.log("🚀 ~ sendFundsService ~ GASLESS_RELAYER:", constants_1.GASLESS_RELAYER.publicKey.toString());
    // Get the token account of the fromWallet Solana address, if it does not exist, create it
    const fromTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(constants_1.APP_CONNECTION, constants_1.GASLESS_RELAYER, //payer
    _mintAddress, senderWallet.publicKey);
    console.log("🚀 ~ sendFundsService ~ fromTokenAccount:", fromTokenAccount);
    //get the token account of the toWallet Solana address, if it does not exist, create it
    const toTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(constants_1.APP_CONNECTION, constants_1.GASLESS_RELAYER, //payer
    _mintAddress, recipientPubkey);
    console.log("🚀 ~ sendFundsService ~ toTokenAccount:", toTokenAccount);
    //get the token account of the relayer Solana address, if it does not exist, create it
    const relayerTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(constants_1.APP_CONNECTION, constants_1.GASLESS_RELAYER, //payer
    _mintAddress, constants_1.GASLESS_RELAYER.publicKey);
    console.log("🚀 ~ sendFundsService ~ relayerTokenAccount:", relayerTokenAccount);
    const amountToSend = Math.floor(amount * Math.pow(10, tokenDecimals));
    if (amount <= 0) {
        throw new AppError_1.ConflictError(`Invalid amount ${amount}`);
    }
    // const dummyUSDCAmount = Math.floor(0.00154 * 10 ** tokenDecimals);
    const protocolFees = amount * constants_1.PROTOCOL_FEES; //0.0002
    const protocolFeesInSmallerUnits = Math.floor(protocolFees * Math.pow(10, tokenDecimals));
    console.log("🚀 ~ sendFundsService ~ protocolFeesInSmallerUnits:", protocolFeesInSmallerUnits);
    const transactionSimulate = new web3_js_1.Transaction({
        feePayer: constants_1.GASLESS_RELAYER.publicKey,
    });
    console.log("🚀 ~ sendFundsService ~ transactionSimulate:", transactionSimulate);
    transactionSimulate.add((0, spl_token_1.createTransferInstruction)(fromTokenAccount.address, toTokenAccount.address, senderWallet.publicKey, amountToSend));
    transactionSimulate.add((0, spl_token_1.createTransferInstruction)(fromTokenAccount.address, relayerTokenAccount.address, senderWallet.publicKey, protocolFeesInSmallerUnits));
    console.log("🚀 ~ sendFundsService ~ transactionSimulate:", transactionSimulate);
    // Refresh the blockhash before sending
    const { blockhash, lastValidBlockHeight } = yield constants_1.APP_CONNECTION.getLatestBlockhash();
    console.log("🚀 ~ sendFundsService ~ blockhash:", blockhash);
    // Fetch the transaction fee for the message
    const messageV0 = new web3_js_1.TransactionMessage({
        payerKey: constants_1.GASLESS_RELAYER.publicKey,
        recentBlockhash: blockhash,
        instructions: transactionSimulate.instructions,
    }).compileToV0Message();
    const fees = yield constants_1.APP_CONNECTION.getFeeForMessage(messageV0);
    const txFeeInSol = fees.value / web3_js_1.LAMPORTS_PER_SOL;
    const feeInUsdc = yield (0, exports._calculateTransactionCostInUsdc)(txFeeInSol);
    console.log("🚀 ~ sendFundsService ~ feeInUsdc:", feeInUsdc);
    console.log("🚀 ~ sendFundsService ~ protocolFees:", protocolFees);
    const total_fee = feeInUsdc + protocolFees;
    console.log("🚀 ~ sendFundsService ~ total_fee:", total_fee);
    const feeInUsdcFinal = Math.ceil(total_fee * Math.pow(10, tokenDecimals));
    const totalAmount = amountToSend + feeInUsdcFinal;
    const senderBalance = Number(balance);
    console.log("🚀 ~ sendFundsService ~ senderBalance:", {
        senderBalance,
        totalAmount,
        amountToSend,
        feeInUsdcFinal
    });
    if (totalAmount > senderBalance)
        throw new AppError_1.ValidationError(`Amount to be sent (${amountToSend / Math.pow(10, tokenDecimals)}) + fee (${feeInUsdcFinal / Math.pow(10, tokenDecimals)}) is greater than your balance (${senderBalance / Math.pow(10, tokenDecimals)})`);
    const transactionExecutable = new web3_js_1.Transaction({
        feePayer: constants_1.GASLESS_RELAYER.publicKey,
    });
    transactionExecutable.add((0, spl_token_1.createTransferInstruction)(fromTokenAccount.address, toTokenAccount.address, senderWallet.publicKey, amountToSend));
    transactionExecutable.add((0, spl_token_1.createTransferInstruction)(fromTokenAccount.address, relayerTokenAccount.address, senderWallet.publicKey, feeInUsdcFinal));
    // Update the blockhash of the transaction with the latest one
    transactionExecutable.recentBlockhash = blockhash;
    transactionExecutable.lastValidBlockHeight = lastValidBlockHeight;
    // Send the transactionExecutable
    const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(constants_1.APP_CONNECTION, transactionExecutable, [constants_1.GASLESS_RELAYER, senderWallet], {
        commitment: "confirmed",
    });
    console.log(`https://solscan.io/tx/${signature}`);
    const newTx = {
        senderId: senderWalletData._id, // Reference to the sender user
        transactions: [
            {
                recipientId: recipientWalletData._id, // Reference to the recipient user
                amount: amount,
            },
        ],
        currency: { address: stableCoin.tokenAddress, symbol: stableCoin.symbol },
        transactionHash: signature,
        timestamp: new Date(),
        totalAmount: amount,
        gasFees: feeInUsdc,
        fee: protocolFees,
        description: description,
    };
    yield (0, txHistoryService_1._createNewTransaction)(newTx, invoiceId);
    return {
        message: "Funds transfer successfully.",
        txHash: signature,
    };
});
exports.sendFundsService = sendFundsService;
