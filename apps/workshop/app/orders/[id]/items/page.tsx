'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Part, EstimateLineItem } from '@nrn/shared';
import { ArrowLeft, Search, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

export default function ItemsPage({ params }: { params: { id: string } }) {
  const { id }    = params;
  const router    = useRouter();
  const [parts, setParts]     = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [cart, setCart]       = useState<Map<string, number>>(new Map());
  const debounced = useDebounce(search, 300);

  useEffect(() => {
    api.get('/parts', { params: { search: debounced } })
      .then((r) => setParts(r.data.data ?? []))
      .finally(() => setLoading(false));
  }, [debounced]);

  const setQty = (partId: string, qty: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      if (qty <= 0) next.delete(partId);
      else next.set(partId, qty);
      return next;
    });
  };

  const subtotal = Array.from(cart.entries()).reduce((sum, [partId, qty]) => {
    const part = parts.find((p) => p.id === partId);
    return sum + (part?.unitPrice ?? 0) * qty;
  }, 0);

  const handleDone = () => {
    // Store in sessionStorage for the review page
    const lineItems: EstimateLineItem[] = Array.from(cart.entries()).map(([partId, qty]) => {
      const part = parts.find((p) => p.id === partId)!;
      return { description: part.description, quantity: qty, unitPrice: part.unitPrice, partNumber: part.partNumber };
    });
    sessionStorage.setItem(`estimate_items_${id}`, JSON.stringify(lineItems));
    router.push(`/orders/${id}/review`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Add Items</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search parts catalog..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
      ) : (
        parts.map((part) => {
          const qty = cart.get(part.id) ?? 0;
          return (
            <Card key={part.id} className="flex items-center justify-between p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{part.description}</span>
                  {!part.inStock && <Badge variant="warn" className="text-xs">Out of stock</Badge>}
                </div>
                <p className="font-mono text-xs text-muted-foreground">{part.partNumber}</p>
                <p className="text-sm font-semibold text-[var(--brand-primary)]">SAR {part.unitPrice.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {qty > 0 ? (
                  <>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQty(part.id, qty - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-semibold">{qty}</span>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQty(part.id, qty + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="brand" onClick={() => setQty(part.id, 1)}>
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}

      {/* Sticky Footer */}
      {cart.size > 0 && (
        <div className="fixed bottom-16 left-0 right-0 mx-auto flex max-w-[390px] items-center justify-between border-t bg-background p-4">
          <div>
            <p className="text-xs text-muted-foreground">{cart.size} items</p>
            <p className="font-bold">SAR {subtotal.toLocaleString()}</p>
          </div>
          <Button variant="brand" onClick={handleDone}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Review
          </Button>
        </div>
      )}
    </div>
  );
}
