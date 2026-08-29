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
  },
};

module.exports = config;
