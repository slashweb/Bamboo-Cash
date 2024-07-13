export enum Operation {
  DEPOSIT = 'deposit',
  SEARCH_USER_NETWORK = 'search_user_network',
  SEARCH_CONTACT = 'search_contact',
  CREATE_CONTACT = 'create_contact',
  SEND_MONEY = 'send_money',
  CONFIRM_TRANSACTION = 'confirm_transaction',
  SWAP_TO_APECOIN = 'swap_to_apecoin',
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
export type ConfirmTransactionAction = {
  type: DepositType;
  value: string;
};

export type SwapToApeCoinAction = {
  walletId: string;
};
