<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <h1 class="text-2xl font-bold mb-4">Web3 Wallet</h1>

    <div class="wallet-connect">
      <button
        :disabled="connecting"
        @click="connectWallet"
        class="rounded-lg bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90 cursor-pointer border"
      >
        {{ walletStore.isConnected ? 'Disconnect Payment' : 'Connect Payment' }}
      </button>
      <div v-if="connecting">Loading...</div>
      <div v-else-if="!hasEthereum">Ethereum Provider Not Found</div>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>

    <div v-if="walletStore.isConnected" class="space-y-4 mt-6">
      <div class="bg-card p-4 rounded-lg shadow-sm">
        <p class="font-medium">Address:</p>
        <p>{{ walletStore.address }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-card p-4 rounded-lg shadow-sm">
          <p class="font-medium">BNB Balance:</p>
          <p>{{ walletStore.bnbBalance }} BNB</p>
        </div>

        <div class="bg-card p-4 rounded-lg shadow-sm">
          <p class="font-medium">Token Balance:</p>
          <p>{{ walletStore.tokenBalance }}</p>
        </div>
      </div>
    </div>

    <div class="token-transfer space-y-4">
      <input
        v-model="recipientAddress"
        type="text"
        placeholder="Recipient address"
        class="w-full rounded-md border p-2"
      />

      <input
        v-model="amount"
        type="number"
        placeholder="Tokens qty"
        class="w-full rounded-md border p-2"
      />

      <button
        :disabled="!walletStore.isConnected"
        @click="transferTokens"
        class="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 border-2 hover:bg-primary/90 cursor-pointer"
      >
        Send tokens
      </button>

      <div v-if="transactionStatus === 'success'" class="text-green-500">
        Transaction successful
      </div>
      <div v-else-if="transactionStatus === 'error'" class="text-red-500">
        Error sending transaction
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWalletStore } from './stores/wallet'
import { ethers } from 'ethers'

const walletStore = useWalletStore()
const connecting = ref(false)
const recipientAddress = ref('')
const amount = ref('')
const hasEthereum = ref(false)
const errorMessage = ref('')
const transactionStatus = ref<'pending' | 'success' | 'error'>()

async function connectWallet() {
  if (!hasEthereum.value) {
    errorMessage.value = 'Ethereum provider not available'
    return
  }

  connecting.value = true

  try {
    if (window.ethereum.isMetaMask) {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    if (accounts.length > 0) {
      walletStore.setAddress(accounts[0])
      walletStore.connect()
    }
  } catch (error) {
    console.error('Connecting error:', error)
    errorMessage.value = 'Failed to connect wallet'
  } finally {
    connecting.value = false
  }
}

async function transferTokens() {
  if (!walletStore.isConnected || !recipientAddress.value || !amount.value) return

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const tokenContract = new ethers.Contract(
      '0x8a.....................651fB72bBc2', // replace token
      ['function transfer(address to, uint256 amount)) public returns (bool)'],
      signer,
    )

    transactionStatus.value = 'pending'

    const tx = await tokenContract.transfer(recipientAddress.value, ethers.parseEther(amount.value))
    await tx.wait()

    transactionStatus.value = 'success'
    walletStore.updateBalances()
  } catch (error) {
    transactionStatus.value = 'error'
    console.error('Transaction failed:', error)
  }
}

async function checkProviderAvailability() {
  if (typeof window === 'undefined') {
    errorMessage.value = 'Cannot detect Ethereum provider in this environment'
    return
  }

  if (typeof window.ethereum === 'undefined') {
    errorMessage.value = 'Please install MetaMask or another Ethereum provider'
    return
  }

  hasEthereum.value = true
}

onMounted(async () => {
  await checkProviderAvailability()
})
</script>

<style>
.wallet-connect-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error {
  color: red;
}
</style>
