import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform } from 'react-native'
import { Device, State } from 'react-native-ble-plx'
import Text from '../../../components/Text'
import TouchableOpacityBox from '../../../components/TouchableOpacityBox'
import Box from '../../../components/Box'
import { useConnectedHotspotContext } from '../../../providers/ConnectedHotspotProvider'
import HotspotItem from './HotspotItem'
import { useBluetoothContext } from '../../../providers/BluetoothProvider'
import useAlert from '../../../utils/useAlert'
import CircleLoader from '../../../components/CircleLoader'
import usePermissionManager from '../../../utils/usePermissionManager'
import animateTransition from '../../../utils/animateTransition'
import sleep from '../../../utils/sleep'

type Props = { onConnected: (hotspot: Device) => void }
const HotspotDiagnosticsConnection = ({ onConnected }: Props) => {
  const [scanComplete, setScanComplete] = useState(false)
  const [bleEnabled, setBleEnabled] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<Device | null>(null)
  const [connected, setConnected] = useState(false)
  const {
    scanForHotspots,
    availableHotspots,
    connectAndConfigHotspot,
  } = useConnectedHotspotContext()
  const { enable, getState } = useBluetoothContext()
  const { showOKCancelAlert, showOKAlert } = useAlert()
  const { requestLocationPermission } = usePermissionManager()
  const hotspotCount = Object.keys(availableHotspots).length
  const keys = Object.keys(availableHotspots)
  const { t } = useTranslation()

  const checkLocation = async () => {
    if (Platform.OS === 'android') {
      const response = await requestLocationPermission()
      setLocationEnabled(response && response.granted)
    } else {
      setLocationEnabled(true)
    }
  }

  useEffect(() => {
    if (locationEnabled) {
      checkBluetooth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationEnabled])

  const checkBluetooth = useCallback(async () => {
    const state = await getState()

    if (state === State.PoweredOn) {
      setBleEnabled(true)
      return
    }

    if (Platform.OS === 'ios') {
      if (state === 'PoweredOff') {
        const decision = await showOKCancelAlert({
          titleKey: 'hotspot_setup.pair.alert_ble_off.title',
          messageKey: 'hotspot_setup.pair.alert_ble_off.body',
          okKey: 'generic.go_to_settings',
        })
        if (decision) Linking.openURL('App-Prefs:Bluetooth')
      } else {
        const decision = await showOKCancelAlert({
          titleKey: 'hotspot_setup.pair.alert_ble_off.title',
          messageKey: 'hotspot_setup.pair.alert_ble_off.body',
          okKey: 'generic.go_to_settings',
        })
        if (decision) Linking.openURL('app-settings:')
      }
    }
    if (Platform.OS === 'android') {
      await enable()
    }
    setBleEnabled(true)
  }, [enable, getState, showOKCancelAlert])

  const rescan = useCallback(async () => {
    animateTransition('HotspotDiagnosticsConnection.Rescan')
    await checkBluetooth()
    setScanComplete(false)
  }, [checkBluetooth])

  const handleConnectFailure = useCallback(
    async (messageKey?: string, titleKey = 'something went wrong') => {
      await showOKAlert({ titleKey, messageKey })
      setSelectedHotspot(null)
      rescan()
    },
    [rescan, showOKAlert],
  )

  useEffect(() => {
    checkLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const scan = async () => {
      const state = await getState()
      if (state === State.PoweredOn) {
        await scanForHotspots(2000)
      }
      animateTransition('HotspotDiagnosticsConnection.ScanComplete')
      setScanComplete(true)
    }
    if (!scanComplete && bleEnabled && locationEnabled) {
      scan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanComplete, bleEnabled, locationEnabled])

  const handleConnect = (hotspot: Device) => async () => {
    try {
      setSelectedHotspot(hotspot)
      const connectStatus = await connectAndConfigHotspot(hotspot)
      const connectHotspotSuccess = connectStatus === 'success'
      setConnected(connectHotspotSuccess)
      if (connectHotspotSuccess) {
        await sleep(500)
        onConnected(hotspot)
      } else {
        handleConnectFailure(
          'hotspot_setup.onboarding_error.body_connect_failed',
          'hotspot_setup.onboarding_error.title_connect_failed',
        )
      }
    } catch (e) {
      handleConnectFailure(e.toString())
    }
  }

  return (
    <Box padding="l" minHeight={413}>
      <Text variant="h4" color="black">
        {t('hotspot_settings.pairing.title')}
      </Text>
      <Text variant="body2" color="grayText" marginVertical="ms">
        {t('hotspot_settings.pairing.subtitle')}
      </Text>
      {scanComplete &&
        hotspotCount > 0 &&
        keys.map((key) => {
          const hotspot = availableHotspots[key]
          if (!hotspot || !hotspot.name) return null
          return (
            <HotspotItem
              hotspot={hotspot}
              key={hotspot.id}
              onPress={handleConnect(hotspot)}
              connecting={hotspot === selectedHotspot}
              selected={hotspot === selectedHotspot}
              connected={hotspot === selectedHotspot && connected}
            />
          )
        })}

      {scanComplete && hotspotCount === 0 && (
        <Text variant="h4" color="black" marginVertical="ms">
          {t('hotspot_settings.diagnostics.no_hotspots')}
        </Text>
      )}
      {!scanComplete && <CircleLoader marginTop="l" />}
      {scanComplete && (
        <TouchableOpacityBox marginLeft="n_m" onPress={rescan}>
          <Text variant="body1Medium" padding="m" color="purpleMain">
            {t('hotspot_settings.diagnostics.scan_again')}
          </Text>
        </TouchableOpacityBox>
      )}
    </Box>
  )
}

export default HotspotDiagnosticsConnection
