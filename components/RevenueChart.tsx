'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function RevenueChart({ txs }: { txs: any[] }) {
  const data = useMemo(
    () =>
      (txs || [])
        .map((tx) => ({
          date: new Date(Number(tx.timeStamp) * 1000).toLocaleDateString(),
          value: Number(tx.value)
        }))
        .reverse(),
    [txs]
  )

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl mb-10">
      <h2 className="text-xl mb-4">Revenue Flow</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}