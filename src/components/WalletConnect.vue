<template>
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
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWalletStore } from '../stores/wallet'

const walletStore = useWalletStore()

const connecting = ref(false)
const hasEthereum = ref(false)
const errorMessage = ref('')

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

<style lang="scss" scoped>
.wallet-connect-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error {
  color: red;
}
</style>
