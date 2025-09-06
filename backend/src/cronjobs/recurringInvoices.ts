import { getNextExecutionDate } from "../utils/helper";
import { IS_TEST_MODE } from "../constants";
import { _calculateTransactionCostInUsdc } from "../services/User/userService";
import { RecurringInvoice } from "../models/recurringInvoiceModel";
import { ICreateInvoicePayload } from "../services/Invoice/DTO";
import { createAndSendInvoiceService } from "../services/Invoice/invoiceService";

export const executeRecurringInvoicesCron = async () => {
  console.log(
    "XXXXX================== RUNNING executeRecurringInvoicesCron ==================XXXXX"
  );

  try {
    const now = new Date();

    const activeInvoices = await RecurringInvoice.find({
      isActive: true,
      nextExecutionDate: { $lte: now },
    });
    console.log(
      "🚀 ~ executeRecurringInvoicesCron ~ executing:",
      activeInvoices.length
    );

    for (const invoiceService of activeInvoices) {
      const {
        creatorId,
        invoiceName,
        lineItem: { amount, currency },
        payeeEmail,
        description,
      } = invoiceService;
      try {
        console.log(`Executing Recurring Invoice ID: ${invoiceService._id}`);
        const isExecuted = await processRecurringInvoice(
          creatorId.toString(),
          invoiceName,
          currency,
          amount,
          payeeEmail,
          description
        );

        if (!isExecuted) {
          console.error(`Recurring Invoice ID ${invoiceService._id} failed.`);
          continue;
        }

        // ✅ Update next execution and last execution date
        invoiceService.lastExecutionDate = now;
        invoiceService.nextExecutionDate = getNextExecutionDate(
          invoiceService.recurrence,
          IS_TEST_MODE
        );
        await invoiceService.save();

        console.log(
          `Recurring Invoice ID ${invoiceService._id} executed successfully.`
        );
      } catch (err) {
        console.error(
          `Recurring Invoice ID ${invoiceService._id} failed:`,
          err
        );
      }
    }
  } catch (error) {
    console.log("🚀 ~ executeRecurringInvoicesCron ~ error:", error);
  }

  console.log(
    "XXXXX================== FINISHED executeRecurringInvoicesCron ==================XXXXX"
  );
};

async function processRecurringInvoice(
  creatorId: string,
  invoiceName: string,
  tokenAddress: string,
  amount: number,
  payeeEmail: string,
  description: string
): Promise<boolean> {
  try {
    const payload: ICreateInvoicePayload = {
      creatorId: creatorId,
      invoiceName: invoiceName,
      tokenAddress: tokenAddress,
      amount: amount,
      payeeEmail: payeeEmail,
      description: description,
    };
    const response = await createAndSendInvoiceService(payload);
    console.log("🚀 ~ response:", response);
    return true;
  } catch (error) {
    console.error(`Failed to process payment: ${error.message}`);
    return false;
  }
}
