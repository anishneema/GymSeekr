import 'dotenv/config';

module.exports = ({config}) => {

    config.android.package = "com.anish_neema.GymSeekr";
    config.android.config.googleMaps.apiKey = process.env.EXPO_PUBLIC_ANDROID_GOOGLE_MAP_API_KEY;

    config.ios.config.supportsTablet = true;
    config.ios.config.bundleIdentifier = "JR66H6LAVK.com.aneema.GymSeekr";
    config.ios.config.googleMapsApiKey = process.env.EXPO_PUBLIC_IOS_GOOGLE_MAP_API_KEY;
    
    return config;
};
