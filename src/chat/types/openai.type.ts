export enum Operation {
  DEPOSIT = 'deposit',
}

export enum DepositType {
  CRYPTO = 'crypto',
  BANK = 'bank',
}

export type OpenAIThead = {
  id: string;
  object: string;
  created_at: number;
  metadata: object;
  tool_resources: object;
};

export type OpenAIAction = {
  operation: Operation;
  payload: object;
};

export type DepostAction = {
  type: DepositType;
  network: string;
};
