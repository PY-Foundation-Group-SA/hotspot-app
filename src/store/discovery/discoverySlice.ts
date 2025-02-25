import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { makeDiscoverySignature } from '../../utils/secureAccount'
import { getWallet, postWallet } from '../../utils/walletClient'
import { Loading } from '../activity/activitySlice'
import { DiscoveryRequest, RecentDiscoveryInfo } from './discoveryTypes'

export type DiscoveryState = {
  recentDiscoveryInfos: Record<string, RecentDiscoveryInfo>
  infoLoading: Loading
  requestLoading: Loading
  selectedRequest?: DiscoveryRequest | null
  requestId?: number | null
}

const initialState: DiscoveryState = {
  infoLoading: 'idle',
  requestLoading: 'idle',
  recentDiscoveryInfos: {},
}

export const fetchRecentDiscoveries = createAsyncThunk<
  RecentDiscoveryInfo,
  { hotspotAddress: string }
>('discovery/recent', async ({ hotspotAddress }) =>
  getWallet(`discoveries/${hotspotAddress}`, null, true),
)

export const startDiscovery = createAsyncThunk<
  DiscoveryRequest,
  { hotspotAddress: string; hotspotName: string }
>('discovery/start', async ({ hotspotAddress, hotspotName }) => {
  const signature = await makeDiscoverySignature(hotspotAddress)
  return postWallet(
    'discoveries',
    {
      hotspot_address: hotspotAddress,
      hotspot_name: hotspotName,
      signature,
    },
    true,
  )
})

export const fetchDiscoveryById = createAsyncThunk<
  DiscoveryRequest | null,
  { requestId: number }
>('discovery/fetch', async ({ requestId }) => {
  return getWallet(`discoveries/responses/${requestId}`, null, true)
})

// This slice contains data related to discovery mode
const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    setSelectedRequest: (state, action: PayloadAction<DiscoveryRequest>) => {
      state.selectedRequest = action.payload
      state.requestId = action.payload.id
    },
    clearSelections: (state) => {
      state.selectedRequest = null
      state.requestId = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRecentDiscoveries.pending, (state) => {
      state.infoLoading = 'pending'
    })
    builder.addCase(
      fetchRecentDiscoveries.fulfilled,
      (
        state,
        {
          payload,
          meta: {
            arg: { hotspotAddress },
          },
        },
      ) => {
        state.recentDiscoveryInfos[hotspotAddress] = payload
        state.infoLoading = 'fulfilled'
      },
    )
    builder.addCase(fetchRecentDiscoveries.rejected, (state) => {
      state.infoLoading = 'rejected'
    })
    builder.addCase(fetchDiscoveryById.pending, (state) => {
      state.requestLoading = 'pending'
    })
    builder.addCase(fetchDiscoveryById.rejected, (state) => {
      state.requestLoading = 'rejected'
    })
    builder.addCase(fetchDiscoveryById.fulfilled, (state, { payload }) => {
      state.requestLoading = 'fulfilled'
      state.selectedRequest = payload
    })
    builder.addCase(startDiscovery.pending, (state) => {
      state.selectedRequest = null
    })
    builder.addCase(startDiscovery.fulfilled, (state, { payload }) => {
      state.requestId = payload.id
    })
  },
})

export default discoverySlice
