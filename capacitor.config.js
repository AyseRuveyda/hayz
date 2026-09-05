/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: "app.hayztakvimi.mobile",
  appName: "Hayz Takvimi",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#FFF7F6",
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#FFF7F6",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#F42566",
    },
  },
};

module.exports = config;
