import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionStatus, Prisma } from '@prisma/client';

@Injectable()
export class FundingService {
  private readonly logger = new Logger(FundingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create KHQR PayWay deposit transaction
   */
  async createKhqrDeposit(resellerId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than zero');
    }

    const reseller = await this.prisma.reseller.findUnique({
      where: { id: resellerId },
    });

    if (!reseller) {
      throw new NotFoundException('Reseller account not found');
    }

    const formattedAmount = Number(amount).toFixed(2);
    const tranId = `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const paywayCreateUrl =
      process.env.PAYWAY_CREATE_TRAN_URL ||
      'https://payway.jlastore.com/api/create-tran';
    const abaData =
      process.env.ABA_PAYWAY_URL ||
      'https://link.payway.com.kh/ABAPAY7r517608k';

    const continueUrl = 'https://sakuraapi.lol/funding?status=success';
    const cancelUrl = 'https://sakuraapi.lol/funding?status=cancel';
    const webhookUrl = 'https://sakuraapi.lol/api/v1/funding/webhook';

    try {
      const response = await fetch(paywayCreateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: formattedAmount,
          tran_id: tranId,
          aba_data: abaData,
          continue_url: continueUrl,
          cancel_url: cancelUrl,
          webhook: webhookUrl,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        this.logger.error(
          `PayWay create-tran failed: ${JSON.stringify(resJson)}`,
        );
        throw new BadRequestException(
          resJson.message || 'Failed to create PayWay KHQR transaction',
        );
      }

      // Record pending deposit in balance transactions
      const currentBal = Number(reseller.balance);
      await this.prisma.balanceTransaction.create({
        data: {
          transactionNumber: tranId,
          resellerId,
          amount: new Prisma.Decimal(formattedAmount),
          previousBalance: new Prisma.Decimal(currentBal),
          newBalance: new Prisma.Decimal(currentBal),
          type: TransactionType.ADMIN_CREDIT,
          status: TransactionStatus.PENDING,
          note: `PayWay KHQR Deposit: $${formattedAmount} USD (Pending)`,
        },
      });

      return {
        success: true,
        tran_id: tranId,
        payway_tran_id: resJson.payway_tran_id,
        amount: formattedAmount,
        currency: 'USD',
        qr_string: resJson.data?.qr_string,
        deeplink: resJson.deeplink,
        checkout_url: resJson.checkout_url,
        download_qr: resJson.data?.download_qr,
        expire_in_sec: resJson.data?.expire_in_sec || 180,
      };
    } catch (err: any) {
      this.logger.error(`Error in createKhqrDeposit: ${err.message}`);
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(
        err.message || 'Payment Gateway is currently unavailable',
      );
    }
  }

  /**
   * Check status of KHQR transaction and credit balance if approved
   */
  async checkDepositStatus(tranId: string, resellerId?: string) {
    const tx = await this.prisma.balanceTransaction.findUnique({
      where: { transactionNumber: tranId },
      include: { reseller: true },
    });

    if (!tx) {
      throw new NotFoundException('Deposit transaction not found');
    }

    if (resellerId && tx.resellerId !== resellerId) {
      throw new BadRequestException('Transaction does not belong to your account');
    }

    // If already completed, return success immediately
    if (tx.status === TransactionStatus.COMPLETED) {
      return {
        success: true,
        paid: true,
        status: 'approved',
        amount: tx.amount.toString(),
        newBalance: tx.reseller.balance.toString(),
        message: 'Payment completed and credited successfully',
      };
    }

    // Call PayWay to check payment status
    const paywayCheckUrl =
      process.env.PAYWAY_CHECK_STATUS_URL ||
      'https://payway.jlastore.com/api/check-payment-status';

    try {
      const response = await fetch(paywayCheckUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tran_id: tranId }),
      });

      const resJson = await response.json();
      const action = resJson?.data?.action;

      if (action === 'approved') {
        // Atomically credit reseller wallet
        const updated = await this.prisma.$transaction(async (prismaTx) => {
          // Double check transaction status inside lock
          const currentTx = await prismaTx.balanceTransaction.findUnique({
            where: { id: tx.id },
          });

          if (currentTx?.status === TransactionStatus.COMPLETED) {
            const currentReseller = await prismaTx.reseller.findUnique({
              where: { id: tx.resellerId },
            });
            return {
              paid: true,
              balance: currentReseller?.balance.toString() || '0.00',
            };
          }

          const currentReseller = await prismaTx.reseller.findUnique({
            where: { id: tx.resellerId },
          });

          if (!currentReseller) {
            throw new NotFoundException('Reseller not found');
          }

          const depositAmt = Number(tx.amount);
          const currentBal = Number(currentReseller.balance);
          const newBal = Number((currentBal + depositAmt).toFixed(4));

          await prismaTx.reseller.update({
            where: { id: tx.resellerId },
            data: { balance: new Prisma.Decimal(newBal) },
          });

          await prismaTx.balanceTransaction.update({
            where: { id: tx.id },
            data: {
              status: TransactionStatus.COMPLETED,
              previousBalance: new Prisma.Decimal(currentBal),
              newBalance: new Prisma.Decimal(newBal),
              note: `PayWay KHQR Deposit: $${depositAmt.toFixed(2)} USD (Approved & Credited)`,
            },
          });

          return {
            paid: true,
            balance: newBal.toFixed(4),
          };
        });

        return {
          success: true,
          paid: true,
          status: 'approved',
          amount: tx.amount.toString(),
          newBalance: updated.balance,
          message: 'Payment verified and credited to wallet balance!',
        };
      }

      return {
        success: true,
        paid: false,
        status: action || 'pending',
        message: 'Awaiting customer payment',
      };
    } catch (err: any) {
      this.logger.error(`Error checking deposit status: ${err.message}`);
      return {
        success: false,
        paid: false,
        status: 'error',
        message: err.message || 'Status check failed',
      };
    }
  }

  /**
   * Handle incoming Webhook from PayWay
   */
  async handleWebhook(body: any) {
    this.logger.log(`PayWay Webhook received: ${JSON.stringify(body)}`);
    const tranId = body?.tran_id || body?.data?.tran_id;

    if (!tranId) {
      return { success: false, message: 'Missing tran_id in webhook' };
    }

    try {
      const result = await this.checkDepositStatus(tranId);
      return { success: true, result };
    } catch (err: any) {
      this.logger.error(`Webhook processing error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
