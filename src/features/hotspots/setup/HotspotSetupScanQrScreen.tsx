import React, { useCallback } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import QrIcon from '@assets/images/qr.svg'
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner'
import { useAsync } from 'react-async-hook'
import BackScreen from '../../../components/BackScreen'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
import { HotspotSetupStackParamList } from './hotspotSetupTypes'
import { useColors } from '../../../theme/themeHooks'
import { getSecureItem } from '../../../utils/secureAccount'
import TextTransform from '../../../components/TextTransform'
import { useAppLinkContext } from '../../../providers/AppLinkProvider'

type Route = RouteProp<HotspotSetupStackParamList, 'HotspotSetupScanQrScreen'>

const HotspotSetupScanQrScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const colors = useColors()
  const { result: address } = useAsync(getSecureItem, ['address'])
  const { handleBarCode } = useAppLinkContext()

  const handleBarCodeScanned = useCallback(
    (result: BarCodeScannerResult) => {
      handleBarCode(result, 'add_gateway', { hotspotType: params.hotspotType })
    },
    [handleBarCode, params.hotspotType],
  )

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
        <QrIcon color={colors.purpleMain} width={30} height={22} />
      </Box>
      <Text
        variant="h1"
        numberOfLines={1}
        lineHeight={{ smallPhone: 42, phone: 62 }}
        fontSize={{ smallPhone: 28, phone: 40 }}
        adjustsFontSizeToFit
        marginTop="s"
      >
        {t('hotspot_setup.qrScan.title')}
      </Text>
      <TextTransform
        variant="subtitle"
        fontSize={{ smallPhone: 15, phone: 19 }}
        lineHeight={{ smallPhone: 20, phone: 26 }}
        maxFontSizeMultiplier={1}
        marginVertical={{ smallPhone: 's', phone: 'l' }}
        i18nKey="hotspot_setup.qrScan.subtitle"
        values={{ address }}
      />
      <Box flex={1} />

      <Box borderRadius="xl" overflow="hidden" backgroundColor="greenBright">
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          style={{ width: '100%', aspectRatio: 1 }}
        />
      </Box>
    </BackScreen>
  )
}

export default HotspotSetupScanQrScreen
