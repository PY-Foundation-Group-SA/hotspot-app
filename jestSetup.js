import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock'
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock'

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
)
global.window = {}
global.window = global

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage)
jest.mock('react-native-device-info', () => mockRNDeviceInfo)
