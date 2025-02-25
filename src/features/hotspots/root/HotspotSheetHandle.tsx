import React, { memo, useCallback } from 'react'
import Chevron from '@assets/images/chevron-right.svg'
import { StyleSheet } from 'react-native'
import Box from '../../../components/Box'
import TouchableOpacityBox from '../../../components/TouchableOpacityBox'
import { useAppDispatch } from '../../../store/store'
import hotspotsSlice from '../../../store/hotspots/hotspotsSlice'
import CardHandle from '../../../components/CardHandle'

type Props = { showNav?: boolean }
export const HOTSPOT_SHEET_HANDLE_HEIGHT = 52
const HotspotSheetHandle = ({ showNav = true }: Props) => {
  const dispatch = useAppDispatch()

  const prev = useCallback(() => {
    dispatch(hotspotsSlice.actions.selectPrevHotspot())
  }, [dispatch])

  const next = useCallback(() => {
    dispatch(hotspotsSlice.actions.selectNextHotspot())
  }, [dispatch])

  return (
    <Box
      flexDirection="row"
      flex={1}
      justifyContent={showNav ? 'space-between' : 'center'}
      alignItems="center"
      height={HOTSPOT_SHEET_HANDLE_HEIGHT}
    >
      {showNav && (
        <>
          <TouchableOpacityBox
            onPress={prev}
            paddingHorizontal="m"
            style={styles.prevButton}
          >
            <Chevron color="#C2C5E4" height={20} width={20} />
          </TouchableOpacityBox>
          <CardHandle />
          <TouchableOpacityBox onPress={next} paddingHorizontal="m">
            <Chevron color="#C2C5E4" height={20} width={20} />
          </TouchableOpacityBox>
        </>
      )}
      {!showNav && <CardHandle />}
    </Box>
  )
}

const styles = StyleSheet.create({
  prevButton: { transform: [{ rotate: '180deg' }] },
})

export default memo(HotspotSheetHandle)
