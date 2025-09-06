import { getNextExecutionDate } from "../utils/helper";
import { IPayee, RecurringPayment } from "../models/recurringPaymentModel";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionMessage,
} from "@solana/web3.js";
import {
  APP_CONNECTION,
  GASLESS_RELAYER,
  PROTOCOL_FEES,
  STABLE_COINS,
} from "../constants";
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { decryptPrivateKey } from "../utils/encryption";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import User from "../models/userModel";
import mongoose from "mongoose";
import { fetchTokenAccountData } from "../utils/raydiumUtils";
import { ValidationError } from "../utils/AppError";
import { _calculateTransactionCostInUsdc } from "../services/User/userService";
import { ITransaction, ITransactionHistory } from "../models/txHistoryModel";
import { _createNewTransaction } from "../services/TxHistory/txHistoryService";

export const executeRecurringPayments = async () => {
  console.log(
    "XXXXX================== RUNNING executeRecurringPayments ==================XXXXX"
  );
  const now = new Date();

  const payments = await RecurringPayment.find({
    isActive: true,
    nextExecutionDate: { $lte: now },
  });
  console.log("🚀 ~ executeRecurringPayments ~ payments:", payments);

  for (const payment of payments) {
    const {
      userId,
      stablecoin,
      sameAmountForAll,
      defaultAmount,
      payees,
      paymentName,
    } = payment;
    try {
      console.log(`Executing Payment ID: ${payment._id}`);
      const isExecuted = await processPayment(
        paymentName,
        userId,
        stablecoin,
        sameAmountForAll,
        defaultAmount,
        payees
      );

      if (!isExecuted) {
        console.error(`Payment ID ${payment._id} failed.`);
        continue;
      }

      // ✅ Update next execution and last execution date
      payment.lastExecutionDate = now;
      payment.nextExecutionDate = getNextExecutionDate(payment.recurrence);
      await payment.save();

      console.log(`Payment ID ${payment._id} executed successfully.`);
    } catch (err) {
      console.error(`Payment ID ${payment._id} failed:`, err);
    }
  }

  console.log(
    "XXXXX================== FINISHED executeRecurringPayments ==================XXXXX"
  );
};

async function processPayment(
  paymentName: string,
  userId: mongoose.Schema.Types.ObjectId,
  stablecoin: string,
  sameAmountForAll: boolean,
  defaultAmount: number | undefined,
  payees: IPayee[]
): Promise<boolean> {
  try {
    const stableCoin = STABLE_COINS.find((c) => c.symbol === stablecoin);
    if (!stableCoin) throw new Error(`Unsupported stablecoin: ${stablecoin}`);

    const sender = await User.findById(userId);
    if (!sender?.solanaWallet?.address)
      throw new Error("Sender wallet not found.");

    const decryptedPrivateKey = decryptPrivateKey(
      sender.solanaWallet.encryptedPrivateKey
    );
    const senderWallet = Keypair.fromSecretKey(
      bs58.decode(decryptedPrivateKey)
    );
    const mintAddress = new PublicKey(stableCoin.tokenAddress);
    const decimals = stableCoin.decimals;

    // const dummyUSDCAmount = Math.floor(0.00154 * 10 ** decimals);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      APP_CONNECTION,
      GASLESS_RELAYER,
      mintAddress,
      senderWallet.publicKey
    );

    const relayerTokenAccount = await getOrCreateAssociatedTokenAccount(
      APP_CONNECTION,
      GASLESS_RELAYER,
      mintAddress,
      GASLESS_RELAYER.publicKey
    );

    const transactionSimulate = new Transaction({
      feePayer: GASLESS_RELAYER.publicKey,
    });

    const transactionExecutable = new Transaction({
      feePayer: GASLESS_RELAYER.publicKey,
    });

    let totalFundsToSend = 0;

    for (const payee of payees) {
      const amountToSend = sameAmountForAll ? defaultAmount : payee.amount;
      if (!amountToSend || amountToSend <= 0) continue;

      const recipientAddress = new PublicKey(payee.walletAddress);

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        APP_CONNECTION,
        GASLESS_RELAYER,
        mintAddress,
        recipientAddress
      );

      const amountInSmallestUnit = Math.floor(amountToSend * 10 ** decimals);

      //adding transfers for all receivers for simulation
      transactionSimulate.add(
        createTransferInstruction(
          fromTokenAccount.address,
          toTokenAccount.address,
          senderWallet.publicKey,
          amountInSmallestUnit
        )
      );

      //adding transfers for all receivers for execution
      transactionExecutable.add(
        createTransferInstruction(
          fromTokenAccount.address,
          toTokenAccount.address,
          senderWallet.publicKey,
          amountInSmallestUnit
        )
      );

      totalFundsToSend = totalFundsToSend + amountToSend;
    }
    const protocolFees = totalFundsToSend * PROTOCOL_FEES;
    const protocolFeesInSmallestUnit = protocolFees ** decimals;

    transactionSimulate.add(
      createTransferInstruction(
        fromTokenAccount.address,
        relayerTokenAccount.address,
        senderWallet.publicKey,
        protocolFeesInSmallestUnit
      )
    );

    if (transactionSimulate.instructions.length === 0) {
      console.log("No valid transfers to process.");
      return;
    }

    const { blockhash, lastValidBlockHeight } =
      await APP_CONNECTION.getLatestBlockhash();
    transactionSimulate.recentBlockhash = blockhash;
    transactionSimulate.lastValidBlockHeight = lastValidBlockHeight;

    // ✅ Simulate to calculate fee
    const messageV0 = new TransactionMessage({
      payerKey: GASLESS_RELAYER.publicKey,
      recentBlockhash: blockhash,
      instructions: transactionSimulate.instructions,
    }).compileToV0Message();

    const fees = await APP_CONNECTION.getFeeForMessage(messageV0);
    const txFeeInSol = fees.value / LAMPORTS_PER_SOL;

    const feeInStable = await _calculateTransactionCostInUsdc(txFeeInSol); // Your stablecoin fee conversion function
    const feeInStableFinal = Math.ceil((feeInStable + protocolFees) * 10 ** decimals);

    // ✅ Add the fee deduction instruction to the relayer account
    transactionExecutable.add(
      createTransferInstruction(
        fromTokenAccount.address,
        relayerTokenAccount.address,
        senderWallet.publicKey,
        feeInStableFinal
      )
    );

    // ✅ Final balance check
    const res = await fetchTokenAccountData(senderWallet.publicKey);
    const balance = res.tokenAccounts.find(
      (a) => a.mint.toBase58() === mintAddress.toBase58()
    )?.amount;

    const userStableCoinBalance = Number(balance) / 10 ** decimals;
    if (!balance || (totalFundsToSend + feeInStable + protocolFees) > userStableCoinBalance) {
      throw new ValidationError(
        "Insufficient balance to cover transfers and fees."
      );
    }

    // ✅ Finalize and send transaction
    const signature = await sendAndConfirmTransaction(
      APP_CONNECTION,
      transactionExecutable,
      [GASLESS_RELAYER, senderWallet],
      { commitment: "confirmed" }
    );

    console.log(
      `🎉 Batched Transaction Successful: https://solscan.io/tx/${signature}`
    );

    const allTx: ITransaction[] = [];
    for (const payee of payees) {
      const amountToSend = sameAmountForAll ? defaultAmount : payee.amount;
      if (!amountToSend || amountToSend <= 0) continue;
      const newTx: ITransaction = {
        recipientId: payee.userId as unknown as ITransaction["recipientId"], // Reference to the recipient user
        amount: amountToSend,
      };
      allTx.push(newTx);
    }
    const newTx: ITransactionHistory = {
      senderId: sender._id, // Reference to the sender user
      transactions: allTx,
      currency: { address: stableCoin.tokenAddress, symbol: stableCoin.symbol },
      transactionHash: signature,
      timestamp: new Date(),
      totalAmount: totalFundsToSend,
      gasFees: feeInStable,
      fee: protocolFees,
      description: paymentName, //TODO: add recurring payement description
    };

    await _createNewTransaction(newTx);
    return true;
  } catch (error) {
    console.error(`Failed to process payment: ${error.message}`);
    return false;
  }
}
