<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <h1 class="text-2xl font-bold mb-4">Web3 Wallet</h1>

    <WalletConnect />

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

    <TokenTransfer />
  </div>
</template>

<script setup lang="ts">
import WalletConnect from './components/WalletConnect.vue'
import TokenTransfer from './components/TokenTransfer.vue'
import { useWalletStore } from './stores/wallet'

const walletStore = useWalletStore()
</script>
