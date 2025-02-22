import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum: {
      isMetaMask: boolean
      request: (args: { method: string; params?: string[] }) => Promise<string[]>
    }
  }
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  bnbBalance: string
  tokenBalance: string
}

export const useWalletStore = defineStore('wallet', () => {
  const state = ref<WalletState>({
    address: null,
    isConnected: false,
    bnbBalance: '0',
    tokenBalance: '0',
  })

  const provider = computed(() => {
    return new ethers.BrowserProvider(window.ethereum)
  })

  const setAddress = (address: string) => {
    state.value.address = address
  }

  const connect = () => {
    state.value.isConnected = true
    updateBalances()
  }

  const disconnect = () => {
    state.value.isConnected = false
    state.value.address = null
    state.value.bnbBalance = '0'
    state.value.tokenBalance = '0'
  }

  const updateBalances = async () => {
    if (!state.value.address || !provider.value) return
    try {
      state.value.bnbBalance = (await provider.value.getBalance(state.value.address)).toString()

      const tokenContract = new ethers.Contract(
        '0x8a.....................651fB72bBc2', // replace token
        ['function balanceOf(address account) view returns (uint256)'],
        provider.value,
      )

      state.value.tokenBalance = await tokenContract.balanceOf(state.value.address)
    } catch (error) {
      console.error('Error updating balances:', error)
    }
  }

  return {
    ...state.value,
    setAddress,
    connect,
    disconnect,
    updateBalances,
  }
})
