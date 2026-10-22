export class CreateTransactionDto {
  title: string;
  amount: number;
  type: string;
  date: string;
  source?: string;
}