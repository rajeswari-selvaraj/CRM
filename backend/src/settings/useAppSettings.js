const useAppSettings = () => {
  let settings = {};
  settings['idurar_app_email'] = 'rajeswari.selvaraj@axesstechnology.in';
  // settings['idurar_base_url'] = 'https://cloud.idurarapp.com';
  settings['idurar_base_url'] = 'http://localhost:8888/api/';
  return settings;
};

module.exports = useAppSettings;
