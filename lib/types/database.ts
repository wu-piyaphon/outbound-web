export type TradeSide = "buy" | "sell";
export type TradeStatus = "pending" | "open" | "filled" | "cancelled" | "rejected";

export type SignalIndicators = {
  ema: string;
  rsi: string;
  atr: string;
};

export type Signal = {
  id: string;
  symbol: string;
  side: TradeSide;
  price_at_signal: string;
  indicators: SignalIndicators;
  is_executed: boolean;
  reasoning: string | null;
  created_at: string;
};

export type Trade = {
  id: string;
  parent_id: string | null;
  signal_id: string | null;
  account_transfer_id: string | null;
  alpaca_order_id: string | null;
  symbol: string;
  side: TradeSide;
  quantity: string;
  price_per_unit: string | null;
  avg_fill_price: string | null;
  commission_fee: string | null;
  fx_fee_amortized: string | null;
  stop_loss: string | null;
  take_profit: string | null;
  status: TradeStatus;
  metadata: Record<string, unknown>;
  filled_at: string | null;
  created_at: string;
};

export type AccountTransfer = {
  id: string;
  type: "deposit" | "withdrawal";
  amount_thb: string;
  amount_usd: string;
  fee_thb: string;
  fee_usd: string | null;
  exchange_rate: string;
  target_trades: number;
  remaining_trades: number | null;
  created_at: string;
  updated_at: string;
};
