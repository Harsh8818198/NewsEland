'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function HoldingsList({ holdings }: { holdings: any[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (holdingId: string) => {
    if (!confirm('Are you sure you want to remove this holding?')) return;

    setDeletingId(holdingId);
    try {
      const response = await fetch(`/api/portfolio/holdings?id=${holdingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete holding');

      router.refresh();
    } catch (error) {
      console.error('Error deleting holding:', error);
      alert('Failed to delete holding');
    } finally {
      setDeletingId(null);
    }
  };

  if (!holdings || holdings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No holdings yet</p>
        <p className="text-sm">Add your first stock to start receiving AI signals</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Symbol</th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Company</th>
            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Quantity</th>
            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Avg Price</th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Added</th>
            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <span className="font-semibold text-blue-600">{holding.symbol}</span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {holding.company_name || '-'}
              </td>
              <td className="py-3 px-4 text-right text-sm">
                {holding.quantity || '-'}
              </td>
              <td className="py-3 px-4 text-right text-sm">
                {holding.purchase_price ? `$${holding.purchase_price.toFixed(2)}` : '-'}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {new Date(holding.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(holding.id)}
                  disabled={deletingId === holding.id}
                >
                  {deletingId === holding.id ? 'Removing...' : 'Remove'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
