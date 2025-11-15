'use client';

import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { formatEther, formatUnits, type Address } from 'viem';
import { useMemo } from 'react';

// ERC20 ABI for reading balance
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Token configuration
export interface TokenConfig {
  address: Address;
  symbol: string;
  decimals: number;
}

// Default tokens (update with your network's addresses)
export const DEFAULT_TOKENS: Record<string, TokenConfig> = {
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    decimals: 18,
  },
};

/**
 * Hook to fetch wallet balances (ETH + ERC20 tokens)
 */
export function useWalletBalances(tokens: TokenConfig[] = Object.values(DEFAULT_TOKENS)) {
  const { address, isConnected } = useAccount();

  // Get ETH balance
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 30000,
    },
  });

  // Get ERC20 token balances
  const contracts = useMemo(() => {
    if (!address) return [];

    return tokens.map((token) => ({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    }));
  }, [address, tokens]);

  // @ts-ignore - Type inference is too deep for wagmi useReadContracts
  const { data: tokenBalances, isLoading: tokensLoading } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: isConnected && !!address && contracts.length > 0,
      refetchInterval: 30000,
    },
  });

  // Format balances
  const balances = useMemo(() => {
    if (!isConnected || !address) {
      return {
        eth: { amount: '0', value: 0, symbol: 'ETH' },
        tokens: [],
      };
    }

    const formattedTokens = tokens.map((token, index) => {
      const balance = tokenBalances?.[index]?.result as bigint | undefined;
      const amount = balance ? formatUnits(balance, token.decimals) : '0';

      return {
        symbol: token.symbol,
        amount,
        value: 0, // Will be calculated with price data
        address: token.address,
      };
    });

    return {
      eth: {
        amount: ethBalance ? formatEther(ethBalance.value) : '0',
        value: 0, // Will be calculated with price data
        symbol: 'ETH',
      },
      tokens: formattedTokens,
    };
  }, [isConnected, address, ethBalance, tokenBalances, tokens]);

  return {
    balances,
    isLoading: ethLoading || tokensLoading,
    isConnected,
    address,
  };
}

/**
 * Hook to combine wallet balances with price data
 */
export function usePortfolio(tokens: TokenConfig[] = Object.values(DEFAULT_TOKENS)) {
  const { balances, isLoading: balancesLoading, isConnected, address } = useWalletBalances(tokens);

  // Get price pairs
  const pricePairs = useMemo(() => {
    return ['ETH/USD', ...tokens.map(t => `${t.symbol}/USD`)];
  }, [tokens]);

  // This will be implemented after creating the usePrices hook
  // For now, return balances without price calculations

  return {
    balances,
    isLoading: balancesLoading,
    isConnected,
    address,
  };
}

