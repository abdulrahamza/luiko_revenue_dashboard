import RevenueChart from '@/components/RevenueChart';
import OnChainTable from '@/components/OnChainTable';

export default async function Dashboard() {
  const wallet = process.env.NEXT_PUBLIC_REVENUE_WALLET as string;
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY as string;

  let txs: { hash: string; value: number; timeStamp: number }[] = [];
  let totalRevenue = 0;

  if (wallet && alchemyKey) {
    try {
      const res = await fetch(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromBlock: '0x0',
              toAddress: wallet,
              excludeZeroValue: true,
              withMetadata: true,
              category: ['erc20'],
              contractAddresses: ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'], // USDC
              order: 'desc',
              maxCount: '0x32',
            },
          ],
        }),
      });

    const data = await res.json();

    txs = (data.result?.transfers || [])
      // remove duplicates
      .filter((tx: any, index: number, self: any[]) => index === self.findIndex(t => t.hash === tx.hash))
      .map((tx: any) => ({
        hash: tx.hash,
        value: Number(tx.value),
        timeStamp: Math.floor(new Date(tx.metadata.blockTimestamp).getTime() / 1000),
      }));

    totalRevenue = txs.reduce((sum, tx) => sum + tx.value, 0);
  } catch (err) {
    console.error('Failed fetching transactions:', err);
  }
}

return (
  <div className="min-h-screen bg-zinc-950 text-white p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-5xl font-bold mb-6">lauki.ai Revenue Dashboard</h1>
      <p className="text-zinc-400 mb-10">All revenue is verifiable on-chain via Base</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-gray-400">Total Revenue (USDC)</p>
          <h2 className="text-3xl font-bold">${totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-gray-400">Transactions</p>
          <h2 className="text-3xl font-bold">{txs.length}</h2>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-gray-400">Wallet</p>
          <h2 className="text-sm break-all">{wallet}</h2>
        </div>
      </div>

      {/* Chart */}
      <RevenueChart txs={txs} />

      {/* Table */}
      <OnChainTable txs={txs} />
    </div>
  </div>
);
}