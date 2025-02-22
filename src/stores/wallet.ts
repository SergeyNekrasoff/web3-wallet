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
      const network = await provider.value.getNetwork()
      const code = await provider.value.getCode(process.env.VUE_APP_TOKEN_ADDRESS!)

      if (network.chainId !== 97n) {
        throw new Error('Wrong network')
      }

      state.value.bnbBalance = (await provider.value.getBalance(state.value.address)).toString()

      if (code === '0x') {
        throw new Error('Contract does not exist on this networkClick to apply')
      }

      console.log(`process.env.VUE_APP_TOKEN_ADDRESS: ${process.env.VUE_APP_TOKEN_ADDRESS}`)

      const tokenContract = new ethers.Contract(
        process.env.VUE_APP_TOKEN_ADDRESS!, // replace token
        ['function balanceOf(0xeeeEB792D818e8F2c9B75A17f137851C6AB2F3dD) view returns (uint256)'],
        provider.value,
      )

      state.value.tokenBalance = await tokenContract.balanceOf(state.value.address).toString()
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
