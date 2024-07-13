export enum Operation {
  DEPOSIT = 'deposit',
  SEARCH_CONTACT = 'search_contact',
  CREATE_CONTACT = 'create_contact',
  SEND_MONEY = 'send_money',
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

// actions

export type DepostAction = {
  type: DepositType;
  network: string;
};
export type SearchContactAction = {
  filter: string;
  value: string;
};
export type CreateContactAction = {
  name: string;
  phone: string;
};
export type SendMoneyAction = {
  amount: number;
  contactPhone: string;
  contactName: string;
};
