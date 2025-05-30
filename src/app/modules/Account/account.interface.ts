import { Document, Types } from "mongoose";

export interface IAccount extends Document {
  userId: Types.ObjectId; // Unique identifier for the member
  balance: number; // Current balance of the member
  transactions: IAccountTransaction[]; // History of all transactions
  messId: Types.ObjectId;
  date: Date;
}

// Interface for transactions
export interface IAccountTransaction {
  date: Date; // ISO 8601 date format
  amount: number; // Transaction amount
  type: TransactionType; // Credit or Debit
  description: string; // Description of the transaction
}

// Enum for transaction types
export enum TransactionType {
  Credit = "credit", // Money given to the member (payable to member)
  Debit = "debit", // Money received from the member (due to the mess)
}
