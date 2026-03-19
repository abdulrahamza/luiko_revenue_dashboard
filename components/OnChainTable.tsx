'use client';

interface Tx {
  hash: string;
  value: number;
  timeStamp: number;
}

interface Props {
  txs: Tx[];
}

export default function OnChainTable({ txs }: Props) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl">
      <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="py-2 px-3">Hash</th>
              <th className="py-2 px-3">Amount (USDC)</th>
              <th className="py-2 px-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {txs.map(tx => (
              <tr key={tx.hash} className="border-b border-gray-800 hover:bg-zinc-800">
                <td className="py-2 px-3 break-all text-sm">{tx.hash}</td>
                <td className="py-2 px-3 font-bold">{tx.value}</td>
                <td className="py-2 px-3">{new Date(tx.timeStamp * 1000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}