import { Platform } from 'react-native';

/* 
IMPORTANTE!!
Deben sustituir las ip por las que tenga su computadora y celular en la misma red local, con ipconfig o ifconfig (mac)
*/ 

export const getServerURL = () => {
  if (__DEV__) {
    // En desarrollo
    if (Platform.OS === 'android') {
      // Para emulador Android: usa 10.0.2.2 (android studio)

      return 'http://192.168.1.65:3000';  //SUSTITUIR POR LAS SUYAS
    } else if (Platform.OS === 'ios') {
      return 'http://192.168.1.65:3000'; //SUSTITUIR POR LAS SUYAS
    }
  }
  // En producción usarías tu servidor real
 // return 'https://tu-servidor-produccion.com';
};

export const API_TIMEOUT = 30000; // 30 segundos