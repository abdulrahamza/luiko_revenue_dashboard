export const SUBSCRIPTION_ABI = [
  {
    inputs: [
      { name: "_price", type: "uint256" },
      { name: "_duration", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  // ─── Events ───
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "subscriber", type: "address" },
      { indexed: false, name: "expiry", type: "uint256" },
    ],
    name: "Subscribed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "subscriber", type: "address" }],
    name: "Cancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "newPrice", type: "uint256" }],
    name: "PriceUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "newDuration", type: "uint256" }],
    name: "DurationUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "previousOwner", type: "address" },
      { indexed: true, name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  // ─── Read Functions ───
  {
    inputs: [{ name: "_addr", type: "address" }],
    name: "isSubscribed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_addr", type: "address" }],
    name: "getExpiry",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "subscriptionPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "subscriptionDuration",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // ─── Write Functions ───
  {
    inputs: [],
    name: "subscribe",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "cancelSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_price", type: "uint256" }],
    name: "setPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_duration", type: "uint256" }],
    name: "setDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ─── Receive ───
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;
