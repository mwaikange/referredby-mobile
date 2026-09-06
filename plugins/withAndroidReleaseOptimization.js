const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

// Persist release optimization when EAS regenerates the ignored Android folder.
module.exports = function withAndroidReleaseOptimization(config) {
  config = withGradleProperties(config, (config) => {
    const properties = {
      'android.enableMinifyInReleaseBuilds': 'true',
      'android.enableShrinkResourcesInReleaseBuilds': 'true',
      'android.enableR8.fullMode': 'true',
      'android.r8.optimizedResourceShrinking': 'true',
    };
    for (const [key, value] of Object.entries(properties)) {
      config.modResults = config.modResults.filter(
        (entry) => entry.type !== 'property' || entry.key !== key
      );
      config.modResults.push({ type: 'property', key, value });
    }
    return config;
  });
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('Release optimization expects the Expo SDK 54 Groovy template.');
    }
    config.modResults.contents = config.modResults.contents.replace(
      /proguard-android\.txt/g,
      'proguard-android-optimize.txt'
    );
    if (!config.modResults.contents.includes('proguard-android-optimize.txt')) {
      throw new Error('Could not enable the optimized Android ProGuard configuration.');
    }
    return config;
  });
};
