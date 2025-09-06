"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import AssetItem, { type AssetItemProps } from "./AssetItem";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import type { Asset } from "@/types/user.types";
import AssetsModal from "@/components/modals/Assets.modal";
import apiClient from "@/lib/axiosClient";
import { NotifyError, NotifySuccess } from "@/components/helper/common";
import { formatNumber } from "@/components/helper";

type BalanceAndAssetsProps = {
  assets?: Asset[] | null; // ← allow null/undefined from parent
};

const BalanceAndAssets = ({ assets: initialAssets }: BalanceAndAssetsProps) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(Array.isArray(initialAssets) ? initialAssets : []);

  // keep local state in sync if parent prop changes
  useEffect(() => {
    setAssets(Array.isArray(initialAssets) ? initialAssets : []);
  }, [initialAssets]);

  const totalBalanceNumber = useMemo(
    () => (Array.isArray(assets) ? assets.reduce((sum, a) => sum + Number(a?.balance ?? 0), 0) : 0),
    [assets]
  );

  const totalBalanceDisplay = useMemo(() => formatNumber(totalBalanceNumber), [totalBalanceNumber]);

  const assetItems: AssetItemProps[] = useMemo(
    () =>
      (Array.isArray(assets) ? assets : []).map((a) => ({
        icon: a.image,
        name: a.name,
        ticker: a.symbol,
        // show raw token amount; adjust if you want more formatting
        amount: String(a?.balance ?? 0),
        // assuming stablecoins = $1 peg; otherwise replace with priced value
        value: `$${formatNumber(Number(a?.balance ?? 0))}`,
      })),
    [assets]
  );

  // Refetch portfolio
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await apiClient.get<{ message: string; assets?: Asset[] | null }>("/user/portfolio");

      const nextAssets = Array.isArray(response.data?.assets) ? response.data.assets : [];
      setAssets(nextAssets);
      NotifySuccess("Your portfolio has been refreshed");
    } catch (error) {
      console.error("Error refreshing portfolio:", error);
      NotifyError("Failed to refresh your portfolio");
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasAssets = (assets?.length ?? 0) > 0;

  return (
    <>
      <Card className="p-6 xl:col-span-2">
        {isRefreshing ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-grey6 mb-1">Available Balance</h3>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">${totalBalanceDisplay}</h1>
                <Button
                  size="icon"
                  variant="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  aria-label="Refresh portfolio"
                >
                  <RefreshCcw className="text-grey6 w-5 h-5 cursor-pointer" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-grey6 mb-3">Your Assets</h3>

              {!hasAssets ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-grey6">
                  No assets to display yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {assetItems.slice(0, 4).map((item, i) => (
                    <AssetItem key={i} {...item} />
                  ))}

                  {(assets?.length ?? 0) > 4 && !isRefreshing && (
                    <Button
                      variant="link"
                      className="text-primary w-full mt-6 justify-center"
                      onClick={() => setModalOpen(true)}
                    >
                      See All
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <AssetsModal open={isModalOpen} onOpenChange={setModalOpen} assets={assetItems} />
    </>
  );
};

export default BalanceAndAssets;
