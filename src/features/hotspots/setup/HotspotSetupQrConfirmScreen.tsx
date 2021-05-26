import React, { useEffect, useState } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Fingerprint from '@assets/images/fingerprint.svg'
import { AddGatewayV1 } from '@helium/transactions'
import BackScreen from '../../../components/BackScreen'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
import { HotspotSetupStackParamList } from './hotspotSetupTypes'
import { useBreakpoints, useColors } from '../../../theme/themeHooks'
import { getOnboardingRecord } from '../../../utils/stakingClient'
import animateTransition from '../../../utils/animateTransition'

type Route = RouteProp<
  HotspotSetupStackParamList,
  'HotspotSetupQrConfirmScreen'
>

const HotspotSetupQrConfirmScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const colors = useColors()
  const breakpoints = useBreakpoints()
  const [publicKey, setPublicKey] = useState('')
  const [macAddress, setMacAddress] = useState('')
  const [ownerAddress, setOwnerAddress] = useState('')

  useEffect(() => {
    if (!publicKey) return

    const getSetMac = async () => {
      const record = await getOnboardingRecord(publicKey)
      animateTransition('HotspotSetupQrConfirmScreen.SetMac')
      setMacAddress(record.macEth0)
    }
    getSetMac()
  }, [publicKey])

  useEffect(() => {
    if (!params.addGatewayTxn) return

    const addGatewayTxn = AddGatewayV1.fromString(params.addGatewayTxn)

    setPublicKey(addGatewayTxn.gateway?.b58 || '')
    setOwnerAddress(addGatewayTxn.owner?.b58 || '')
  }, [params])

  return (
    <BackScreen
      backgroundColor="primaryBackground"
      paddingTop={{ smallPhone: 's', phone: 'lx' }}
    >
      <Box
        height={52}
        width={52}
        backgroundColor="purple500"
        borderRadius="m"
        alignItems="center"
        justifyContent="center"
      >
        <Fingerprint color={colors.purpleMain} width={26} height={26} />
      </Box>
      <Text
        variant="h1"
        numberOfLines={breakpoints.smallPhone ? 1 : 2}
        adjustsFontSizeToFit
        marginTop="l"
      >
        {breakpoints.smallPhone
          ? t('hotspot_setup.qrConfirm.title_one_line')
          : t('hotspot_setup.qrConfirm.title')}
      </Text>
      <Box
        padding="l"
        backgroundColor="offblack"
        borderTopLeftRadius="s"
        borderTopRightRadius="s"
        marginTop="xl"
        justifyContent="center"
      >
        <Text
          variant="medium"
          color="purpleLight"
          fontSize={16}
          maxFontSizeMultiplier={1}
        >
          {t('hotspot_setup.qrConfirm.public_key')}
        </Text>
        <Text
          variant="mono"
          fontSize={19}
          marginTop="xs"
          maxFontSizeMultiplier={1}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {publicKey}
        </Text>
      </Box>
      <Box
        padding="l"
        backgroundColor="offblack"
        marginTop="xs"
        justifyContent="center"
      >
        <Text
          variant="medium"
          color="purpleLight"
          fontSize={16}
          maxFontSizeMultiplier={1}
        >
          {t('hotspot_setup.qrConfirm.mac_address')}
        </Text>
        <Text
          variant="mono"
          marginTop="xs"
          fontSize={19}
          maxFontSizeMultiplier={1}
        >
          {macAddress}
        </Text>
      </Box>
      <Box
        marginTop="xs"
        backgroundColor="offblack"
        borderBottomLeftRadius="s"
        borderBottomRightRadius="s"
        padding="l"
        justifyContent="center"
      >
        <Text
          variant="medium"
          color="purpleLight"
          fontSize={16}
          maxFontSizeMultiplier={1}
        >
          {t('hotspot_setup.qrConfirm.owner_address')}
        </Text>
        <Text
          variant="mono"
          fontSize={19}
          maxFontSizeMultiplier={1}
          marginTop="xs"
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {ownerAddress}
        </Text>
      </Box>
    </BackScreen>
  )
}

export default HotspotSetupQrConfirmScreen
